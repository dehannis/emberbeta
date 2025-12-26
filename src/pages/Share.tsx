import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import './Share.css'

type TopicMode = 'house' | 'meal' | 'custom'
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
const VERIFY_API_BASE = (import.meta as any).env?.VITE_EVI_PROXY_HTTP ?? 'http://localhost:8788'


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

const Share: React.FC = () => {
  const defaultTopicNotes = (name: string, mode: TopicMode) => {
    const n = name.trim() || 'They'
    const isHe = n.toLowerCase().includes('hank') || n.toLowerCase().includes('suchan')
    const p = isHe ? 'he' : 'they'

    if (mode === 'meal') {
      return (
        `Topic: My Favorite Home Cooked Meal\n` +
        `This is a powerful topic because food is memory—smell, texture, and ritual can bring an entire chapter of life back instantly.\n\n` +
        `Ember will ask ${n}:\n` +
        `- What is the meal, and who made it most often?\n` +
        `- Where were you when you ate it—what did the room look and sound like?\n` +
        `- What did it mean in your family (comfort, celebration, survival, love)?\n` +
        `- Tell a specific moment: one day you remember vividly, and why.\n` +
        `- If someone you love tasted it today, what would you want them to understand about you?`
      )
    }

    return (
      `Topic: The House Where I Grew Up\n` +
      `This is a powerful topic because places hold the blueprint of who we became—our first routines, relationships, fears, and joys.\n\n` +
      `Ember will ask ${n}:\n` +
      `- Describe arriving home—what you saw first, and what you felt.\n` +
      `- Walk room by room: what happened in the kitchen, living room, and your bedroom?\n` +
      `- Who lived there with you, and what were they like in that season?\n` +
      `- What was a small detail ${p} can still picture (a sound, a smell, a corner)?\n` +
      `- Share one story from that house that shaped ${p}—and what ${p} carries forward today.`
    )
  }

  const DEFAULT_CONTACTS: SharingContact[] = useMemo(
    () => [
      {
        id: 'c-1',
        name: 'Suchan Chae',
        phone: '+1-555-123-4567',
        birthYear: '',
        relationship: 'other',
        verificationStatus: 'accepted',
        nextCallEveryDays: 1,
        nextCallDate: '',
        nextCallTime: '18:00',
        nextCallTimeZone: 'America/Los_Angeles',
        nextCallLanguage: 'English',
        nextCallVoice: 'female',
        nextCallTopicMode: 'house',
        nextCallPrompt: defaultTopicNotes('Suchan Chae', 'house'),
      },
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
        nextCallTopicMode: 'meal',
        nextCallPrompt: defaultTopicNotes('Hank Lee', 'meal'),
      },
    ],
    [],
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
    nextCallTopicMode: 'house',
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONTACTS_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const list = Array.isArray(parsed) ? parsed : null
      if (!list || list.length === 0) {
        setContacts(DEFAULT_CONTACTS)
        setSavedContacts(DEFAULT_CONTACTS)
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(DEFAULT_CONTACTS))
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
          nextCallTopicMode: (c.nextCallTopicMode === 'meal' ? 'meal' : c.nextCallTopicMode === 'custom' ? 'custom' : 'house') as TopicMode, // migrate old "biography" -> "house"
          nextCallPrompt:
            typeof c.nextCallPrompt === 'string' && c.nextCallPrompt.trim()
              ? c.nextCallPrompt
              : ((c.nextCallTopicMode === 'custom'
                  ? ''
                  : defaultTopicNotes(c.name, (c.nextCallTopicMode === 'meal' ? 'meal' : 'house') as TopicMode)) as string),
        }))
      // If we auto-filled defaults, persist them so the UI doesn't show as "dirty".
      persistContacts(cleaned)
    } catch {
      setContacts(DEFAULT_CONTACTS)
      setSavedContacts(DEFAULT_CONTACTS)
      try {
        localStorage.setItem(CONTACTS_KEY, JSON.stringify(DEFAULT_CONTACTS))
      } catch {
        // ignore
      }
    }
  }, [DEFAULT_CONTACTS])

  const persistContacts = (next: SharingContact[]) => {
    setContacts(next)
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(next))
      setSavedContacts(next)
    } catch {
      // ignore
    }
  }

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

  const addContact = () => {
    const name = form.name.trim()
    const phone = form.phone.trim()
    if (!name || !phone) return

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
      nextCallTopicMode: 'house',
      nextCallPrompt: '',
    }))
  }

  const removeContact = (id: string) => {
    persistContacts(contacts.filter((c) => c.id !== id))
  }

  const updateContact = (id: string, patch: Partial<Omit<SharingContact, 'id' | 'phone'>>) => {
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

  const savedById = useMemo(() => new Map(savedContacts.map((c) => [c.id, c])), [savedContacts])
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

  const saveContact = async (_contactId: string) => {
    // Persist the whole list (so Account stays synced). No admin-specific behavior.
    persistContacts(contacts)
  }

  return (
    <div className="container share-page">
      <Header />
      <main className="main-content share-content">
        <div className="share-form-container">
          <div className="share-header">
            <h1 className="share-title">Sharing With</h1>
          </div>

          <section className="sharing-with-section">
            <div className="sharing-with-list">
              {contacts.map((c) => (
                <div key={c.id} className="sharing-with-card">
                                    <div className="sharing-card-top">
                    <div className="sharing-card-actions sharing-card-actions--header">
                      {c.verificationStatus === 'pending' ? (
                        <div className="sharing-pending-badge">PENDING VERIFICATION</div>
                      ) : (c.accountRole ?? 'regular') === 'admin' ? (
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
                        .{' '}
                        <br />
                        <span className="sharing-subtle">Ember will call <strong>{c.phone}</strong>.</span>
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
                            if (mode === 'house' || mode === 'meal') {
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
                          <option value="house">The House Where I Grew Up</option>
                          <option value="meal">My Favorite Home Cooked Meal</option>
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
                      <button type="button" className="sharing-remove" onClick={() => setConfirmRemoveId(c.id)}>
                        REMOVE
                      </button>
                    </div>
                  </div>
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

export default Share

