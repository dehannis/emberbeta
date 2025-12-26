import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { generateSampleMemories } from '../data/sampleMemories'
import './Remember.css'
import './Play.css'

const PLACEHOLDER_QUOTES = [
  'I didn’t realize it at the time, but that moment stayed with me.',
  'Some memories don’t fade—they just change shape.',
  'I can still hear the room, the pause, the breath before the story.',
  'There are days that quietly become the foundation for everything else.',
]

const hash32 = (seed: string) => {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const Play: React.FC = () => {
  const { recordingId } = useParams<{ recordingId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [typedQuote, setTypedQuote] = useState('')
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const playConstraintEndRef = useRef<number | null>(null)
  const autoplayDidRunRef = useRef(false)
  const touchRef = useRef<{ x: number; y: number; t: number; tracking: boolean } | null>(null)
  const pointerSwipeRef = useRef<{ x: number; y: number; t: number; tracking: boolean; id: number } | null>(null)
  const wheelNavRef = useRef<{ t: number } | null>(null)
  const SWIPE_HINT_KEY = 'emberPlaySwipeHintDismissedV1'
  const [showSwipeHint, setShowSwipeHint] = useState(() => {
    try {
      return localStorage.getItem(SWIPE_HINT_KEY) !== '1'
    } catch {
      return true
    }
  })
  const REACTIONS_KEY = 'emberPlayReactionsV1'
  const [reactOpen, setReactOpen] = useState(false)
  const [reactEmoji, setReactEmoji] = useState<'like' | 'laugh' | 'sad' | 'heart' | 'fist' | 'puke' | 'angry' | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [commentSaved, setCommentSaved] = useState<string | null>(null)
  const reactPanelRef = useRef<HTMLDivElement | null>(null)

  const quoteFromNav = (location.state as any)?.quote as string | undefined
  const creatorName = (location.state as any)?.creatorName as string | undefined
  const playMeta = (location.state as any)?.playMeta as
    | { title?: string; topic?: string; dateISO?: string }
    | undefined

  const allMemories = useMemo(() => generateSampleMemories(), [])
  const memory = useMemo(() => {
    if (!recordingId) return null
    return allMemories.find((m) => m.recordingId === recordingId) ?? null
  }, [allMemories, recordingId])

  const metaTitle = playMeta?.title ?? memory?.title ?? 'Memory'
  const metaTopic = playMeta?.topic ?? memory?.topic ?? 'Home'
  const metaDate = useMemo(() => {
    const iso = playMeta?.dateISO
    const d = iso ? new Date(iso) : memory?.date ?? new Date()
    return Number.isFinite(d.getTime()) ? d : new Date()
  }, [memory?.date, playMeta?.dateISO])
  const effectiveCreatorName = creatorName ?? memory?.creatorName ?? 'Me'

  const STORAGE_KEY = 'emberPlayEditsV1'
  const [titleDraft, setTitleDraft] = useState(metaTitle)
  const [themesDraft, setThemesDraft] = useState<string[]>([])
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isEditingThemes, setIsEditingThemes] = useState(false)
  const titleBeforeEditRef = useRef<string>('')
  const themesBeforeEditRef = useRef<string[]>([])

  const quote = useMemo(() => {
    if (quoteFromNav && typeof quoteFromNav === 'string') return quoteFromNav
    return PLACEHOLDER_QUOTES[Math.floor(Math.random() * PLACEHOLDER_QUOTES.length)]
  }, [quoteFromNav])

  const formatDate = (date: Date) =>
    date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })

  const themesGenerated = useMemo(() => {
    const emotionThemes = ['Nostalgic', 'Bittersweet', 'Tender', 'Grateful', 'Reflective', 'Joyful']
    const topicThemes: Record<string, string[]> = {
      Home: ['Home', 'Childhood', 'Family'],
      Family: ['Family', 'Traditions', 'Belonging'],
      Food: ['Food', 'Rituals', 'Care'],
      School: ['School', 'Friendship', 'Growing up'],
      Work: ['Work', 'Identity', 'Ambition'],
      Places: ['Places', 'Travel', 'Change'],
      'Turning Points': ['Turning points', 'Courage', 'Change'],
    }

    const pool = topicThemes[metaTopic] ?? [metaTopic, 'Memory', 'Life']
    const seed = `${recordingId ?? ''}:${metaTitle}:${metaTopic}:${effectiveCreatorName ?? ''}`
    let h = 2166136261
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    const pick = (arr: string[], offset: number) => arr[(Math.abs(h + offset) >>> 0) % arr.length]

    const emotion = pick(emotionThemes, 11)
    const t1 = pick(pool, 3)
    const t2 = pick(pool, 7)
    const t3 = pick(['Identity', 'Love', 'Time', 'Growing up', 'Home', 'Family', 'Change'], 19)

    const uniq = Array.from(new Set([t1, t2, t3, emotion])).filter(Boolean)
    // Ensure at least 3 themes, including one emotion.
    const out = uniq.slice(0, 4)
    if (!out.includes(emotion)) out.push(emotion)
    return out.slice(0, Math.max(3, out.length))
  }, [effectiveCreatorName, metaTitle, metaTopic, recordingId])

  // Load persisted edits for this recording (title + themes).
  useEffect(() => {
    setTitleDraft(metaTitle)
    setThemesDraft(themesGenerated)

    if (!recordingId) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const byId = parsed && typeof parsed === 'object' ? parsed : null
      const saved = byId && recordingId in byId ? byId[recordingId] : null
      if (saved && typeof saved === 'object') {
        if (typeof saved.title === 'string' && saved.title.trim()) setTitleDraft(saved.title)
        if (Array.isArray(saved.themes)) {
          const cleaned = saved.themes
            .filter((t: any) => typeof t === 'string')
            .map((t: string) => t.trim())
            .filter(Boolean)
          if (cleaned.length) setThemesDraft(cleaned)
        }
      }
    } catch {
      // ignore
    }
  }, [metaTitle, recordingId, themesGenerated])

  // Reset per-recording ephemeral state so swipe navigation feels like a fresh page.
  useEffect(() => {
    autoplayDidRunRef.current = false
    playConstraintEndRef.current = null
    setIsPlaying(false)
    setCurrentTime(0)
    setTypedQuote('')
    setActiveSentenceIdx(0)
    setReactOpen(false)
    setCommentSaved(null)
  }, [recordingId])

  // Load persisted reactions for this recording.
  useEffect(() => {
    if (!recordingId) return
    setReactEmoji(null)
    setCommentDraft('')
    setCommentSaved(null)
    try {
      const raw = localStorage.getItem(REACTIONS_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const byId = parsed && typeof parsed === 'object' ? parsed : null
      const saved = byId && recordingId in byId ? byId[recordingId] : null
      if (saved && typeof saved === 'object') {
        const e = (saved as any).emoji
        if (e === 'like' || e === 'laugh' || e === 'sad' || e === 'heart' || e === 'fist' || e === 'puke' || e === 'angry') setReactEmoji(e)
        const c = (saved as any).comment
        if (typeof c === 'string') setCommentDraft(c)
        if (typeof c === 'string' && c.trim()) setCommentSaved(c.trim())
      }
    } catch {
      // ignore
    }
  }, [recordingId])

  const snippetDurationSec = useMemo(() => {
    // Snippet is 30–60 seconds.
    const seed = `${recordingId ?? ''}:${metaTitle}:${metaTopic}:snippetLen`
    const add = hash32(seed) % 31 // 0..30
    return 30 + add
  }, [metaTitle, metaTopic, recordingId])

  const fullDurationSec = useMemo(() => {
    // Full topic recording is a random length in [10..20] minutes, deterministic per recording.
    // Since "topic" is the long recording, keep this stable across memories in the same topic (+ creator).
    const seed = `${memory?.creatorId ?? ''}:${metaTopic}:fullLen`
    const add = hash32(seed) % 601 // 0..600 seconds
    return 600 + add // 10:00 .. 20:00
  }, [memory?.creatorId, metaTopic])

  const snippetWindowFor = useCallback(
    (args: { recordingId?: string; title: string; topic: string; snippetDurationSec: number }) => {
      const rid = args.recordingId ?? ''
      const pad = 10 // avoid starting exactly at 0
      const maxStart = Math.max(pad, fullDurationSec - args.snippetDurationSec - pad)
      const seed = `${rid}:${args.title}:${args.topic}:snippetStart`
      const start = pad + (hash32(seed) % Math.max(1, Math.floor(maxStart - pad + 1)))
      const end = Math.min(fullDurationSec, start + args.snippetDurationSec)
      return { startSec: start, endSec: end }
    },
    [fullDurationSec],
  )

  const snippetWindow = useMemo(() => {
    return snippetWindowFor({
      recordingId,
      title: metaTitle,
      topic: metaTopic,
      snippetDurationSec,
    })
  }, [metaTitle, metaTopic, recordingId, snippetDurationSec, snippetWindowFor])

  const inSnippet = currentTime >= snippetWindow.startSec && currentTime <= snippetWindow.endSec

  const sessionMemories = useMemo(() => {
    // "Session" ~= same creator + same topic, newest-to-oldest.
    if (!memory) return []
    const list = allMemories
      .filter((m) => m.creatorId === memory.creatorId && m.topic === memory.topic)
      .slice()
      .sort((a, b) => b.date.getTime() - a.date.getTime())
    return list
  }, [allMemories, memory])

  const sessionIndex = useMemo(() => {
    if (!memory) return -1
    return sessionMemories.findIndex((m) => m.recordingId === memory.recordingId)
  }, [memory, sessionMemories])

  const prevMemory = sessionIndex >= 0 ? sessionMemories[sessionIndex + 1] ?? null : null
  const nextMemory = sessionIndex > 0 ? sessionMemories[sessionIndex - 1] ?? null : null

  const prevSnippetWindow = useMemo(() => {
    if (!prevMemory?.recordingId) return null
    const seed = `${prevMemory.recordingId}:${prevMemory.title}:${prevMemory.topic}:snippetLen`
    const len = 30 + (hash32(seed) % 31)
    return snippetWindowFor({
      recordingId: prevMemory.recordingId,
      title: prevMemory.title,
      topic: prevMemory.topic,
      snippetDurationSec: len,
    })
  }, [prevMemory?.recordingId, prevMemory?.title, prevMemory?.topic, snippetWindowFor])

  const nextSnippetWindow = useMemo(() => {
    if (!nextMemory?.recordingId) return null
    const seed = `${nextMemory.recordingId}:${nextMemory.title}:${nextMemory.topic}:snippetLen`
    const len = 30 + (hash32(seed) % 31)
    return snippetWindowFor({
      recordingId: nextMemory.recordingId,
      title: nextMemory.title,
      topic: nextMemory.topic,
      snippetDurationSec: len,
    })
  }, [nextMemory?.recordingId, nextMemory?.title, nextMemory?.topic, snippetWindowFor])

  const simulatedTranscript = useMemo(() => {
    const tone = themesDraft.find((t) =>
      ['nostalgic', 'bittersweet', 'tender', 'grateful', 'reflective', 'joyful'].includes((t || '').toLowerCase()),
    )
    const t1 = themesDraft[0] ?? metaTopic
    const t2 = themesDraft[1] ?? 'Family'
    const t3 = themesDraft[2] ?? 'Time'
    const who = effectiveCreatorName || 'Me'

    // First sentence is always the “main quote”
    const s0 = quote.trim()
    const candidates = [
      `It’s strange how ${t1.toLowerCase()} can feel so vivid, even years later.`,
      `I think about ${t2.toLowerCase()} a lot when I remember ${metaTopic.toLowerCase()}.`,
      `There was this small detail—${t3.toLowerCase()}—that made it all feel real.`,
      `I didn’t say it out loud then, but I was ${tone ? tone.toLowerCase() : 'aware'} in a way I hadn’t been before.`,
      `When ${who.toLowerCase()} tells it now, it sounds simple, but it wasn’t.`,
      `And that’s why this memory keeps returning—quietly, at the edges.`,
    ]

    // Deterministic shuffle
    const seed = `${recordingId ?? ''}:${metaTitle}:${metaTopic}:${quote}`
    let h = 2166136261
    for (let i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    const pick = (i: number) => candidates[(Math.abs(h + i * 97) >>> 0) % candidates.length]

    const extraCount = 5
    const extras = Array.from({ length: extraCount }, (_, i) => pick(i))
    const uniq = Array.from(new Set([s0, ...extras])).filter(Boolean)
    return uniq.slice(0, 6) // 1 + up to 5 more sentences
  }, [effectiveCreatorName, metaTitle, metaTopic, quote, recordingId, themesDraft])

  const revealTimes = useMemo(() => {
    // Reveal 1st line at t=0, then each next line every ~3-5s across the snippet.
    const n = simulatedTranscript.length
    if (n <= 1) return [0]
    const step = snippetDurationSec / (n + 0.5)
    return Array.from({ length: n }, (_, i) => Math.max(0, Math.round(i * step)))
  }, [snippetDurationSec, simulatedTranscript.length])

  const persistPatch = (patch: { title?: string; themes?: string[] }) => {
    if (!recordingId) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const byId = parsed && typeof parsed === 'object' ? parsed : {}
      const prev = (byId as any)[recordingId] && typeof (byId as any)[recordingId] === 'object'
        ? (byId as any)[recordingId]
        : {}
      ;(byId as any)[recordingId] = { ...prev, ...patch }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(byId))
    } catch {
      // ignore
    }
  }

  const saveTitle = () => {
    const next = titleDraft.trim() || metaTitle
    setTitleDraft(next)
    persistPatch({ title: next })
  }

  const saveThemeAt = (idx: number) => {
    setThemesDraft((prev) => {
      const next = [...prev]
      const v = (next[idx] ?? '').trim()
      next[idx] = v || next[idx] || ''
      const cleaned = next.map((t) => t.trim()).filter(Boolean)
      persistPatch({ themes: cleaned })
      return next
    })
  }

  const formatTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds))
    const m = Math.floor(s / 60)
    const ss = s % 60
    return `${m}:${String(ss).padStart(2, '0')}`
  }

  // Track which sentence is currently "active" based on playback time.
  useEffect(() => {
    if (!inSnippet) {
      setActiveSentenceIdx(0)
      return
    }
    const t = Math.max(0, Math.min(snippetDurationSec, currentTime - snippetWindow.startSec))
    let idx = 0
    for (let i = 0; i < revealTimes.length; i++) {
      if (t >= revealTimes[i]) idx = i
    }
    setActiveSentenceIdx(Math.max(0, Math.min(simulatedTranscript.length - 1, idx)))
  }, [currentTime, inSnippet, revealTimes, simulatedTranscript.length, snippetDurationSec, snippetWindow.startSec])

  // Typewriter: type ONLY the active sentence.
  useEffect(() => {
    if (!inSnippet) {
      setTypedQuote('')
      return
    }
    const sentence = simulatedTranscript[activeSentenceIdx] ?? ''
    setTypedQuote('')
    if (!sentence) return

    let raf = 0
    const stepMs = 18
    let last = performance.now()

    const tick = (now: number) => {
      const elapsed = now - last
      if (elapsed >= stepMs) {
        last = now
        setTypedQuote((prev) => (prev.length >= sentence.length ? prev : sentence.slice(0, prev.length + 1)))
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [activeSentenceIdx, inSnippet, simulatedTranscript])

  // Simulated playback (placeholder implementation): advances across the full timeline.
  useEffect(() => {
    if (!isPlaying) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setCurrentTime((prev) => {
        const next = Math.min(fullDurationSec, prev + dt)
        const constraintEnd = playConstraintEndRef.current
        if (typeof constraintEnd === 'number' && Number.isFinite(constraintEnd) && next >= constraintEnd) {
          playConstraintEndRef.current = null
          // stop exactly at snippet end
          queueMicrotask(() => setIsPlaying(false))
          return constraintEnd
        }
        if (next >= fullDurationSec) {
          queueMicrotask(() => setIsPlaying(false))
          return fullDurationSec
        }
        return next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [fullDurationSec, isPlaying])

  // Autoplay only the snippet on first mount: jump to snippet start, play, pause at snippet end.
  useEffect(() => {
    if (autoplayDidRunRef.current) return
    autoplayDidRunRef.current = true
    setCurrentTime(snippetWindow.startSec)
    playConstraintEndRef.current = snippetWindow.endSec
    setIsPlaying(true)
  }, [snippetWindow.endSec, snippetWindow.startSec])

  const navigateToMemory = (targetRecordingId: string) => {
    const m = allMemories.find((mm) => mm.recordingId === targetRecordingId)
    const nextState = {
      fromPlaySwipe: true,
      quote: PLACEHOLDER_QUOTES[Math.floor(Math.random() * PLACEHOLDER_QUOTES.length)],
      creatorName: m?.creatorName ?? effectiveCreatorName,
      playMeta: {
        title: m?.title ?? metaTitle,
        topic: m?.topic ?? metaTopic,
        dateISO: (m?.date ?? metaDate).toISOString(),
      },
    }
    navigate(`/play/${targetRecordingId}`, { state: nextState })
  }

  const dismissSwipeHint = () => {
    if (!showSwipeHint) return
    setShowSwipeHint(false)
    try {
      localStorage.setItem(SWIPE_HINT_KEY, '1')
    } catch {
      // ignore
    }
  }

  const handleSwipe = (dir: 'prev' | 'next') => {
    dismissSwipeHint()
    if (dir === 'prev') {
      if (prevMemory?.recordingId) navigateToMemory(prevMemory.recordingId)
      return
    }
    if (nextMemory?.recordingId) navigateToMemory(nextMemory.recordingId)
  }

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const now = performance.now()
    const last = wheelNavRef.current?.t ?? 0
    if (now - last < 650) return

    const dx = e.deltaX
    const dy = e.deltaY
    const horiz = Math.abs(dx) > Math.abs(dy) ? dx : e.shiftKey ? dy : 0
    if (Math.abs(horiz) < 28) return
    wheelNavRef.current = { t: now }

    // Trackpad/mouse horizontal scroll:
    // negative => swipe left => next, positive => swipe right => prev
    if (horiz < 0) handleSwipe('next')
    else handleSwipe('prev')
  }

  const isInteractiveTarget = (target: EventTarget | null) => {
    if (!(target instanceof Element)) return false
    return Boolean(target.closest('button, input, textarea, select, a, [role="button"]'))
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(e.target)) return
    // For mouse: only primary button drag should count.
    if (e.pointerType === 'mouse' && e.button !== 0) return
    pointerSwipeRef.current = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      tracking: true,
      id: e.pointerId,
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerSwipeRef.current
    if (!start || start.id !== e.pointerId || !start.tracking) return
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    if (Math.abs(dy) > Math.abs(dx) * 1.1 && Math.abs(dy) > 14) start.tracking = false
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = pointerSwipeRef.current
    if (!start || start.id !== e.pointerId || !start.tracking) return
    pointerSwipeRef.current = null
    const dx = e.clientX - start.x
    const dy = e.clientY - start.y
    const dt = performance.now() - start.t
    if (dt > 1200) return
    if (Math.abs(dx) < 44) return
    if (Math.abs(dx) < Math.abs(dy) * 1.2) return
    if (dx < 0) handleSwipe('next')
    else handleSwipe('prev')
  }

  const persistReactionPatch = (patch: { emoji?: 'like' | 'laugh' | 'sad' | 'heart' | 'fist' | 'puke' | 'angry' | null; comment?: string | null }) => {
    if (!recordingId) return
    try {
      const raw = localStorage.getItem(REACTIONS_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const byId = parsed && typeof parsed === 'object' ? parsed : {}
      const prev = (byId as any)[recordingId] && typeof (byId as any)[recordingId] === 'object' ? (byId as any)[recordingId] : {}
      const next = {
        ...prev,
        ...(patch.emoji !== undefined ? { emoji: patch.emoji } : null),
        ...(patch.comment !== undefined ? { comment: patch.comment } : null),
      }
      ;(byId as any)[recordingId] = next
      localStorage.setItem(REACTIONS_KEY, JSON.stringify(byId))
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (!reactOpen) return
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') setReactOpen(false)
    }
    const onPointerDown = (ev: PointerEvent) => {
      const el = reactPanelRef.current
      if (!el) return
      if (ev.target instanceof Node && el.contains(ev.target)) return
      setReactOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [reactOpen])

  const togglePlay = () => {
    setIsPlaying((prev) => {
      const next = !prev
      if (next) {
        // If starting play within the snippet window, constrain play to stop at snippet end.
        if (currentTime >= snippetWindow.startSec && currentTime < snippetWindow.endSec) {
          playConstraintEndRef.current = snippetWindow.endSec
        } else {
          playConstraintEndRef.current = null
        }
      } else {
        playConstraintEndRef.current = null
      }
      return next
    })
  }

  const seek = (t: number) => {
    const clamped = Math.max(0, Math.min(fullDurationSec, t))
    setCurrentTime(clamped)
    // If user seeks outside snippet, remove the snippet-only constraint.
    if (clamped < snippetWindow.startSec || clamped > snippetWindow.endSec) {
      playConstraintEndRef.current = null
    }
  }

  return (
    <div
      className="remember-page play-page"
      onWheel={handleWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        pointerSwipeRef.current = null
      }}
      onTouchStart={(e) => {
        const t = e.touches[0]
        if (!t) return
        touchRef.current = { x: t.clientX, y: t.clientY, t: performance.now(), tracking: true }
      }}
      onTouchMove={(e) => {
        const t = e.touches[0]
        const start = touchRef.current
        if (!t || !start || !start.tracking) return
        const dx = t.clientX - start.x
        const dy = t.clientY - start.y
        // If vertical intent dominates, stop tracking (don’t interfere).
        if (Math.abs(dy) > Math.abs(dx) * 1.15 && Math.abs(dy) > 16) {
          start.tracking = false
        }
      }}
      onTouchEnd={(e) => {
        const start = touchRef.current
        touchRef.current = null
        if (!start || !start.tracking) return
        const t = e.changedTouches[0]
        if (!t) return
        const dx = t.clientX - start.x
        const dy = t.clientY - start.y
        const dt = performance.now() - start.t
        if (Math.abs(dx) < 44) return
        if (Math.abs(dx) < Math.abs(dy) * 1.25) return
        // A quick horizontal gesture: swipe left => next, swipe right => prev.
        if (dt > 1200) return
        if (dx < 0) handleSwipe('next')
        else handleSwipe('prev')
      }}
    >
      <Header />
      <div className="play-react" ref={reactPanelRef} role="region" aria-label="Reactions">
        <button
          type="button"
          className="play-react-btn"
          aria-label="React"
          onClick={() => setReactOpen((p) => !p)}
        >
          React
          {reactEmoji === 'like' && <span className="play-react-badge" aria-hidden="true">👍</span>}
          {reactEmoji === 'laugh' && <span className="play-react-badge" aria-hidden="true">😂</span>}
          {reactEmoji === 'sad' && <span className="play-react-badge" aria-hidden="true">😢</span>}
          {reactEmoji === 'heart' && <span className="play-react-badge" aria-hidden="true">❤️</span>}
          {reactEmoji === 'fist' && <span className="play-react-badge" aria-hidden="true">👊</span>}
          {reactEmoji === 'puke' && <span className="play-react-badge" aria-hidden="true">🤮</span>}
          {reactEmoji === 'angry' && <span className="play-react-badge" aria-hidden="true">😡</span>}
          {commentSaved && <span className="play-react-dot" aria-hidden="true" />}
        </button>

        {reactOpen && (
          <div className="play-react-panel" role="dialog" aria-label="Add a reaction">
            <div className="play-react-row">
              <button
                type="button"
                className={`play-react-chip ${reactEmoji === 'like' ? 'is-active' : ''}`}
                onClick={() => {
                  setReactEmoji('like')
                  persistReactionPatch({ emoji: 'like' })
                  setReactOpen(false)
                }}
                aria-label="Like"
              >
                👍
              </button>
              <button
                type="button"
                className={`play-react-chip ${reactEmoji === 'laugh' ? 'is-active' : ''}`}
                onClick={() => {
                  setReactEmoji('laugh')
                  persistReactionPatch({ emoji: 'laugh' })
                  setReactOpen(false)
                }}
                aria-label="Laugh"
              >
                😂
              </button>
              <button
                type="button"
                className={`play-react-chip ${reactEmoji === 'sad' ? 'is-active' : ''}`}
                onClick={() => {
                  setReactEmoji('sad')
                  persistReactionPatch({ emoji: 'sad' })
                  setReactOpen(false)
                }}
                aria-label="Sad"
              >
                😢
              </button>
              <button
                type="button"
                className={`play-react-chip ${reactEmoji === 'heart' ? 'is-active' : ''}`}
                onClick={() => {
                  setReactEmoji('heart')
                  persistReactionPatch({ emoji: 'heart' })
                  setReactOpen(false)
                }}
                aria-label="Heart"
              >
                ❤️
              </button>
              <button
                type="button"
                className={`play-react-chip ${reactEmoji === 'fist' ? 'is-active' : ''}`}
                onClick={() => {
                  setReactEmoji('fist')
                  persistReactionPatch({ emoji: 'fist' })
                  setReactOpen(false)
                }}
                aria-label="Fist bump"
              >
                👊
              </button>
              <button
                type="button"
                className={`play-react-chip ${reactEmoji === 'puke' ? 'is-active' : ''}`}
                onClick={() => {
                  setReactEmoji('puke')
                  persistReactionPatch({ emoji: 'puke' })
                  setReactOpen(false)
                }}
                aria-label="Puke"
              >
                🤮
              </button>
              <button
                type="button"
                className={`play-react-chip ${reactEmoji === 'angry' ? 'is-active' : ''}`}
                onClick={() => {
                  setReactEmoji('angry')
                  persistReactionPatch({ emoji: 'angry' })
                  setReactOpen(false)
                }}
                aria-label="Angry"
              >
                😡
              </button>
            </div>

            <div className="play-react-comment">
              <div className="play-react-commentHeader">
                <div className="play-react-label">Comment</div>
                {commentSaved && <div className="play-react-saved">Saved</div>}
              </div>
              <div className="play-react-commentRow">
                <input
                  className="play-react-input"
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Add a short note…"
                  aria-label="Comment"
                />
                <button
                  type="button"
                  className="play-react-send"
                  onClick={() => {
                    const v = commentDraft.trim()
                    setCommentSaved(v || null)
                    persistReactionPatch({ comment: v || null })
                    setReactOpen(false)
                  }}
                  disabled={!commentDraft.trim()}
                  aria-label="Save comment"
                >
                  ✓
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="remember-content remember-content--visible">
        {/* Match Remember page header format, but only show the active creator */}
        <div className="creator-header">
          <div className="creator-header__carousel">
            <button
              type="button"
              className="creator-name creator-name--active"
              style={{
                transform: 'translate(-50%, 0) translate(0px, 0px) scale(1)',
                opacity: 1,
                pointerEvents: 'none',
              }}
              aria-label="Active creator"
            >
              {effectiveCreatorName || 'Me'}
            </button>
          </div>
        </div>

        {/* Match Remember page layout, but remove blocks/threads. */}
        <main className="remember-container" aria-label={`Recording ${recordingId ?? ''}`}>
          <div className="play-quote">{inSnippet ? typedQuote : metaTopic}</div>
        </main>

        {showSwipeHint && (
          <div className="play-swipeHint" aria-hidden="true">
            Swipe for next memory →
          </div>
        )}
      </div>

      <aside className="play-meta" aria-label="Memory details">
        <div className="play-meta-inner">
          <div className="play-meta-row">
            <span className="play-meta-label">Memory title</span>
            {!isEditingTitle ? (
              <span className="play-meta-line">
                <span className="play-meta-value" title={titleDraft}>
                  {titleDraft}
                </span>
                <button
                  type="button"
                  className="play-meta-icon"
                  aria-label="Edit title"
                  onClick={() => {
                    titleBeforeEditRef.current = titleDraft
                    setIsEditingTitle(true)
                  }}
                >
                  ✎
                </button>
              </span>
            ) : (
              <span className="play-meta-line play-meta-line--editing">
                <input
                  className="play-meta-input"
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  aria-label="Title"
                />
                <button
                  type="button"
                  className="play-meta-icon"
                  aria-label="Save title"
                  onClick={() => {
                    saveTitle()
                    setIsEditingTitle(false)
                  }}
                >
                  ✓
                </button>
                <button
                  type="button"
                  className="play-meta-icon"
                  aria-label="Cancel title edit"
                  onClick={() => {
                    setTitleDraft(titleBeforeEditRef.current || metaTitle)
                    setIsEditingTitle(false)
                  }}
                >
                  ×
                </button>
              </span>
            )}
          </div>
          <div className="play-meta-row">
            <span className="play-meta-label">From topic</span>
            <span className="play-meta-value">{metaTopic}</span>
          </div>
          <div className="play-meta-row">
            <span className="play-meta-label">Recorded on</span>
            <span className="play-meta-value">{formatDate(metaDate)}</span>
          </div>
          <div className="play-meta-row play-meta-row--themes">
            <span className="play-meta-label">Themes</span>
            {!isEditingThemes ? (
              <span className="play-meta-line">
                <span className="play-meta-value" title={themesDraft.filter(Boolean).join(' · ')}>
                  {themesDraft.filter(Boolean).join(' · ')}
                </span>
                <button
                  type="button"
                  className="play-meta-icon"
                  aria-label="Edit themes"
                  onClick={() => {
                    themesBeforeEditRef.current = [...themesDraft]
                    setIsEditingThemes(true)
                  }}
                >
                  ✎
                </button>
              </span>
            ) : (
              <div className="play-meta-themesRow" aria-label="Edit themes">
                <div className="play-meta-themesPills">
                  {themesDraft.slice(0, 6).map((t, idx) => (
                    <div key={`${idx}`} className="play-meta-pill">
                      <input
                        className="play-meta-pillInput"
                        value={t}
                        onChange={(e) => {
                          const v = e.target.value
                          setThemesDraft((prev) => {
                            const next = [...prev]
                            next[idx] = v
                            return next
                          })
                        }}
                        aria-label={`Theme ${idx + 1}`}
                      />
                      <button
                        type="button"
                        className="play-meta-pillSave"
                        aria-label={`Save theme ${idx + 1}`}
                        onClick={() => saveThemeAt(idx)}
                      >
                        ✓
                      </button>
                    </div>
                  ))}
                </div>
                <div className="play-meta-themesActions">
                  <button
                    type="button"
                    className="play-meta-icon"
                    aria-label="Done editing themes"
                    onClick={() => setIsEditingThemes(false)}
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    className="play-meta-icon"
                    aria-label="Cancel themes edit"
                    onClick={() => {
                      setThemesDraft(themesBeforeEditRef.current?.length ? themesBeforeEditRef.current : themesDraft)
                      setIsEditingThemes(false)
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Sleek audio player */}
      <div className="play-player" role="region" aria-label="Player">
        <div className="play-player-inner">
          <button
            type="button"
            className="play-player-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <span className={isPlaying ? 'play-icon play-icon--pause' : 'play-icon play-icon--play'} aria-hidden="true" />
          </button>
          <div className="play-player-scrub">
            <div className="play-player-trackOverlay" aria-hidden="true">
              {prevSnippetWindow && (
                <div
                  className="play-player-clip play-player-clip--other"
                  style={
                    {
                      left: `${(prevSnippetWindow.startSec / fullDurationSec) * 100}%`,
                      width: `${((prevSnippetWindow.endSec - prevSnippetWindow.startSec) / fullDurationSec) * 100}%`,
                    } as React.CSSProperties
                  }
                />
              )}
              <div
                className="play-player-clip play-player-clip--current"
                style={
                  {
                    left: `${(snippetWindow.startSec / fullDurationSec) * 100}%`,
                    width: `${((snippetWindow.endSec - snippetWindow.startSec) / fullDurationSec) * 100}%`,
                  } as React.CSSProperties
                }
              />
              {nextSnippetWindow && (
                <div
                  className="play-player-clip play-player-clip--other"
                  style={
                    {
                      left: `${(nextSnippetWindow.startSec / fullDurationSec) * 100}%`,
                      width: `${((nextSnippetWindow.endSec - nextSnippetWindow.startSec) / fullDurationSec) * 100}%`,
                    } as React.CSSProperties
                  }
                />
              )}
            </div>
            <input
              className="play-player-range"
              type="range"
              min={0}
              max={fullDurationSec}
              value={Math.min(Math.max(0, currentTime), fullDurationSec)}
              step={0.25}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Seek"
              style={
                {
                  ['--progress' as any]: `${(currentTime / Math.max(1, fullDurationSec)) * 100}%`,
                } as React.CSSProperties
              }
            />
            <div className="play-player-times" aria-hidden="true">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(fullDurationSec)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Play


