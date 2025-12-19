import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Header from '../components/Header'
import './Build.css'

interface Memory {
  id: string
  title: string
  aboutDate: string
  recordedOn: string
  durationSec?: number
  note: string
  personId: string
  visibility?: 'private' | 'shared'
  audioUrl?: string
}

interface Person {
  id: string
  name: string
}

type TopicMode = 'biography' | 'custom'

type ShareContact = {
  id?: string
  name?: string
  phone?: string
  nextCallEveryDays?: number
  nextCallTime?: string
  nextCallTimeZone?: string
  nextCallTopicMode?: TopicMode
  nextCallPrompt?: string
}

function isISODate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function normalizeMemories(value: unknown): Memory[] | null {
  if (!Array.isArray(value)) return null
  const result: Memory[] = []

  for (const m of value) {
    if (!m || typeof m !== 'object') return null
    const mm = m as Record<string, unknown>

    const id = mm.id
    const title = mm.title
    const note = mm.note
    const personId = mm.personId
    const audioUrl = mm.audioUrl
    const visibility = mm.visibility
    const durationSec = mm.durationSec

    // Back-compat: older builds stored a single `date`
    const legacyDate = mm.date
    const aboutDate = mm.aboutDate ?? legacyDate
    const recordedOn = mm.recordedOn ?? legacyDate ?? mm.aboutDate

    if (
      typeof id !== 'string' ||
      typeof title !== 'string' ||
      typeof note !== 'string' ||
      typeof personId !== 'string' ||
      !isISODate(aboutDate) ||
      !isISODate(recordedOn) ||
      (audioUrl !== undefined && typeof audioUrl !== 'string') ||
      (durationSec !== undefined && (typeof durationSec !== 'number' || !isFinite(durationSec) || durationSec < 0)) ||
      (visibility !== undefined && visibility !== 'private' && visibility !== 'shared')
    ) {
      return null
    }

    result.push({
      id,
      title,
      note,
      personId,
      aboutDate,
      recordedOn,
      durationSec: durationSec as number | undefined,
      visibility: (visibility as 'private' | 'shared' | undefined) ?? 'shared',
      audioUrl: audioUrl as string | undefined,
    })
  }

  return result
}

const DEFAULT_PEOPLE: Person[] = [
  { id: 'me', name: 'You' },
  { id: 'john', name: 'Suchan Chae' },
  { id: 'jane', name: 'Hank Lee' },
]

const SAMPLE_MEMORIES: Memory[] = [
  // Demo URLs for local UI testing
  {
    id: '1',
    title: 'Morning Reflection',
    recordedOn: '2024-03-15',
    aboutDate: '2024-03-15',
    durationSec: 156,
    note: 'A quiet moment...',
    personId: 'me',
    visibility: 'shared',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'Weekend Adventure',
    recordedOn: '2024-02-20',
    aboutDate: '2024-02-10',
    durationSec: 204,
    note: 'Hiking trip...',
    personId: 'john',
    visibility: 'shared',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: '3',
    title: 'Coffee Chat',
    recordedOn: '2024-02-01',
    aboutDate: '2024-01-20',
    durationSec: 132,
    note: 'Catching up...',
    personId: 'jane',
    visibility: 'private',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
]

function formatTime(seconds: number) {
  if (!isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDateNumeric(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  const m = d.getMonth() + 1
  const day = d.getDate()
  const y = d.getFullYear()
  return `${m}/${day}/${y}`
}

const tzShort = (tz: string) =>
  (tz === 'America/Los_Angeles' && 'PT') ||
  (tz === 'America/Denver' && 'MT') ||
  (tz === 'America/Chicago' && 'CT') ||
  (tz === 'America/New_York' && 'ET') ||
  (tz === 'Europe/London' && 'UK') ||
  (tz === 'Asia/Seoul' && 'KST') ||
  (tz === 'Asia/Tokyo' && 'JST') ||
  (tz === 'America/Sao_Paulo' && 'BRT') ||
  (tz === 'America/Mexico_City' && 'MX') ||
  (tz === 'UTC' && 'UTC') ||
  tz

const Build: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [meName, setMeName] = useState('You')
  const [people, setPeople] = useState<Person[]>(DEFAULT_PEOPLE)

  const [selectedPersonId, setSelectedPersonId] = useState<string>('me')
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false)
  const [expandedCalls, setExpandedCalls] = useState(false)

  const [memoriesData] = useState<Memory[]>(() => {
    try {
      const raw = localStorage.getItem('emberMemoriesV1')
      if (raw) {
        const parsed: unknown = JSON.parse(raw)
        const normalized = normalizeMemories(parsed)
        if (normalized) return normalized
      }
    } catch {
      // ignore
    }
    return SAMPLE_MEMORIES
  })

  const [activeMemoryId, setActiveMemoryId] = useState<string | null>(null)
  const activeMemory = useMemo(
    () => (activeMemoryId ? memoriesData.find((m) => m.id === activeMemoryId) ?? null : null),
    [activeMemoryId, memoriesData],
  )

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Measure the bottom player so the list window never gets clipped by it.
  const playerRef = useRef<HTMLDivElement | null>(null)
  const [playerMetrics, setPlayerMetrics] = useState<{ bottomPx: number; heightPx: number }>({
    bottomPx: 24,
    heightPx: 96,
  })

  const shareContacts: ShareContact[] = useMemo(() => {
    try {
      const raw = localStorage.getItem('emberContactsV1')
      const parsed = raw ? (JSON.parse(raw) as unknown) : null
      return Array.isArray(parsed) ? (parsed as ShareContact[]) : []
    } catch {
      return []
    }
  }, [])

  const shareContactByName = useMemo(() => {
    const map = new Map<string, ShareContact>()
    for (const c of shareContacts) {
      const key = typeof c?.name === 'string' ? c.name.trim().toLowerCase() : ''
      if (!key) continue
      map.set(key, c)
    }
    return map
  }, [shareContacts])

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 150)
    try {
      const raw = localStorage.getItem('emberAccountData')
      if (raw) {
        const parsed = JSON.parse(raw) as { name?: string }
        const name = (parsed?.name ?? '').trim()
        if (name) setMeName(name)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    setPeople((prev) => prev.map((p) => (p.id === 'me' ? { ...p, name: meName || 'You' } : p)))
  }, [meName])

  // Wire audio element to state
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime || 0)
    const handleLoaded = () => setDuration(audio.duration || 0)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoaded)
    audio.addEventListener('ended', handleEnded)
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoaded)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Load & play when selecting a memory
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    setCurrentTime(0)
    setDuration(activeMemory?.durationSec ?? 0)
    if (!activeMemory?.audioUrl) {
      audio.pause()
      setIsPlaying(false)
      return
    }
    audio.src = activeMemory.audioUrl
    audio.load()
    setIsPlaying(true)
    audio.play().catch(() => setIsPlaying(false))
  }, [activeMemory?.audioUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!activeMemory?.audioUrl) return
    if (isPlaying) audio.play().catch(() => setIsPlaying(false))
    else audio.pause()
  }, [isPlaying, activeMemory?.audioUrl])

  useLayoutEffect(() => {
    const el = playerRef.current
    if (!el || typeof window === 'undefined') return

    let raf = 0
    const measure = () => {
      if (!playerRef.current) return
      const rect = playerRef.current.getBoundingClientRect()
      const bottomPx = Math.max(0, window.innerHeight - rect.bottom)
      const heightPx = Math.max(0, rect.height)
      setPlayerMetrics((prev) => {
        if (Math.abs(prev.bottomPx - bottomPx) < 1 && Math.abs(prev.heightPx - heightPx) < 1) return prev
        return { bottomPx, heightPx }
      })
    }

    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    const vv = window.visualViewport
    if (vv) {
      vv.addEventListener('resize', onResize)
      vv.addEventListener('scroll', onResize)
    }

    let ro: ResizeObserver | null = null
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(() => onResize())
      ro.observe(el)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      if (vv) {
        vv.removeEventListener('resize', onResize)
        vv.removeEventListener('scroll', onResize)
      }
      ro?.disconnect()
    }
  }, [activeMemoryId])

  const visibleMemories = useMemo(() => {
    return memoriesData
      .filter((m) => m.personId === selectedPersonId)
      .slice()
      .sort((a, b) => new Date(b.aboutDate).getTime() - new Date(a.aboutDate).getTime())
  }, [memoriesData, selectedPersonId])

  const selectedPersonName = useMemo(() => {
    return people.find((p) => p.id === selectedPersonId)?.name ?? meName ?? 'You'
  }, [people, selectedPersonId, meName])

  const nextCallsPreview = (c: ShareContact, count: number) => {
    const everyDays = Math.max(0, Math.min(99, Number(c.nextCallEveryDays ?? 1) || 1))
    const time = typeof c.nextCallTime === 'string' && /^\d{2}:\d{2}$/.test(c.nextCallTime) ? c.nextCallTime : '18:00'
    const [hh, mm] = time.split(':').map((x) => parseInt(x, 10))
    const tz = tzShort(typeof c.nextCallTimeZone === 'string' ? c.nextCallTimeZone : '')

    const now = new Date()
    let base = new Date(now)
    base.setSeconds(0, 0)
    base.setHours(Number.isFinite(hh) ? hh : 18, Number.isFinite(mm) ? mm : 0, 0, 0)
    if (base.getTime() <= now.getTime()) base = new Date(base.getTime() + everyDays * 24 * 60 * 60 * 1000)

    const timeLabel = (() => {
      try {
        const d = new Date()
        d.setHours(Number.isFinite(hh) ? hh : 18, Number.isFinite(mm) ? mm : 0, 0, 0)
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      } catch {
        return time
      }
    })()

    const items: Array<{ when: string; topic: string; note?: string }> = []
    for (let i = 0; i < count; i++) {
      const d = new Date(base.getTime() + i * everyDays * 24 * 60 * 60 * 1000)
      const when = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${timeLabel}${tz ? ` ${tz}` : ''}`
      const topic = c.nextCallTopicMode === 'custom' ? 'Custom Topic' : 'Biography (Default)'
      const note =
        c.nextCallTopicMode === 'custom' && typeof c.nextCallPrompt === 'string' && c.nextCallPrompt.trim()
          ? c.nextCallPrompt.trim()
          : undefined
      items.push({ when, topic, note })
    }
    return items
  }

  const share = shareContactByName.get(selectedPersonName.trim().toLowerCase()) ?? null
  const callCount = expandedCalls ? 10 : 3
  const calls = share ? nextCallsPreview(share, callCount) : []

  const handleSeek = (value: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value
    setCurrentTime(value)
  }

  const handleClosePlayer = () => {
    const audio = audioRef.current
    if (audio) audio.pause()
    setIsPlaying(false)
    setActiveMemoryId(null)
    setCurrentTime(0)
    setDuration(0)
  }

  return (
    <div
      className="build-page list-view"
      style={
        {
          '--build-player-bottom-px': `${playerMetrics.bottomPx}px`,
          '--build-player-height-px': `${playerMetrics.heightPx}px`,
        } as React.CSSProperties
      }
    >
      <Header hidePhone />

      <div className={`person-selector ${isLoaded ? 'visible' : ''}`}>
        <button className="person-selector-trigger" onClick={() => setIsPersonDropdownOpen(!isPersonDropdownOpen)}>
          <span className="person-selector-label">TIMELINE:</span>
          <span className="person-selector-name">{selectedPersonName}</span>
        </button>

        {isPersonDropdownOpen && (
          <>
            <div className="person-selector-backdrop" onClick={() => setIsPersonDropdownOpen(false)} />
            <div className="person-selector-menu">
              {people.map((p) => {
                const isSelected = selectedPersonId === p.id
                return (
                  <button
                    key={p.id}
                    className={`person-selector-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedPersonId(p.id)
                      setIsPersonDropdownOpen(false)
                      setExpandedCalls(false)
                    }}
                  >
                    {p.name}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div className="build-list-window ember-scroll">
        <section className="build-list-card">
          <div className="build-list-card-header">
            <div className="build-list-person">
              <div className="build-list-person-name">{selectedPersonName}</div>
              <div className="build-list-person-sub">
                {visibleMemories.length} {visibleMemories.length === 1 ? 'story' : 'stories'}
              </div>
            </div>
          </div>

          <div className="build-list-grid">
            <div className="build-list-panel">
              <div className="build-list-label">STORIES</div>
              {visibleMemories.length === 0 ? (
                <div className="build-list-empty">No stories yet.</div>
              ) : (
                <div className="build-story-list">
                  {visibleMemories.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className={`build-story-row ${activeMemoryId === m.id ? 'active' : ''}`}
                      onClick={() => setActiveMemoryId(m.id)}
                    >
                      <div className="build-story-meta">
                        <div className="build-story-title">{m.title}</div>
                        <div className="build-story-sub">
                          <span>{formatDateNumeric(m.aboutDate)}</span>
                          {typeof m.durationSec === 'number' && isFinite(m.durationSec) ? (
                            <>
                              <span className="build-story-dot">·</span>
                              <span>{formatTime(m.durationSec)}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="build-story-action">PLAY</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="build-list-panel">
              <div className="build-list-label">UPCOMING CALLS</div>
              {!share ? (
                <div className="build-list-empty">No schedule yet.</div>
              ) : (
                <>
                  <div className="build-call-list">
                    {calls.slice(0, callCount).map((c, idx) => (
                      <div key={`call-${idx}`} className="build-call-row">
                        <div className="build-call-when">{c.when}</div>
                        <div className="build-call-topic">
                          {c.topic}
                          {c.note ? <span className="build-call-note"> — {c.note}</span> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="build-call-more" onClick={() => setExpandedCalls((v) => !v)}>
                    {expandedCalls ? 'Show less' : 'Show more'}
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Bottom player */}
      {activeMemory ? (
        <div ref={playerRef} className="build-player" role="region" aria-label="Audio player">
          <div className="player-left">
            <div className="player-dot glass-clear" style={{ '--player-color': 'rgba(255,255,255,0.65)' } as React.CSSProperties} />
            <div className="player-meta">
              <div className="player-title" title={activeMemory.title}>
                {activeMemory.title}
              </div>
              <div className="player-sub">
                <span className="player-sub-person">{selectedPersonName}</span>
                <span className="player-sub-sep">·</span>
                <span className="player-sub-label">ABOUT:</span>
                <span className="player-sub-value">{formatDateNumeric(activeMemory.aboutDate)}</span>
              </div>
            </div>
          </div>

          <div className="player-center">
            {(() => {
              const effectiveDuration = duration > 0 ? duration : activeMemory.durationSec ?? 0
              return (
                <>
                  <button
                    type="button"
                    className="player-btn"
                    onClick={() => setIsPlaying((p) => !p)}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    disabled={!activeMemory.audioUrl}
                  >
                    {isPlaying ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6.5" y="4.5" width="4.25" height="15" rx="0.75" />
                        <rect x="13.25" y="4.5" width="4.25" height="15" rx="0.75" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5.5v13a1 1 0 0 0 1.55.83l10-6.5a1 1 0 0 0 0-1.66l-10-6.5A1 1 0 0 0 8 5.5z" />
                      </svg>
                    )}
                  </button>

                  <div className="player-progress">
                    <span className="player-time">{formatTime(currentTime)}</span>
                    <input
                      className="player-slider"
                      type="range"
                      min={0}
                      max={effectiveDuration}
                      value={Math.min(currentTime, effectiveDuration)}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      disabled={!activeMemory.audioUrl}
                    />
                    <span className="player-time">{formatTime(effectiveDuration)}</span>
                  </div>
                </>
              )
            })()}
          </div>

          <div className="player-right">
            <button type="button" className="player-close" onClick={handleClosePlayer} aria-label="Close player">
              ×
            </button>
          </div>

          <audio ref={audioRef} preload="metadata" />
        </div>
      ) : (
        <div ref={playerRef} className="build-player idle" role="region" aria-label="Audio player">
          <div className="player-left">
            <div className="player-dot glass-clear" style={{ '--player-color': 'rgba(255,255,255,0.35)' } as React.CSSProperties} />
            <div className="player-meta">
              <div className="player-title">Select a story to play</div>
            </div>
          </div>
          <div className="player-center">
            <button type="button" className="player-btn" disabled aria-label="Play (disabled)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5.5v13a1 1 0 0 0 1.55.83l10-6.5a1 1 0 0 0 0-1.66l-10-6.5A1 1 0 0 0 8 5.5z" />
              </svg>
            </button>
            <div className="player-progress">
              <span className="player-time">0:00</span>
              <input className="player-slider" type="range" min={0} max={1} value={0} disabled />
              <span className="player-time">0:00</span>
            </div>
          </div>
          <div className="player-right" />
        </div>
      )}
    </div>
  )
}

export default Build


