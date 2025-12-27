import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import styles from './TopicsPage.module.css'

const SHARE_CONTACTS_KEY = 'emberContactsV1'
const TOPIC_REQUESTS_KEY = 'emberTopicRequestsV1'

const REQUEST_TIME_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '00:00', label: '12:00 AM' },
  { value: '06:00', label: '6:00 AM' },
  { value: '08:00', label: '8:00 AM' },
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '21:00', label: '9:00 PM' },
]

const REQUEST_TIME_ZONES: Array<{ value: string; label: string; short: string }> = [
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
]

const topics = [
  {
    title: 'The Home I Grew Up In',
    subtitle: 'A Guided Tour',
    why: 'A childhood home is a private geography. It’s where a person learned what “normal” feels like—how love sounded, where silence lived, what safety meant. Taking a tour isn’t nostalgia; it’s a way to translate an entire upbringing into places you can picture and remember.',
    image: '/stock/home.jpeg',
  },
  {
    title: 'The Best Advice I Ever Got',
    subtitle: 'And the Worst',
    why: 'Advice is condensed character. It reveals who shaped you, what you were afraid of, and what you chose to carry forward. The “best” and the “worst” belong together: one shows what guided you; the other shows how you learned to think for yourself.',
    image: '/stock/lesson.png',
  },
  {
    title: 'The Hardest Thing I’ve Ever Done',
    subtitle: 'And How I Got Through It',
    why: 'Hard seasons tend to get summarized, softened, or skipped. But what a family most needs is often the real map: what it cost, what held you up, what changed you. Shared with care, this becomes a quiet inheritance—how to endure without losing yourself.',
    image: '/stock/hardest.jpeg',
  },
  {
    title: 'The Recipe That Raised Us',
    subtitle: 'Food as Memory',
    why: 'A family dish is never just food. It’s a record of care—who showed up, what was celebrated, what was survived, what was given without being announced. Recipes hold the texture of a life: hands, timing, patience, and the kind of love that doesn’t make speeches.',
    image: '/stock/food.jpeg',
  },
  {
    title: 'What I Believe About Life',
    subtitle: 'A Gentle Philosophy',
    why: 'Beliefs aren’t slogans; they’re what’s left after experience has argued with you for years. Naming them gives your family something rare: a set of principles with a human voice behind them—earned, imperfect, and true enough to guide someone when you’re not in the room.',
    image: '/stock/life.jpeg',
  },
]

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!mq) return
    const onChange = () => setReduced(!!mq.matches)
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  return reduced
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

type BasicContact = {
  id: string
  name: string
  phone: string
  verificationStatus?: 'accepted' | 'pending' | 'declined' | 'error'
}

function readShareContacts(): BasicContact[] {
  try {
    const raw = localStorage.getItem(SHARE_CONTACTS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    const list = Array.isArray(parsed) ? parsed : []
    return list
      .filter((c: any) => c && typeof c.name === 'string' && typeof c.phone === 'string')
      .map((c: any, idx: number) => ({
        id: typeof c.id === 'string' ? c.id : `c-${idx + 1}`,
        name: c.name,
        phone: c.phone,
        verificationStatus:
          c.verificationStatus === 'pending' || c.verificationStatus === 'declined' || c.verificationStatus === 'error'
            ? c.verificationStatus
            : 'accepted',
      }))
  } catch {
    return []
  }
}

type TopicRequestRecord = {
  requestedAt: string // ISO
  requestedForDate?: string // YYYY-MM-DD
  scheduledTime?: string
  scheduledTimeZone?: string
}

function readTopicRequests(): Record<string, Record<string, TopicRequestRecord>> {
  try {
    const raw = localStorage.getItem(TOPIC_REQUESTS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Record<string, Record<string, TopicRequestRecord>>
  } catch {
    return {}
  }
}

function writeTopicRequests(next: Record<string, Record<string, TopicRequestRecord>>) {
  try {
    localStorage.setItem(TOPIC_REQUESTS_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

function formatMMDDYYYY(yyyyMmDd: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd)
  if (!m) return yyyyMmDd
  return `${m[2]}/${m[3]}/${m[1]}`
}

export default function TopicsPage() {
  const reducedMotion = usePrefersReducedMotion()
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const [requestTopicTitle, setRequestTopicTitle] = useState<string | null>(null)
  const [contacts, setContacts] = useState<BasicContact[]>(() => readShareContacts())
  const isJumpingRef = useRef(false)
  const didInitialCenterRef = useRef(false)
  const [carouselReady, setCarouselReady] = useState(false)

  const scrollBehavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth'

  const baseTopics = topics
  const baseCount = baseTopics.length
  const initialDeckIndex = baseCount > 1 ? 1 : 0
  // For looping UX we track the "deck index" (includes clones at both ends).
  const [activeDeckIndex, setActiveDeckIndex] = useState(() => initialDeckIndex)
  const deck = useMemo(() => {
    if (baseCount <= 1) return baseTopics
    return [baseTopics[baseCount - 1], ...baseTopics, baseTopics[0]]
  }, [baseCount, baseTopics])
  const deckCount = deck.length

  const scrollToDeckIndex = useCallback(
    (idx: number, behavior: ScrollBehavior = scrollBehavior) => {
      const scroller = scrollerRef.current
      const node = cardRefs.current[idx]
      if (!scroller || !node) return
      // NOTE: track owns the side padding, so offsetLeft is already in scroller coordinates.
      const left = node.offsetLeft
      scroller.scrollTo({ left, behavior })
    },
    [scrollBehavior],
  )

  const computeActiveIndex = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller) return 0
    const centerX = scroller.scrollLeft + scroller.clientWidth / 2
    let best = 0
    let bestDist = Number.POSITIVE_INFINITY
    for (let i = 0; i < deckCount; i++) {
      const node = cardRefs.current[i]
      if (!node) continue
      const cardCenter = node.offsetLeft + node.offsetWidth / 2
      const d = Math.abs(cardCenter - centerX)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    }
    return best
  }, [deckCount])

  // Ensure we start centered on the first topic (deck index 1 when looping).
  // useLayoutEffect prevents a one-frame flash of the cloned last card on load.
  useLayoutEffect(() => {
    if (didInitialCenterRef.current) return
    didInitialCenterRef.current = true

    setCarouselReady(false)
    setActiveDeckIndex(initialDeckIndex)

    const attempt = (triesLeft: number) => {
      const scroller = scrollerRef.current
      const node = cardRefs.current[initialDeckIndex]
      if (!scroller || !node) {
        if (triesLeft <= 0) return
        requestAnimationFrame(() => attempt(triesLeft - 1))
        return
      }

      // Force the starting scroll position deterministically.
      // Temporarily disable smooth scrolling to avoid any animated "swivel" on mount.
      const prev = scroller.style.scrollBehavior
      scroller.style.scrollBehavior = 'auto'
      scroller.scrollLeft = node.offsetLeft
      scroller.style.scrollBehavior = prev

      setCarouselReady(true)
    }

    requestAnimationFrame(() => attempt(12))
  }, [initialDeckIndex])

  const onScroll = useMemo(() => {
    let raf: number | null = null
    return () => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const idx = computeActiveIndex()
        setActiveDeckIndex(idx)

        // Looping: if we land on a clone at either end, jump to the corresponding real card.
        if (baseCount > 1 && !isJumpingRef.current) {
          if (idx === 0) {
            isJumpingRef.current = true
            const target = baseCount
            scrollToDeckIndex(target, 'auto')
            setActiveDeckIndex(target)
            requestAnimationFrame(() => {
              isJumpingRef.current = false
            })
          } else if (idx === baseCount + 1) {
            isJumpingRef.current = true
            const target = 1
            scrollToDeckIndex(target, 'auto')
            setActiveDeckIndex(target)
            requestAnimationFrame(() => {
              isJumpingRef.current = false
            })
          }
        }
      })
    }
  }, [baseCount, computeActiveIndex, scrollToDeckIndex])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== SHARE_CONTACTS_KEY) return
      setContacts(readShareContacts())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.topHeader}>
        <Header />
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>Topics</h1>
        <p className={styles.subtext}>
          Ember curates guided questions on biographical topics to build and preserve memories
        </p>
      </header>

      <section className={styles.carouselSection} aria-label="Topics carousel">
        <div
          ref={scrollerRef}
          className={`${styles.scroller} ${!carouselReady ? styles.scrollerHidden : ''}`}
          tabIndex={0}
          onScroll={carouselReady ? onScroll : undefined}
          onKeyDown={(e) => {
            if (!carouselReady) return
            if (e.key === 'ArrowLeft') {
              e.preventDefault()
              const next = clamp(activeDeckIndex - 1, 0, deckCount - 1)
              scrollToDeckIndex(next)
            }
            if (e.key === 'ArrowRight') {
              e.preventDefault()
              const next = clamp(activeDeckIndex + 1, 0, deckCount - 1)
              scrollToDeckIndex(next)
            }
          }}
        >
          <div className={styles.track}>
            {deck.map((t, idx) => (
              <div
                key={`${t.title}-${idx}`}
                className={styles.item}
                ref={(el) => {
                  cardRefs.current[idx] = el
                }}
                aria-label={t.title}
              >
                <button
                  type="button"
                  className={styles.cardButton}
                  aria-label={`Share: ${t.title}`}
                  onClick={() => setRequestTopicTitle(t.title)}
                >
                  <div
                    className={styles.card}
                    data-reduced-motion={reducedMotion ? 'true' : 'false'}
                    style={{ ['--card-image' as never]: `url(${t.image})` }}
                  >
                    <div className={styles.cardBg} aria-hidden="true" />
                    <div className={styles.cardGlass} aria-hidden="true" />
                    <div className={styles.cardOverlay} />
                    <div className={styles.cardGrain} aria-hidden="true" />
                    <div className={styles.cardText}>
                      <div className={styles.cardTitle}>
                        {t.title}
                        {t.subtitle ? <span className={styles.cardTitleParen}> ({t.subtitle})</span> : null}
                      </div>
                      <div className={styles.cardWhy}>{t.why}</div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.controls} aria-label="Carousel controls">
          <button
            type="button"
            className={styles.chevronBtn}
            aria-label="Previous topic"
            onClick={() => carouselReady && scrollToDeckIndex(clamp(activeDeckIndex - 1, 0, deckCount - 1))}
          >
            <svg className={styles.chevronIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14.5 5.5L8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className={styles.chevronBtn}
            aria-label="Next topic"
            onClick={() => carouselReady && scrollToDeckIndex(clamp(activeDeckIndex + 1, 0, deckCount - 1))}
          >
            <svg className={styles.chevronIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9.5 5.5L16 12l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>

      {requestTopicTitle && (
        <RequestDialog
          topicTitle={requestTopicTitle}
          contacts={contacts}
          onClose={() => setRequestTopicTitle(null)}
          onRequest={(args) => {
            // Front-end only for now.
            // eslint-disable-next-line no-console
            console.log('REQUEST_TOPIC', args)
            setRequestTopicTitle(null)
          }}
        />
      )}
    </div>
  )
}

function RequestDialog(props: {
  topicTitle: string
  contacts: BasicContact[]
  onClose: () => void
  onRequest: (args: {
    topicTitle: string
    contactId: string
    contactName: string
    contactPhone: string
    scheduledDate?: string
    scheduledTime?: string
    scheduledTimeZone?: string
  }) => void
}) {
  const { topicTitle, contacts, onClose, onRequest } = props
  const navigate = useNavigate()
  const [mode, setMode] = useState<'pick' | 'schedule'>('pick')
  const [selectedId, setSelectedId] = useState<string>('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [scheduleTz, setScheduleTz] = useState('')
  const [requestsByTopic, setRequestsByTopic] = useState<Record<string, Record<string, TopicRequestRecord>>>(() => readTopicRequests())

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const pickContacts = useMemo<BasicContact[]>(
    () => [
      { id: 'self', name: 'Yourself', phone: '', verificationStatus: 'accepted' },
      ...contacts,
      { id: 'add_new', name: 'Add New', phone: '', verificationStatus: 'accepted' },
    ],
    [contacts],
  )

  const selectedContact = pickContacts.find((c) => c.id === selectedId) ?? null
  const requestedForSelected =
    selectedContact ? (requestsByTopic?.[topicTitle]?.[selectedContact.id] ?? null) : null

  return (
    <div className={styles.dialogBackdrop} role="presentation" onMouseDown={onClose}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={`Share ${topicTitle}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className={styles.dialogHeader}>
          <div className={styles.dialogHeaderText}>
            <div className={styles.dialogKicker}>TOPIC</div>
            <div className={styles.dialogTopicTitle}>{topicTitle}</div>
          </div>
          <button type="button" className={styles.dialogClose} aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.dialogExplain}>
          Share this topic with a contact. Ember will guide them through curated questions designed to trigger reflection and memories on this topic.
        </div>

        <div className={styles.dialogDivider} aria-hidden="true" />

        {mode === 'schedule' ? (
          <div className={styles.schedule}>
            <div className={styles.scheduleSummary}>
              <div className={styles.scheduleLabel}>Sharing with</div>
              <div className={styles.scheduleName}>{selectedContact ? selectedContact.name : '—'}</div>
            </div>

            <div className={styles.scheduleGrid}>
              <label className={styles.field}>
                <div className={styles.fieldLabel}>Date</div>
                <input
                  className={`${styles.fieldInput} ${scheduleDate ? '' : styles.fieldInputPlaceholder}`}
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </label>

              <label className={styles.field}>
                <div className={styles.fieldLabel}>Time</div>
                <div className={styles.fieldSelect}>
                  <select
                    className={`${styles.fieldInput} ${scheduleTime ? '' : styles.fieldInputPlaceholder}`}
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    {REQUEST_TIME_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label className={styles.field}>
                <div className={styles.fieldLabel}>Time zone</div>
                <div className={styles.fieldSelect}>
                  <select
                    className={`${styles.fieldInput} ${scheduleTz ? '' : styles.fieldInputPlaceholder}`}
                    value={scheduleTz}
                    onChange={(e) => setScheduleTz(e.target.value)}
                  >
                    <option value="" disabled>
                      Select…
                    </option>
                    {REQUEST_TIME_ZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
          </div>
        ) : (
          <div className={styles.contactList} aria-label="Contacts">
            {pickContacts.map((c) => {
              const isPseudo = c.id === 'self' || c.id === 'add_new'
              const r = !isPseudo ? (requestsByTopic?.[topicTitle]?.[c.id] ?? null) : null
              const isPending = !isPseudo && c.verificationStatus === 'pending'
              const isRequested = !isPseudo && !!r
              const isSelected = selectedId === c.id
              return (
                <div key={c.id} className={selectedId === c.id ? styles.contactRowSelected : styles.contactRow}>
                  <div className={styles.contactMeta}>
                    <div className={styles.contactName}>{c.name}</div>
                  </div>
                  <button
                    type="button"
                    className={
                      isRequested
                        ? styles.contactStatusPill
                        : isPending
                          ? styles.contactStatusPill
                          : isSelected
                            ? styles.contactSelectBtnSelected
                            : styles.contactSelectBtn
                    }
                    aria-pressed={isSelected}
                    disabled={isRequested || isPending}
                    onClick={() => {
                      if (isRequested || isPending) return
                      setSelectedId((prev) => (prev === c.id ? '' : c.id))
                    }}
                  >
                    {isRequested && r?.requestedForDate ? `REQUESTED FOR ${formatMMDDYYYY(r.requestedForDate)}` : null}
                    {isRequested && !r?.requestedForDate ? `REQUESTED` : null}
                    {!isRequested && isPending ? 'PENDING VERIFICATION' : null}
                    {!isRequested && !isPending && isSelected ? 'Selected' : null}
                    {!isRequested && !isPending && !isSelected ? 'Select' : null}
                  </button>
                </div>
              )
            })}
            {pickContacts.length <= 2 && <div className={styles.contactEmpty}>No contacts yet.</div>}
          </div>
        )}

        {mode === 'pick' && (
          <div className={styles.dialogActions}>
            <button
              type="button"
              className={styles.dialogContinueLink}
              disabled={!selectedContact}
              onClick={() => {
                if (!selectedContact) return
                if (selectedContact.id === 'add_new') {
                  onClose()
                  navigate('/accounts?addNew=1')
                  return
                }
                if (selectedContact.id === 'self') {
                  onClose()
                  navigate('/talk')
                  return
                }
                if (!!requestedForSelected || selectedContact?.verificationStatus === 'pending') return
                setMode('schedule')
              }}
            >
              Continue
            </button>
          </div>
        )}

        {mode === 'schedule' && (
          <div className={styles.dialogActions}>
            <button
              type="button"
              className={styles.dialogContinueLink}
              onClick={() => setMode('pick')}
            >
              Back
            </button>
            <button
              type="button"
              className={styles.dialogContinueLink}
              disabled={!selectedContact || !!requestedForSelected || selectedContact?.verificationStatus === 'pending'}
              onClick={() => {
                if (!selectedContact) return
                // Persist "requested" so it can't be requested again.
                const yyyyMmDd = scheduleDate || new Date().toISOString().slice(0, 10)
                const next = readTopicRequests()
                const byTopic = next[topicTitle] ?? {}
                byTopic[selectedContact.id] = {
                  requestedAt: new Date().toISOString(),
                  requestedForDate: yyyyMmDd,
                  scheduledTime: scheduleTime || undefined,
                  scheduledTimeZone: scheduleTz || undefined,
                }
                next[topicTitle] = byTopic
                writeTopicRequests(next)
                setRequestsByTopic(next)
                onRequest({
                  topicTitle,
                  contactId: selectedContact.id,
                  contactName: selectedContact.name,
                  contactPhone: selectedContact.phone,
                  scheduledDate: scheduleDate || undefined,
                  scheduledTime: scheduleTime || undefined,
                  scheduledTimeZone: scheduleTz || undefined,
                })
              }}
            >
              Share
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


