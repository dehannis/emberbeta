import http from 'node:http'
import { WebSocketServer } from 'ws'
import { HumeClient } from 'hume'

// Minimal env loader (so we don't need dotenv)
async function loadDotEnv() {
  const fs = await import('node:fs')
  const path = await import('node:path')
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

if (!HUME_API_KEY) {
  console.warn('[evi-proxy] Missing HUME_API_KEY in .env (required)')
}
if (!HUME_EVI_CONFIG_ID) {
  console.warn('[evi-proxy] Missing HUME_EVI_CONFIG_ID in .env (required to use your saved Ember config)')
}

const hume = new HumeClient({ apiKey: HUME_API_KEY })

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(400)
    res.end('bad request')
    return
  }
  if (req.url.startsWith('/health')) {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ ok: true }))
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
    console.error(`[evi-proxy] If you change the port, also set VITE_EVI_PROXY_WS for the frontend, e.g. VITE_EVI_PROXY_WS=ws://localhost:8788/evi`)
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
    // Tell EVI we're sending PCM linear16 @ 16kHz mono (matches our mic pipeline).
    sessionSettings: { audio: { encoding: 'linear16', sampleRate: 16000, channels: 1 } },
  })

  evi.on('open', () => {
    log('hume evi socket open')
    try {
      clientWs.send(JSON.stringify({ type: 'proxy_status', status: 'connected' }))
    } catch {
      // ignore
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
        clientWs.send(JSON.stringify({ type: 'proxy_error', message: 'Hume connection error. Check .env and config_id.' }))
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
        evi.sendAudioInput({ data: parsed.data })
        return
      }
      if (parsed?.type === 'user_input' && typeof parsed?.text === 'string') {
        evi.sendUserInput(parsed.text)
        return
      }
      if (parsed?.type === 'session_settings') {
        // Allow frontend to override/extend session settings if desired.
        const { type, ...rest } = parsed
        evi.sendSessionSettings(rest)
        return
      }

      // Last resort passthrough (local-only).
      if (parsed?.type && typeof parsed.type === 'string') {
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
  evi.connect()
})

server.on('error', handleFatalServerError)
wss.on('error', handleFatalServerError)

server.listen(PORT, () => {
  console.log(`[evi-proxy] listening on http://localhost:${PORT}`)
  console.log(`[evi-proxy] ws endpoint: ws://localhost:${PORT}/evi`)
  console.log('[evi-proxy] using official Hume SDK for EVI websocket')
})


