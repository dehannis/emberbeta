import http from 'node:http'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { WebSocketServer } from 'ws'
import { HumeClient } from 'hume'

// Minimal env loader (so we don't need dotenv)
async function loadDotEnv() {
  const file = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(file)) return
  const raw = fs.readFileSync(file, 'utf8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    let val = trimmed.slice(idx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

// Top-level await is ok in Node ESM
await loadDotEnv()

const PORT = Number(process.env.EVI_PROXY_PORT ?? 8788)
const HUME_API_KEY = process.env.HUME_API_KEY ?? ''
const HUME_EVI_CONFIG_ID = process.env.HUME_EVI_CONFIG_ID ?? ''

// Optional SMS invite support (Twilio or mock). This is separate from Hume EVI.
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID ?? ''
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN ?? ''
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER ?? ''
const SMS_MODE =
  (process.env.EVI_SMS_MODE ?? '').toLowerCase() ||
  (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER ? 'twilio' : 'mock')

if (!HUME_API_KEY) {
  console.warn('[evi-proxy] Missing HUME_API_KEY in .env (required)')
}
if (!HUME_EVI_CONFIG_ID) {
  console.warn('[evi-proxy] Missing HUME_EVI_CONFIG_ID in .env (required to use your saved Ember config)')
}

const hume = new HumeClient({ apiKey: HUME_API_KEY })

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data')
const INVITES_FILE = path.resolve(DATA_DIR, 'share-invites.json')

/** @typedef {'pending'|'accepted'|'declined'} InviteStatus */
/** @typedef {'share'|'admin'} InviteKind */
/** @typedef {{ id: string, kind: InviteKind, requestorName: string, phone: string, status: InviteStatus, createdAt: string, updatedAt: string }} Invite */

/** @returns {Invite[]} */
function loadInvites() {
  try {
    if (!fs.existsSync(INVITES_FILE)) return []
    const raw = fs.readFileSync(INVITES_FILE, 'utf8')
    const parsed = raw ? JSON.parse(raw) : []
    const list = Array.isArray(parsed) ? parsed : []

    // Back-compat for older schema (had `name` and no `kind`)
    return list
      .filter((x) => x && typeof x === 'object')
      .map((x) => ({
        id: typeof x.id === 'string' ? x.id : `inv_${crypto.randomUUID()}`,
        kind: x.kind === 'admin' ? 'admin' : 'share',
        requestorName:
          typeof x.requestorName === 'string'
            ? x.requestorName
            : typeof x.name === 'string'
              ? x.name
              : 'Ember',
        phone: typeof x.phone === 'string' ? x.phone : '',
        status: x.status === 'accepted' ? 'accepted' : x.status === 'declined' ? 'declined' : 'pending',
        createdAt: typeof x.createdAt === 'string' ? x.createdAt : new Date().toISOString(),
        updatedAt: typeof x.updatedAt === 'string' ? x.updatedAt : new Date().toISOString(),
      }))
  } catch {
    return []
  }
}

/** @param {Invite[]} nextInvites */
function saveInvites(nextInvites) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(INVITES_FILE, JSON.stringify(nextInvites, null, 2), 'utf8')
  } catch {
    // ignore
  }
}

let invites = loadInvites()

function normalizePhone(raw) {
  if (typeof raw !== 'string') return ''
  // Keep it simple: assume E.164 for real SMS providers (+1..., +44..., etc)
  return raw.trim()
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks)
}

async function parseJson(req) {
  const buf = await readBody(req)
  if (!buf.length) return null
  try {
    return JSON.parse(buf.toString('utf8'))
  } catch {
    return null
  }
}

async function parseForm(req) {
  const buf = await readBody(req)
  const txt = buf.toString('utf8')
  const params = new URLSearchParams(txt)
  const out = {}
  for (const [k, v] of params.entries()) out[k] = v
  return out
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
  })
  res.end(JSON.stringify(payload))
}

async function sendSms({ to, kind, requestorName }) {
  const body =
    kind === 'admin'
      ? `Ember: ${requestorName} requests admin access to help build your timeline. Reply Y to approve, N to decline.`
      : `Ember: ${requestorName} wants to share with you. Reply Y to accept, N to decline.`

  if (SMS_MODE !== 'twilio') {
    console.log(`[sms:mock] To=${to} Body="${body}"`)
    return { ok: true, mode: 'mock' }
  }

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return { ok: false, error: 'Missing TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER' }
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')
  const form = new URLSearchParams()
  form.set('From', TWILIO_FROM_NUMBER)
  form.set('To', to)
  form.set('Body', body)

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    return { ok: false, error: `Twilio send failed (${resp.status}): ${text}` }
  }

  return { ok: true, mode: 'twilio' }
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400)
    res.end('bad request')
    return
  }

  // CORS preflight for our JSON endpoints.
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'content-type',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
    })
    res.end()
    return
  }

  if (req.url.startsWith('/health')) {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ ok: true }))
    return
  }

  // --- Share invite verification API ---
  if (req.url === '/api/share/invite' && req.method === 'POST') {
    ;(async () => {
      const body = await parseJson(req)
      const requestorName = typeof body?.name === 'string' ? body.name.trim() : ''
      const phone = normalizePhone(body?.phone)
      if (!requestorName || !phone) {
        sendJson(res, 400, { ok: false, error: 'Missing name or phone' })
        return
      }

      const now = new Date().toISOString()
      const inviteId = `inv_${crypto.randomUUID()}`
      /** @type {Invite} */
      const invite = { id: inviteId, kind: 'share', requestorName, phone, status: 'pending', createdAt: now, updatedAt: now }
      invites = [...invites, invite]
      saveInvites(invites)

      try {
        const sms = await sendSms({ to: phone, kind: invite.kind, requestorName })
        sendJson(res, 200, { ok: true, inviteId, status: invite.status, sms })
      } catch (e) {
        sendJson(res, 200, { ok: true, inviteId, status: invite.status, sms: { ok: false, error: String(e) } })
      }
    })()
    return
  }

  // --- Admin access request API ---
  if (req.url === '/api/share/admin-request' && req.method === 'POST') {
    ;(async () => {
      const body = await parseJson(req)
      const requestorName = typeof body?.requestorName === 'string' ? body.requestorName.trim() : 'Ember'
      const phone = normalizePhone(body?.phone)
      if (!phone) {
        sendJson(res, 400, { ok: false, error: 'Missing phone' })
        return
      }

      const now = new Date().toISOString()
      const inviteId = `inv_${crypto.randomUUID()}`
      /** @type {Invite} */
      const invite = { id: inviteId, kind: 'admin', requestorName, phone, status: 'pending', createdAt: now, updatedAt: now }
      invites = [...invites, invite]
      saveInvites(invites)

      try {
        const sms = await sendSms({ to: phone, kind: invite.kind, requestorName })
        sendJson(res, 200, { ok: true, inviteId, status: invite.status, sms })
      } catch (e) {
        sendJson(res, 200, { ok: true, inviteId, status: invite.status, sms: { ok: false, error: String(e) } })
      }
    })()
    return
  }

  if (req.url.startsWith('/api/share/invites') && req.method === 'GET') {
    sendJson(res, 200, { ok: true, invites })
    return
  }

  // Twilio inbound webhook (requires a public URL; use ngrok for local dev).
  if (req.url === '/api/sms/inbound' && req.method === 'POST') {
    ;(async () => {
      const form = await parseForm(req)
      const from = normalizePhone(form.From)
      const msg = typeof form.Body === 'string' ? form.Body.trim().toLowerCase() : ''

      const decision = msg.startsWith('y') ? 'accepted' : msg.startsWith('n') ? 'declined' : null
      if (!from || !decision) {
        res.writeHead(200, { 'content-type': 'text/xml' })
        res.end(
          `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Reply Y to accept/approve, N to decline.</Message></Response>`,
        )
        return
      }

      // Update the most recent pending invite for this number.
      const idx = [...invites]
        .map((inv, i) => ({ inv, i }))
        .reverse()
        .find((x) => x.inv.phone === from && x.inv.status === 'pending')?.i

      if (idx === undefined) {
        res.writeHead(200, { 'content-type': 'text/xml' })
        res.end(
          `<?xml version="1.0" encoding="UTF-8"?><Response><Message>No pending request found.</Message></Response>`,
        )
        return
      }

      const now = new Date().toISOString()
      invites[idx] = { ...invites[idx], status: decision, updatedAt: now }
      saveInvites(invites)

      const kind = invites[idx]?.kind
      const reply =
        kind === 'admin'
          ? decision === 'accepted'
            ? 'Admin access approved.'
            : 'Admin access declined.'
          : decision === 'accepted'
            ? "Thanks — you're now connected with Ember."
            : 'Okay — invite declined.'

      res.writeHead(200, { 'content-type': 'text/xml' })
      res.end(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>${reply}</Message></Response>`)
    })()
    return
  }

  res.writeHead(404)
  res.end('not found')
})

const wss = new WebSocketServer({ server, path: '/evi' })

function handleFatalServerError(err) {
  if (err && typeof err === 'object' && 'code' in err && err.code === 'EADDRINUSE') {
    console.error(`[evi-proxy] Port ${PORT} is already in use.`)
    console.error(`[evi-proxy] Set EVI_PROXY_PORT in .env to a free port, e.g. EVI_PROXY_PORT=8788`)
    console.error(
      `[evi-proxy] If you change the port, also set VITE_EVI_PROXY_WS for the frontend, e.g. VITE_EVI_PROXY_WS=ws://localhost:8788/evi`,
    )
    process.exit(1)
  }
  console.error('[evi-proxy] server error', err)
  process.exit(1)
}

// Simple logging toggle
const LOG = (process.env.EVI_PROXY_LOG ?? '0') === '1'
const log = (...args) => {
  if (LOG) console.log('[evi-proxy]', ...args)
}

wss.on('connection', (clientWs, req) => {
  const clientAddr = req.socket?.remoteAddress ?? 'unknown'
  log('client connected', clientAddr)

  const closeBoth = (code = 1000, reason = 'closing') => {
    try {
      if (clientWs.readyState === clientWs.OPEN) clientWs.close(code, reason)
    } catch {
      // ignore
    }
    try {
      evi?.close()
    } catch {
      // ignore
    }
  }

  const evi = hume.empathicVoice.chat.connect({
    configId: HUME_EVI_CONFIG_ID || undefined,
    // Some accounts/environments require this flag to permit connection.
    allowConnection: true,
    // Tell EVI we're sending PCM linear16 @ 16kHz mono (matches our mic pipeline).
    sessionSettings: { audio: { encoding: 'linear16', sampleRate: 16000, channels: 1 } },
  })

  let eviIsOpen = false
  const pendingPublishes = []

  evi.on('open', () => {
    log('hume evi socket open')
    eviIsOpen = true
    try {
      clientWs.send(JSON.stringify({ type: 'proxy_status', status: 'connected' }))
    } catch {
      // ignore
    }

    // Flush any messages we received from the browser before EVI was open.
    if (pendingPublishes.length > 0) {
      for (const publish of pendingPublishes.splice(0, pendingPublishes.length)) {
        try {
          evi.sendPublish(publish)
        } catch {
          // ignore
        }
      }
    }
  })

  evi.on('message', (message) => {
    try {
      if (clientWs.readyState !== clientWs.OPEN) return
      clientWs.send(JSON.stringify(message))
    } catch (e) {
      log('failed forwarding from hume->client', String(e))
    }
  })

  evi.on('close', (event) => {
    log('hume evi socket closed', event?.code ?? 'unknown')
    eviIsOpen = false
    try {
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(JSON.stringify({ type: 'proxy_status', status: 'disconnected', code: event?.code }))
      }
    } catch {
      // ignore
    }
    closeBoth(1000, 'hume closed')
  })

  evi.on('error', (err) => {
    console.error('[evi-proxy] hume evi socket error', err)
    try {
      if (clientWs.readyState === clientWs.OPEN) {
        clientWs.send(
          JSON.stringify({ type: 'proxy_error', message: 'Hume connection error. Check .env and config_id.' }),
        )
      }
    } catch {
      // ignore
    }
    closeBoth(1011, 'hume error')
  })

  clientWs.on('message', (data) => {
    // Browser -> Hume (we accept either raw EVI publish events or a minimal subset).
    try {
      const parsed = JSON.parse(String(data))

      if (parsed?.type === 'audio_input' && typeof parsed?.data === 'string') {
        if (!eviIsOpen) {
          pendingPublishes.push({ type: 'audio_input', data: parsed.data })
          if (pendingPublishes.length > 50) pendingPublishes.shift()
          return
        }
        evi.sendAudioInput({ data: parsed.data })
        return
      }
      if (parsed?.type === 'user_input' && typeof parsed?.text === 'string') {
        if (!eviIsOpen) {
          pendingPublishes.push({ type: 'user_input', text: parsed.text })
          if (pendingPublishes.length > 50) pendingPublishes.shift()
          return
        }
        evi.sendUserInput(parsed.text)
        return
      }
      if (parsed?.type === 'session_settings') {
        // Allow frontend to override/extend session settings if desired.
        const { type, ...rest } = parsed
        if (!eviIsOpen) {
          pendingPublishes.push({ type: 'session_settings', ...rest })
          if (pendingPublishes.length > 50) pendingPublishes.shift()
          return
        }
        evi.sendSessionSettings(rest)
        return
      }

      // Last resort passthrough (local-only).
      if (parsed?.type && typeof parsed.type === 'string') {
        if (!eviIsOpen) {
          pendingPublishes.push(parsed)
          if (pendingPublishes.length > 50) pendingPublishes.shift()
          return
        }
        evi.sendPublish(parsed)
      }
    } catch (e) {
      log('failed handling client message', String(e))
    }
  })

  clientWs.on('close', (code, reason) => {
    log('client closed', code, String(reason))
    closeBoth(1000, 'client closed')
  })

  clientWs.on('error', (err) => {
    console.error('[evi-proxy] client ws error', err)
    closeBoth(1011, 'client error')
  })

  // Initiate connection to EVI now that the client is connected.
  // IMPORTANT: do NOT call evi.connect() (it re-attaches event listeners and duplicates messages).
  evi.socket.reconnect()
})

server.on('error', handleFatalServerError)
wss.on('error', handleFatalServerError)

server.listen(PORT, () => {
  console.log(`[evi-proxy] listening on http://localhost:${PORT}`)
  console.log(`[evi-proxy] ws endpoint: ws://localhost:${PORT}/evi`)
  console.log('[evi-proxy] using official Hume SDK for EVI websocket')
  console.log(`[evi-proxy] sms mode: ${SMS_MODE}`)
  if (SMS_MODE === 'twilio') console.log('[evi-proxy] sms inbound webhook: POST /api/sms/inbound')
})
