import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Header from '../components/Header'
import './Accounts.css'

type TopicMode = 'home' | 'advice' | 'hardest' | 'recipe' | 'belief' | 'custom'
type Relationship =
  | 'mother'
  | 'father'
  | 'grandmother'
  | 'grandfather'
  | 'brother'
  | 'sister'
  | 'son'
  | 'daughter'
  | 'cousin'
  | 'friend'
  | 'other'

interface SharingContact {
  id: string
  name: string
  phone: string
  accountRole?: 'admin' | 'regular'
  birthYear?: string
  relationship: Relationship
  verificationStatus?: 'unverified' | 'pending' | 'accepted' | 'declined' | 'error'
  inviteId?: string
  nextCallEveryDays: number
  nextCallDate: string
  nextCallTime: string
  nextCallTimeZone: string
  nextCallLanguage: string
  nextCallVoice: string
  nextCallTopicMode: TopicMode
  nextCallPrompt: string
}

const CONTACTS_KEY = 'emberContactsV1'
const SHARE_PREFILL_KEY = 'emberSharePrefillContactV1'
const VERIFY_API_BASE = (import.meta as any).env?.VITE_EVI_PROXY_HTTP ?? 'http://localhost:8788'
const ACCOUNT_DATA_KEY = 'emberAccountData'
const ACCOUNT_NEXT_CALL_KEY = 'emberAccountNextCallV1'
const SELF_ID = 'me'
const SELF_PHONE = '+1-781-915-9663'


const inviteUrlFor = (inviteId?: string) => {
  const digits = typeof inviteId === 'string' ? (inviteId.match(/\d+/g) || []).join('') : ''
  const code = digits || '4271993'
  return `https://ember.build/${code}`
}

const autoResizeTextarea = (el: HTMLTextAreaElement | null) => {
  if (!el) return
  // Mobile-safe autosize: shrink first, then grow to fit content.
  // Using 0px (vs "auto") avoids Safari cases where it won’t shrink correctly.
  el.style.height = '0px'
  el.style.height = `${el.scrollHeight}px`
}

const Accounts: React.FC = () => {
  useEffect(() => {
    // If Topics "Add new" deep-links here, scroll directly to the add-new form.
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('addNew') !== '1') return
      // Wait a frame so layout is ready.
      requestAnimationFrame(() => {
        const el = document.getElementById('accounts-add-new')
        el?.scrollIntoView({ block: 'start', behavior: 'smooth' })
      })
    } catch {
      // ignore
    }
  }, [])
  const defaultTopicNotes = (name: string, mode: TopicMode) => {
    const n = name.trim() || 'They'
    const isHe = n.toLowerCase().includes('hank') || n.toLowerCase().includes('suchan')
    const p = isHe ? 'he' : 'they'

    if (mode === 'recipe') {
      return (
        `Topic: The Recipe That Raised Us\n` +
        `This is a powerful topic because food is memory—smell, texture, and ritual can bring an entire chapter of life back instantly.\n\n` +
        `Ember will ask ${n}:\n` +
        `- What is the meal, and who made it most often?\n` +
        `- Where were you when you ate it—what did the room look and sound like?\n` +
        `- What did it mean in your family (comfort, celebration, survival, love)?\n` +
        `- Tell a specific moment: one day you remember vividly, and why.\n` +
        `- If someone you love tasted it today, what would you want them to understand about you?`
      )
    }

    if (mode === 'advice') {
      return (
        `Topic: The Best Advice I Ever Got\n` +
        `This is a powerful topic because advice reveals who shaped you, what you feared, and what you chose to carry forward.\n\n` +
        `Ember will ask ${n}:\n` +
        `- What’s the best advice you received—and who gave it?\n` +
        `- What was happening in ${p}'s life when ${p} heard it?\n` +
        `- Tell a moment ${p} relied on it and it helped.\n` +
        `- What’s advice ${p} followed that was wrong for ${p}?\n` +
        `- What does ${p} hope your family carries forward from what ${p} learned?`
      )
    }

    if (mode === 'hardest') {
      return (
        `Topic: The Hardest Thing I’ve Ever Done\n` +
        `This is a powerful topic because the real “map” of a hard season can become a quiet inheritance—how to endure without losing yourself.\n\n` +
        `Ember will ask ${n}:\n` +
        `- What hard season can ${p} name today?\n` +
        `- What did “hard” look like day-to-day?\n` +
        `- What helped ${p} stay standing?\n` +
        `- Was there a turning point when things began to shift?\n` +
        `- What would ${p} tell someone ${p} loves facing something similar?`
      )
    }

    if (mode === 'belief') {
      return (
        `Topic: What I Believe About Life\n` +
        `This is a powerful topic because naming earned beliefs gives your family principles with a human voice behind them.\n\n` +
        `Ember will ask ${n}:\n` +
        `- What’s one belief ${p} holds now that ${p} didn’t at 20?\n` +
        `- What experience taught it?\n` +
        `- What do people chase that doesn’t satisfy?\n` +
        `- What matters more than most people admit?\n` +
        `- If a younger person asked “How should I live?”, what would ${p} say?`
      )
    }

    return (
      `Topic: The Home I Grew Up In\n` +
      `This is a powerful topic because places hold the blueprint of who we became—our first routines, relationships, fears, and joys.\n\n` +
      `Ember will ask ${n}:\n` +
      `- Describe arriving home—what you saw first, and what you felt.\n` +
      `- Walk room by room: what happened in the kitchen, living room, and your bedroom?\n` +
      `- Who lived there with you, and what were they like in that season?\n` +
      `- What was a small detail ${p} can still picture (a sound, a smell, a corner)?\n` +
      `- Share one story from that house that shaped ${p}—and what ${p} carries forward today.`
    )
  }

  const SEEDED_SUCHAN: SharingContact = useMemo(
    () => ({
      id: 'c-suchan',
      name: 'Suchan Chae',
      phone: '7819159663',
      accountRole: 'admin',
      birthYear: '1955',
      relationship: 'father',
      verificationStatus: 'accepted',
      nextCallEveryDays: 1,
      nextCallDate: '',
      nextCallTime: '18:00',
      nextCallTimeZone: 'America/Los_Angeles',
      nextCallLanguage: 'English',
      nextCallVoice: 'female',
      nextCallTopicMode: 'home',
      nextCallPrompt: defaultTopicNotes('Suchan Chae', 'home'),
    }),
    [],
  )

  const DEFAULT_CONTACTS: SharingContact[] = useMemo(
    () => [
      SEEDED_SUCHAN,
      {
        id: 'c-2',
        name: 'Hank Lee',
        phone: '+1-555-987-6543',
        birthYear: '',
        relationship: 'other',
        verificationStatus: 'accepted',
        nextCallEveryDays: 1,
        nextCallDate: '',
        nextCallTime: '18:00',
        nextCallTimeZone: 'America/Los_Angeles',
        nextCallLanguage: 'English',
        nextCallVoice: 'female',
        nextCallTopicMode: 'recipe',
        nextCallPrompt: defaultTopicNotes('Hank Lee', 'recipe'),
      },
    ],
    [SEEDED_SUCHAN],
  )

  const TIME_ZONES = useMemo(
    () =>
      [
        { value: 'America/Los_Angeles', label: 'PT', short: 'PT' },
        { value: 'America/Denver', label: 'MT', short: 'MT' },
        { value: 'America/Chicago', label: 'CT', short: 'CT' },
        { value: 'America/New_York', label: 'ET', short: 'ET' },
        { value: 'Europe/London', label: 'UK', short: 'UK' },
        { value: 'Asia/Seoul', label: 'KST', short: 'KST' },
        { value: 'Asia/Tokyo', label: 'JST', short: 'JST' },
        { value: 'America/Sao_Paulo', label: 'BRT', short: 'BRT' },
        { value: 'America/Mexico_City', label: 'MX', short: 'MX' },
        { value: 'UTC', label: 'UTC', short: 'UTC' },
      ] as const,
    [],
  )

  const tzShort = (tz: string) => TIME_ZONES.find((t) => t.value === tz)?.short ?? tz

  const RELATIONSHIP_OPTIONS = useMemo(
    () =>
      [
        { value: 'mother', label: 'Mother' },
        { value: 'father', label: 'Father' },
        { value: 'brother', label: 'Brother' },
        { value: 'sister', label: 'Sister' },
        { value: 'son', label: 'Son' },
        { value: 'daughter', label: 'Daughter' },
        { value: 'grandmother', label: 'Grandmother' },
        { value: 'grandfather', label: 'Grandfather' },
        { value: 'cousin', label: 'Cousin' },
        { value: 'friend', label: 'Friend' },
        { value: 'other', label: 'Other' },
      ] as const,
    [],
  )

  const LANGUAGE_OPTIONS = useMemo(
    () =>
      [
        { value: 'English', label: 'English' },
        { value: 'Spanish', label: 'Spanish' },
        { value: 'Korean', label: 'Korean' },
        { value: 'Japanese', label: 'Japanese' },
        { value: 'Portuguese', label: 'Portuguese' },
      ] as const,
    [],
  )

  const VOICE_OPTIONS = useMemo(
    () =>
      [
        { value: 'female', label: 'Female' },
        { value: 'male', label: 'Male' },
      ] as const,
    [],
  )

  const normalizeRelationship = (raw: unknown): Relationship => {
    if (typeof raw !== 'string') return 'other'
    const v = raw.trim().toLowerCase()
    const ok = new Set<Relationship>([
      'mother',
      'father',
      'grandmother',
      'grandfather',
      'brother',
      'sister',
      'son',
      'daughter',
      'cousin',
      'friend',
      'other',
    ])
    return ok.has(v as Relationship) ? (v as Relationship) : 'other'
  }

  const [contacts, setContacts] = useState<SharingContact[]>([])
  const [savedContacts, setSavedContacts] = useState<SharingContact[]>([])
  const [selfContact, setSelfContact] = useState<SharingContact>(() => ({
    id: SELF_ID,
    name: 'Ember User',
    phone: SELF_PHONE,
    accountRole: 'admin',
    birthYear: '',
    relationship: 'other',
    verificationStatus: 'accepted',
    nextCallEveryDays: 1,
    nextCallDate: '',
    nextCallTime: '18:00',
    nextCallTimeZone: 'America/Los_Angeles',
    nextCallLanguage: 'English',
    nextCallVoice: 'female',
    nextCallTopicMode: 'home',
    nextCallPrompt: '',
  }))
  const [savedSelfContact, setSavedSelfContact] = useState<SharingContact>(() => ({
    id: SELF_ID,
    name: 'Ember User',
    phone: SELF_PHONE,
    accountRole: 'admin',
    birthYear: '',
    relationship: 'other',
    verificationStatus: 'accepted',
    nextCallEveryDays: 1,
    nextCallDate: '',
    nextCallTime: '18:00',
    nextCallTimeZone: 'America/Los_Angeles',
    nextCallLanguage: 'English',
    nextCallVoice: 'female',
    nextCallTopicMode: 'home',
    nextCallPrompt: '',
  }))
  const didHydrateContactsRef = useRef(false)
  const didProcessPrefillRef = useRef(false)
  const [expandedById, setExpandedById] = useState<Record<string, boolean>>({})
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)
  const [adminAccessRequestTarget, setAdminAccessRequestTarget] = useState<SharingContact | null>(null)
  const INVITES_REMAINING_KEY = 'emberInviteRemainingV1'
  const [invitesRemaining, setInvitesRemaining] = useState<number>(() => {
    try {
      const raw = localStorage.getItem(INVITES_REMAINING_KEY)
      const n = raw ? Number(JSON.parse(raw)) : 5
      return Number.isFinite(n) ? Math.max(0, Math.min(99, Math.floor(n))) : 5
    } catch {
      return 5
    }
  })
  const [copiedInviteForId, setCopiedInviteForId] = useState<string | null>(null)
  // Allow the "days" field to be temporarily empty while typing (mobile-friendly).
  const [daysDraftById, setDaysDraftById] = useState<Record<string, string>>({})
  const [form, setForm] = useState<Omit<SharingContact, 'id'>>({
    name: '',
    accountRole: 'regular',
    phone: '',
    birthYear: '',
    relationship: 'mother',
    nextCallEveryDays: 1,
    nextCallDate: '',
    nextCallTime: '18:00',
    nextCallTimeZone: 'America/Los_Angeles',
    nextCallLanguage: 'English',
    nextCallVoice: 'female',
    nextCallTopicMode: 'home',
    nextCallPrompt: '',
  })

  useLayoutEffect(() => {
    // Keep all "Topic of Next Call" textareas sized to their content.
    document
      .querySelectorAll<HTMLTextAreaElement>('textarea.sharing-control--notes')
      .forEach((el) => autoResizeTextarea(el))
  }, [contacts])

  useEffect(() => {
    // On mobile, line-wrapping changes with viewport width/keyboard/orientation,
    // so we need to recompute textarea heights even when the text hasn't changed.
    const resizeAll = () => {
      document
        .querySelectorAll<HTMLTextAreaElement>('textarea.sharing-control--notes')
        .forEach((el) => autoResizeTextarea(el))
    }

    const onResize = () => {
      // Wait a tick so layout settles (esp. iOS Safari + virtual keyboard).
      requestAnimationFrame(() => resizeAll())
      setTimeout(resizeAll, 0)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    window.visualViewport?.addEventListener('resize', onResize)

    // Initial pass.
    onResize()

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
    }
  }, [])

  // Hydrate "self" (Ember user) from account storage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ACCOUNT_DATA_KEY)
      const parsed: any = raw ? JSON.parse(raw) : null
      const name = typeof parsed?.name === 'string' ? parsed.name : 'Ember User'
      const birthYear = typeof parsed?.birthYear === 'string' ? parsed.birthYear : ''
      const language = typeof parsed?.language === 'string' ? parsed.language : 'English'
      const voice = typeof parsed?.voice === 'string' ? parsed.voice : 'female'

      const nextRaw = localStorage.getItem(ACCOUNT_NEXT_CALL_KEY)
      const nextParsed: any = nextRaw ? JSON.parse(nextRaw) : null
      const nextCallEveryDays = Number.isFinite(nextParsed?.everyDays) ? Math.max(0, Math.min(99, Math.floor(nextParsed.everyDays))) : 1
      const nextCallTime = typeof nextParsed?.time === 'string' ? nextParsed.time : '18:00'
      const nextCallTimeZone = typeof nextParsed?.timeZone === 'string' ? nextParsed.timeZone : 'America/Los_Angeles'
      const topicMode = (() => {
        const rawMode = String(nextParsed?.topicMode ?? '').toLowerCase()
        if (rawMode === 'custom') return 'custom'
        if (rawMode === 'recipe') return 'recipe'
        if (rawMode === 'advice') return 'advice'
        if (rawMode === 'hardest') return 'hardest'
        if (rawMode === 'belief') return 'belief'
        if (rawMode === 'meal') return 'recipe'
        if (rawMode === 'house' || rawMode === 'biography') return 'home'
        if (rawMode === 'home') return 'home'
        return 'home'
      })() as TopicMode
      const nextCallPrompt =
        typeof nextParsed?.prompt === 'string' && nextParsed.prompt.trim()
          ? nextParsed.prompt
          : (topicMode === 'custom' ? '' : defaultTopicNotes(name, topicMode))

      const hydrated: SharingContact = {
        id: SELF_ID,
        name,
        phone: SELF_PHONE,
        accountRole: 'admin',
        birthYear,
        relationship: 'other',
        verificationStatus: 'accepted',
        nextCallEveryDays,
        nextCallDate: '',
        nextCallTime,
        nextCallTimeZone,
        nextCallLanguage: language,
        nextCallVoice: voice,
        nextCallTopicMode: topicMode,
        nextCallPrompt,
      }
      setSelfContact(hydrated)
      setSavedSelfContact(hydrated)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONTACTS_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const list = Array.isArray(parsed) ? parsed : null
      if (!list || list.length === 0) {
        setContacts(DEFAULT_CONTACTS)
        setSavedContacts(DEFAULT_CONTACTS)
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(DEFAULT_CONTACTS))
        didHydrateContactsRef.current = true
        return
      }

      const cleaned: SharingContact[] = list
        .filter((c: any) => c && typeof c.name === 'string' && typeof c.phone === 'string')
        .map((c: any, idx: number) => ({
          id: typeof c.id === 'string' ? c.id : `c-${idx + 1}`,
          name: c.name,
          phone: c.phone,
          accountRole:
            c.accountRole === 'admin'
              ? 'admin'
              : (typeof c.name === 'string' && c.name.toLowerCase().includes('suchan') ? 'admin' : 'regular'),
          birthYear: typeof c.birthYear === 'string' ? c.birthYear : '',
          relationship: normalizeRelationship(c.relationship),
          verificationStatus:
            typeof c.verificationStatus === 'string'
              ? (c.verificationStatus as SharingContact['verificationStatus'])
              : 'accepted',
          inviteId: typeof c.inviteId === 'string' ? c.inviteId : undefined,
          nextCallEveryDays:
            typeof c.nextCallEveryDays === 'number' && Number.isFinite(c.nextCallEveryDays) ? c.nextCallEveryDays : 1,
          nextCallDate: typeof c.nextCallDate === 'string' ? c.nextCallDate : '',
          nextCallTime:
            typeof c.nextCallTime === 'string' && c.nextCallTime.trim() ? c.nextCallTime : '18:00',
          nextCallTimeZone:
            typeof c.nextCallTimeZone === 'string' && c.nextCallTimeZone.trim()
              ? c.nextCallTimeZone
              : 'America/Los_Angeles',
          nextCallLanguage: typeof c.nextCallLanguage === 'string' ? c.nextCallLanguage : 'English',
          nextCallVoice: typeof c.nextCallVoice === 'string' ? c.nextCallVoice : 'female',
          nextCallTopicMode: (() => {
            const rawMode = String(c.nextCallTopicMode ?? '').toLowerCase()
            if (rawMode === 'custom') return 'custom'
            if (rawMode === 'home') return 'home'
            if (rawMode === 'recipe') return 'recipe'
            if (rawMode === 'advice') return 'advice'
            if (rawMode === 'hardest') return 'hardest'
            if (rawMode === 'belief') return 'belief'
            // Migrations / legacy values
            if (rawMode === 'meal') return 'recipe'
            if (rawMode === 'house' || rawMode === 'biography') return 'home'
            return 'home'
          })() as TopicMode,
          nextCallPrompt:
            typeof c.nextCallPrompt === 'string' && c.nextCallPrompt.trim()
              ? c.nextCallPrompt
              : ((c.nextCallTopicMode === 'custom'
                  ? ''
                  : defaultTopicNotes(
                      c.name,
                      (() => {
                        const rawMode = String(c.nextCallTopicMode ?? '').toLowerCase()
                        if (rawMode === 'custom') return 'custom'
                        if (rawMode === 'home') return 'home'
                        if (rawMode === 'recipe') return 'recipe'
                        if (rawMode === 'advice') return 'advice'
                        if (rawMode === 'hardest') return 'hardest'
                        if (rawMode === 'belief') return 'belief'
                        if (rawMode === 'meal') return 'recipe'
                        if (rawMode === 'house' || rawMode === 'biography') return 'home'
                        return 'home'
                      })() as TopicMode,
                    )) as string),
        }))
      // Ensure Suchan is always present and normalized to the desired prefill.
      const hasSuchan = cleaned.some(
        (c) =>
          (c.id === SEEDED_SUCHAN.id) ||
          (typeof c.name === 'string' && c.name.toLowerCase().includes('suchan')) ||
          (String(c.phone || '').replace(/\D/g, '') === '7819159663'),
      )
      const nextCleaned = hasSuchan
        ? cleaned.map((c) => {
            const isSuchan =
              c.id === SEEDED_SUCHAN.id ||
              (typeof c.name === 'string' && c.name.toLowerCase().includes('suchan')) ||
              String(c.phone || '').replace(/\D/g, '') === '7819159663'
            if (!isSuchan) return c
            const patched: SharingContact = {
              ...c,
              id: SEEDED_SUCHAN.id,
              name: SEEDED_SUCHAN.name,
              phone: SEEDED_SUCHAN.phone,
              accountRole: 'admin' as const,
              verificationStatus: 'accepted' as const,
              relationship: 'father' as const,
              birthYear: '1955',
            }
            return patched
          })
        : [SEEDED_SUCHAN, ...cleaned]
      // If we auto-filled defaults, persist them so the UI doesn't show as "dirty".
      persistContacts(nextCleaned)
      didHydrateContactsRef.current = true
    } catch {
      setContacts(DEFAULT_CONTACTS)
      setSavedContacts(DEFAULT_CONTACTS)
      didHydrateContactsRef.current = true
      try {
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(DEFAULT_CONTACTS))
      } catch {
        // ignore
      }
    }
  }, [DEFAULT_CONTACTS])

  // By default, keep all accounts collapsed on initial load.

  const relationshipLabel = useCallback(
    (rel: Relationship) => RELATIONSHIP_OPTIONS.find((o) => o.value === rel)?.label ?? 'Other',
    [RELATIONSHIP_OPTIONS],
  )

  const persistContacts = (next: SharingContact[]) => {
    setContacts(next)
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(next))
      setSavedContacts(next)
    } catch {
      // ignore
    }
  }

  const persistSelf = (next: SharingContact) => {
    setSelfContact(next)
    try {
      localStorage.setItem(
        ACCOUNT_DATA_KEY,
        JSON.stringify({
          name: next.name,
          birthYear: next.birthYear ?? '',
          language: next.nextCallLanguage,
          voice: next.nextCallVoice,
        }),
      )
    } catch {
      // ignore
    }
    try {
      localStorage.setItem(
        ACCOUNT_NEXT_CALL_KEY,
        JSON.stringify({
          everyDays: next.nextCallEveryDays,
          time: next.nextCallTime,
          timeZone: next.nextCallTimeZone,
          topicMode: next.nextCallTopicMode,
          prompt: next.nextCallPrompt,
        }),
      )
    } catch {
      // ignore
    }
    setSavedSelfContact(next)
  }

  // If a different page wants to kick off the "pending verification" flow, it can set this prefill key.
  // We process it once after contacts hydrate so it uses the same invite creation logic as Share.
  useEffect(() => {
    if (!didHydrateContactsRef.current) return
    if (didProcessPrefillRef.current) return

    let payload: any = null
    try {
      const raw = localStorage.getItem(SHARE_PREFILL_KEY)
      payload = raw ? JSON.parse(raw) : null
    } catch {
      payload = null
    }
    if (!payload || typeof payload?.name !== 'string' || typeof payload?.phone !== 'string') {
      didProcessPrefillRef.current = true
      try {
        localStorage.removeItem(SHARE_PREFILL_KEY)
      } catch {
        // ignore
      }
      return
    }

    didProcessPrefillRef.current = true
    try {
      localStorage.removeItem(SHARE_PREFILL_KEY)
    } catch {
      // ignore
    }

    // Prime the form for UI consistency, then trigger invite flow.
    setForm((prev) => ({ ...prev, name: payload.name, phone: payload.phone }))
    addContactWith(payload.name, payload.phone)
  }, [contacts])

  const setContactsAndStore = (next: SharingContact[]) => {
    setContacts(next)
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  // Poll backend for invite status if any contacts are pending.
  useEffect(() => {
    const hasPending = contacts.some((c) => c.verificationStatus === 'pending')
    if (!hasPending) return
    let cancelled = false
    const tick = async () => {
      try {
        const resp = await fetch(`${VERIFY_API_BASE}/api/share/invites`)
        const json = await resp.json().catch(() => null)
        const list = Array.isArray(json?.invites) ? json.invites : []
        if (cancelled) return
        setContactsAndStore(
          contacts.map((c) => {
            if (c.verificationStatus !== 'pending') return c
            const match = list
              .slice()
              .reverse()
              .find(
                (inv: any) =>
                  typeof inv?.phone === 'string' &&
                  inv.phone === c.phone &&
                  (inv?.kind ?? 'share') === 'share',
              )
            if (!match) return c
            const status =
              match.status === 'accepted' ? 'accepted' : match.status === 'declined' ? 'declined' : 'pending'
            return { ...c, verificationStatus: status, accountRole: status === 'accepted' ? 'regular' : (c.accountRole ?? 'regular') }
          }),
        )
      } catch {
        // ignore
      }
    }
    tick()
    const t = setInterval(tick, 4000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [contacts])

  const addContactWith = (nameRaw: string, phoneRaw: string) => {
    const name = (nameRaw || '').trim()
    const phone = (phoneRaw || '').trim()
    if (!name || !phone) return

    // Avoid duplicates by phone.
    if (contacts.some((c) => (c.phone || '').trim() === phone)) return

    const newContact: SharingContact = {
      id: `c-${Date.now()}`,
      ...form,
      name,
      phone,
      verificationStatus: 'pending',
    }
    // Add immediately as pending while verification is in flight.
    const nextList = [...contacts, newContact]
    persistContacts(nextList)

    // Kick off SMS invite.
    ;(async () => {
      try {
        const resp = await fetch(`${VERIFY_API_BASE}/api/share/invite`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name, phone }),
        })
        const json = await resp.json().catch(() => null)
        const inviteId = typeof json?.inviteId === 'string' ? json.inviteId : undefined
        setContacts((prev) =>
          prev.map((c) =>
            c.id === newContact.id
              ? { ...c, inviteId, verificationStatus: 'pending' }
              : c,
          ),
        )

        setInvitesRemaining((prev) => {
          const next = Math.max(0, prev - 1)
          try {
            localStorage.setItem(INVITES_REMAINING_KEY, JSON.stringify(next))
          } catch {
            // ignore
          }
          return next
        })
      } catch {
        setContacts((prev) =>
          prev.map((c) => (c.id === newContact.id ? { ...c, verificationStatus: 'error' } : c)),
        )
      }
    })()
    setForm((prev) => ({
      ...prev,
      name: '',
      phone: '',
      birthYear: '',
      nextCallEveryDays: 1,
      nextCallDate: '',
      nextCallTime: '18:00',
      nextCallTopicMode: 'home',
      nextCallPrompt: '',
    }))
  }

  const addContact = () => {
    addContactWith(form.name, form.phone)
  }

  const removeContact = (id: string) => {
    if (id === SELF_ID) return
    persistContacts(contacts.filter((c) => c.id !== id))
  }

  const updateContact = (id: string, patch: Partial<Omit<SharingContact, 'id' | 'phone'>>) => {
    if (id === SELF_ID) {
      setSelfContact((prev) => ({ ...prev, ...patch }))
      return
    }
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
    // If we committed days, clear any draft so it snaps back to the saved value.
    if ((patch as any).nextCallEveryDays !== undefined) {
      setDaysDraftById((prev) => {
        if (!(id in prev)) return prev
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
  }

  const commitDaysDraft = (id: string) => {
    const draft = daysDraftById[id]
    if (draft === undefined) return
    const trimmed = draft.trim()
    if (!trimmed) {
      updateContact(id, { nextCallEveryDays: 1 })
      return
    }
    const parsed = parseInt(trimmed, 10)
    const clamped = Math.max(0, Math.min(99, Number.isFinite(parsed) ? parsed : 1))
    updateContact(id, { nextCallEveryDays: clamped })
  }

  const formatNextScheduled = (everyDays: number, hhmm: string) => {
    const days = Number.isFinite(everyDays) ? Math.max(0, Math.min(99, Math.round(everyDays))) : 1
    const d = new Date()
    d.setDate(d.getDate() + days)
    const datePart = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    const timePart = hhmm ? ` at ${formatTime12h(hhmm)}` : ''
    return `${datePart}${timePart}`
  }

  const formatTime12h = (hhmm: string) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || '')
    if (!m) return ''
    const h = Math.max(0, Math.min(23, Number(m[1])))
    const min = Math.max(0, Math.min(59, Number(m[2])))
    const suffix = h >= 12 ? 'PM' : 'AM'
    const h12 = ((h + 11) % 12) + 1
    return `${h12}:${String(min).padStart(2, '0')}${suffix}`
  }

  const savedById = useMemo(
    () => new Map([...savedContacts, savedSelfContact].map((c) => [c.id, c])),
    [savedContacts, savedSelfContact],
  )
  const isDirty = (c: SharingContact) => {
    const saved = savedById.get(c.id)
    if (!saved) return true
    const pick = (x: SharingContact) => ({
      name: x.name,
      accountRole: x.accountRole ?? 'regular',
      birthYear: x.birthYear ?? '',
      relationship: x.relationship,
      nextCallEveryDays: x.nextCallEveryDays,
      nextCallTime: x.nextCallTime,
      nextCallTimeZone: x.nextCallTimeZone,
      nextCallLanguage: x.nextCallLanguage,
      nextCallVoice: x.nextCallVoice,
      nextCallTopicMode: x.nextCallTopicMode,
      nextCallPrompt: x.nextCallPrompt,
    })
    return JSON.stringify(pick(saved)) !== JSON.stringify(pick(c))
  }

  const canSave = (c: SharingContact) => !(c.nextCallTopicMode === 'custom' && !c.nextCallPrompt.trim())

  const saveContact = async (contactId: string) => {
    if (contactId === SELF_ID) {
      persistSelf(selfContact)
      return
    }
    // Persist the whole list. No admin-specific behavior.
    persistContacts(contacts)
  }

  const accounts = useMemo(() => [selfContact, ...contacts], [selfContact, contacts])

  return (
    <div className="container share-page">
      <Header />
      <main className="main-content share-content">
        <div className="share-form-container">
          <div className="share-header">
            <h1 className="share-title">Accounts</h1>
          </div>

          <section className="sharing-with-section">
            <div className="sharing-with-list">
              {accounts.map((c) => (
                <div
                  key={c.id}
                  className={`sharing-with-card ${expandedById[c.id] ? 'is-expanded' : 'is-collapsed'}`}
                >
                  <button
                    type="button"
                    className="sharing-card-summary"
                    aria-expanded={!!expandedById[c.id]}
                    onClick={() => setExpandedById((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                  >
                    <div className="sharing-summary-name">{c.name || '—'}</div>
                    <div className="sharing-summary-meta">
                      {c.verificationStatus === 'pending' && <span className="sharing-summary-status">Pending verification</span>}
                      {c.id !== SELF_ID && <span className="sharing-summary-rel">{relationshipLabel(c.relationship)}</span>}
                    </div>
                    <div className="sharing-summary-chevron" aria-hidden="true">
                      {expandedById[c.id] ? (
                        <svg className="sharing-summary-icon" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M6 12h12" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <svg className="sharing-summary-icon" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            d="M12 6v12M6 12h12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.25"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                  </button>

                  {expandedById[c.id] && (
                    <div className="sharing-card-expanded">
                      <div className="sharing-card-top">
                    <div className="sharing-card-actions sharing-card-actions--header">
                      {(c.accountRole ?? 'regular') === 'admin' ? (
                        <div className="sharing-admin-badge">Admin Access</div>
                      ) : (
                        <button
                          type="button"
                          className="sharing-admin-request"
                          onClick={() => setAdminAccessRequestTarget(c)}
                        >
                          Request Admin Access
                        </button>
                      )}
                    </div>
                    <div className="sharing-card-ident">
                      <div className="sharing-top-grid">
                        <div className="sharing-field">
                          <label className="sharing-field-label" htmlFor={`contact-name-${c.id}`}>
                            Name
                          </label>
                          <input
                            id={`contact-name-${c.id}`}
                            className="sharing-control"
                            value={c.name}
                            onChange={(e) => updateContact(c.id, { name: e.target.value })}
                          />
                        </div>

                        <div className="sharing-field">
                          <label className="sharing-field-label" htmlFor={`contact-phone-${c.id}`}>
                            Phone
                          </label>
                          <input
                            id={`contact-phone-${c.id}`}
                            className="sharing-control"
                            value={c.phone}
                            disabled
                          />
                          {c.verificationStatus && c.verificationStatus !== 'accepted' && (
                            <div className="sharing-status">
                              {c.verificationStatus === 'declined' && 'Declined'}
                              {c.verificationStatus === 'error' && 'Verification error'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>


                  </div>

                  <div className="sharing-card-bottom">
                    <div className="orb-editor-grid">
                      <div className="sharing-field">
                        <label className="sharing-field-label" htmlFor={`contact-birth-${c.id}`}>
                          Birth year
                        </label>
                        <input
                          id={`contact-birth-${c.id}`}
                          className="sharing-control"
                          value={c.birthYear ?? ''}
                          onChange={(e) => updateContact(c.id, { birthYear: e.target.value })}
                          placeholder="YYYY"
                          disabled={!((c.accountRole ?? 'regular') === 'admin' || c.verificationStatus === 'pending')}
                        />
                      </div>

                      {c.id === SELF_ID ? (
                        <div className="sharing-field" aria-hidden="true" />
                      ) : (
                        <div className="sharing-field">
                          <label className="sharing-field-label" htmlFor={`contact-rel-${c.id}`}>
                            Relationship
                          </label>
                          <div className="sharing-select">
                            <select
                              id={`contact-rel-${c.id}`}
                              className="sharing-control"
                              value={c.relationship}
                              onChange={(e) => updateContact(c.id, { relationship: e.target.value as Relationship })}
                            >
                              {RELATIONSHIP_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="sharing-field">
                        <label className="sharing-field-label" htmlFor={`contact-lang-${c.id}`}>

                          Language
                        </label>
                        <div className="sharing-select">
                          <select
                            id={`contact-lang-${c.id}`}
                            className="sharing-control"
                            value={c.nextCallLanguage}
                            onChange={(e) => {
                              if ((c.accountRole ?? 'regular') !== 'admin' && c.verificationStatus !== 'pending') return
                              updateContact(c.id, { nextCallLanguage: e.target.value })
                            }}
                            disabled={!((c.accountRole ?? 'regular') === 'admin' || c.verificationStatus === 'pending')}
                          >
                            {LANGUAGE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="sharing-field">
                        <label className="sharing-field-label" htmlFor={`contact-voice-${c.id}`}>
                          Ember Voice
                        </label>
                        <div className="sharing-select">
                          <select
                            id={`contact-voice-${c.id}`}
                            className="sharing-control"
                            value={c.nextCallVoice}
                            onChange={(e) => {
                              if ((c.accountRole ?? 'regular') !== 'admin' && c.verificationStatus !== 'pending') return
                              updateContact(c.id, { nextCallVoice: e.target.value })
                            }}
                            disabled={!((c.accountRole ?? 'regular') === 'admin' || c.verificationStatus === 'pending')}
                          >
                            {VOICE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                    </div>

                                        {c.verificationStatus === 'pending' ? (
                      <>
                        <div className="sharing-section-divider" />
                        <div className="sharing-pending-invite">
                          <div
                            className="url-content sharing-invite-url"
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              const url = inviteUrlFor(c.inviteId)
                              navigator.clipboard?.writeText?.(url).catch(() => {})
                              setCopiedInviteForId(c.id)
                              setTimeout(() => setCopiedInviteForId((prev) => (prev === c.id ? null : prev)), 900)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                const url = inviteUrlFor(c.inviteId)
                                navigator.clipboard?.writeText?.(url).catch(() => {})
                                setCopiedInviteForId(c.id)
                                setTimeout(() => setCopiedInviteForId((prev) => (prev === c.id ? null : prev)), 900)
                              }
                            }}
                          >
                            <div className="url-text">{inviteUrlFor(c.inviteId)}</div>
                            <div className="copy-text">{copiedInviteForId === c.id ? 'COPIED' : 'COPY'}</div>
                          </div>
                          <div className="sharing-pending-desc">
                            Share this unique invite link with <strong>{(c.name || '').trim().split(/\s+/)[0] || 'them'}</strong>.{' '}
                            <strong>{invitesRemaining}</strong> invitations remaining.
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="sharing-section-divider" />

                    <div className="sharing-card-section">Schedule call</div>
                    <div className="sharing-frequency">
                      <div className="sharing-frequency-row">
                        <div className="sharing-frequency-label freq-every">Every</div>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="sharing-control sharing-control--days"
                          value={daysDraftById[c.id] ?? String(c.nextCallEveryDays ?? 1)}
                          onChange={(e) => {
                            if ((c.accountRole ?? 'regular') !== 'admin') return
                            // Keep only digits, allow empty, cap to 2 chars for 0-99.
                            const digits = e.target.value.replace(/\D/g, '').slice(0, 2)
                            setDaysDraftById((prev) => ({ ...prev, [c.id]: digits }))
                          }}
                          onBlur={() => {
                            if ((c.accountRole ?? 'regular') !== 'admin') return
                            commitDaysDraft(c.id)
                          }}
                          disabled={(c.accountRole ?? 'regular') !== 'admin'}
                        />
                        <div className="sharing-frequency-label freq-days">days at</div>
                        <div className="sharing-select sharing-select--time">
                          <select
                            className="sharing-control"
                            value={c.nextCallTime}
                            onChange={(e) => updateContact(c.id, { nextCallTime: e.target.value })}
                            disabled={(c.accountRole ?? 'regular') !== 'admin'}
                          >
                            {[
                              ['00:00', '12:00 AM'],
                              ['06:00', '6:00 AM'],
                              ['08:00', '8:00 AM'],
                              ['09:00', '9:00 AM'],
                              ['10:00', '10:00 AM'],
                              ['12:00', '12:00 PM'],
                              ['15:00', '3:00 PM'],
                              ['17:00', '5:00 PM'],
                              ['18:00', '6:00 PM'],
                              ['19:00', '7:00 PM'],
                              ['20:00', '8:00 PM'],
                              ['21:00', '9:00 PM'],
                            ].map(([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sharing-select sharing-select--tz">
                          <select
                            className="sharing-control"
                            value={c.nextCallTimeZone}
                            onChange={(e) => updateContact(c.id, { nextCallTimeZone: e.target.value })}
                            disabled={(c.accountRole ?? 'regular') !== 'admin'}
                          >
                            {TIME_ZONES.map((tz) => (
                              <option key={tz.value} value={tz.value}>
                                {tz.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="sharing-frequency-sub">
                        Next call scheduled on{' '}
                        <strong>
                          {formatNextScheduled(c.nextCallEveryDays, c.nextCallTime)} ({tzShort(c.nextCallTimeZone)})
                        </strong>
                        .
                      </div>
                    </div>

                    <div className="sharing-topic-grid">
                      <div className="sharing-topic-label">Topic of Next Call</div>
                      <div className="sharing-select">
                        <select
                          className="sharing-control"
                          value={c.nextCallTopicMode}
                          disabled={(c.accountRole ?? 'regular') !== 'admin'}
                          onChange={(e) => {
                            if ((c.accountRole ?? 'regular') !== 'admin') return
                            const mode = e.target.value as TopicMode
                            if (mode !== 'custom') {
                              updateContact(c.id, {
                                nextCallTopicMode: mode,
                                nextCallPrompt: defaultTopicNotes(c.name, mode),
                              })
                            } else {
                              updateContact(c.id, { nextCallTopicMode: 'custom' })
                            }
                          }}
                          aria-label="Topic of next call"
                        >
                          <option value="home">The Home I Grew Up In</option>
                          <option value="advice">The Best Advice I Ever Got</option>
                          <option value="hardest">The Hardest Thing I’ve Ever Done</option>
                          <option value="recipe">The Recipe That Raised Us</option>
                          <option value="belief">What I Believe About Life</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>

                      <textarea
                        className="sharing-control sharing-control--notes ember-scroll"
                        value={c.nextCallPrompt}
                        onChange={(e) => {
                          if ((c.accountRole ?? 'regular') !== 'admin') return
                          autoResizeTextarea(e.currentTarget)
                          updateContact(c.id, { nextCallPrompt: e.target.value })
                        }}
                        readOnly={(c.accountRole ?? 'regular') !== 'admin' || c.nextCallTopicMode !== 'custom'}
                        placeholder={
                          c.nextCallTopicMode === 'custom'
                            ? 'Example: Tell me about the first country you traveled to'
                            : 'Topic notes…'
                        }
                        aria-required={(c.accountRole ?? 'regular') === 'admin' && c.nextCallTopicMode === 'custom'}
                        aria-invalid={(c.accountRole ?? 'regular') === 'admin' && c.nextCallTopicMode === 'custom' && !c.nextCallPrompt.trim()}
                        rows={2}
                      />
                    </div>
                    {(c.accountRole ?? 'regular') === 'admin' &&
                      c.nextCallTopicMode === 'custom' &&
                      !c.nextCallPrompt.trim() && (
                        <div className="sharing-required-hint">Notes are required when using Custom.</div>
                      )}

                    
                      </>
                    )}

<div className="sharing-card-footer">
                      {isDirty(c) && (
                        <button
                          type="button"
                          className="sharing-save"
                          onClick={() => saveContact(c.id)}
                          disabled={!canSave(c)}
                        >
                          Save
                        </button>
                      )}
                      {c.id !== SELF_ID && (
                        <button type="button" className="sharing-remove" onClick={() => setConfirmRemoveId(c.id)}>
                          REMOVE
                        </button>
                      )}
                    </div>
                  </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {confirmRemoveId && (
            <div
              className="share-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Confirm remove contact"
              onMouseDown={(e) => {
                // Click outside to cancel
                if (e.target === e.currentTarget) setConfirmRemoveId(null)
              }}
            >
              <div className="share-modal-card">
                <div className="share-modal-title">Are you sure you'd like to remove this user?</div>
                <div className="share-modal-actions">
                  <button type="button" className="share-modal-btn ghost" onClick={() => setConfirmRemoveId(null)}>
                    CANCEL
                  </button>
                  <button
                    type="button"
                    className="share-modal-btn"
                    onClick={() => {
                      const id = confirmRemoveId
                      setConfirmRemoveId(null)
                      removeContact(id)
                    }}
                  >
                    REMOVE
                  </button>
                </div>
              </div>
            </div>
          )}

          {adminAccessRequestTarget && (
            <div
              className="share-modal"
              role="dialog"
              aria-modal="true"
              aria-label="Request admin access"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setAdminAccessRequestTarget(null)
              }}
            >
              <div className="share-modal-card">
                <div className="share-modal-title">
                  Admin access is most useful for family members looking to guide parents/grandparents through the
                  Ember process. Would you like to request admin access?
                </div>
                <div className="share-modal-actions">
                  <button type="button" className="share-modal-btn ghost" onClick={() => setAdminAccessRequestTarget(null)}>
                    CANCEL
                  </button>
                  <button type="button" className="share-modal-btn" onClick={() => setAdminAccessRequestTarget(null)}>
                    REQUEST
                  </button>
                </div>
              </div>
            </div>
          )}

          <form
            className="sharing-with-section"
            id="accounts-add-new"
            onSubmit={(e) => {
              e.preventDefault()
              addContact()
            }}
          >
            <div className="sharing-with-card sharing-with-card--add">
              <div className="sharing-card-section">Add someone new</div>
              <div className="sharing-top-grid">
                <div className="sharing-field">
                  <label className="sharing-field-label" htmlFor="share-name">
                    Name
                  </label>
                  <input
                    id="share-name"
                    className="sharing-control"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Name"
                  />
                </div>

                <div className="sharing-field">
                  <label className="sharing-field-label" htmlFor="share-phone">
                    Phone
                  </label>
                  <input
                    id="share-phone"
                    className="sharing-control"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+1-…"
                  />
                </div>
              </div>

              <div className="sharing-card-footer sharing-card-footer--add">
                <button type="submit" className="sharing-save" disabled={!form.name.trim() || !form.phone.trim()}>
                  ADD
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Accounts

