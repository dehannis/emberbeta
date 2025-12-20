import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import './Build.css'

interface Memory {
  id: string
  title: string
  // The memory exists on the timeline at its About date.
  aboutDate: string
  // When the memory was recorded (may differ from About date).
  recordedOn: string
  // Duration of the recording (in seconds).
  durationSec?: number
  note: string
  personId: string
  visibility?: 'private' | 'shared'
  audioUrl?: string
}

interface Contact {
  id: string
  name: string
  color: string
  primaryColor: string // Vibrant color used when this person's memory is selected
}

interface Chapter {
  id: string
  label: string
  // Age range (inclusive) when this chapter applies
  minAge: number
  maxAge: number
  // Approximate year range will be calculated from birth year
}

interface TimelineChapter {
  id: string
  label: string
  startYear: number
  endYear: number
  isBuiltin: boolean
}

// Built-in chapter templates (used to seed editable chapters from birth year)
const BUILTIN_CHAPTERS: Chapter[] = [
  // IMPORTANT: These are contiguous age ranges so there are no empty years on the timeline.
  { id: 'growing-up', label: 'Growing Up', minAge: 0, maxAge: 5 },
  { id: 'elementary', label: 'Elementary School', minAge: 6, maxAge: 10 },
  { id: 'middle-school', label: 'Middle School', minAge: 11, maxAge: 13 },
  { id: 'high-school', label: 'High School', minAge: 14, maxAge: 17 },
  { id: 'college', label: 'College', minAge: 18, maxAge: 21 },
  { id: '20s', label: 'Twenties', minAge: 22, maxAge: 29 },
  { id: '30s', label: 'Thirties', minAge: 30, maxAge: 39 },
  { id: '40s', label: 'Forties', minAge: 40, maxAge: 49 },
  { id: '50s', label: 'Fifties', minAge: 50, maxAge: 59 },
  { id: '60s', label: 'Sixties', minAge: 60, maxAge: 69 },
  { id: '70s', label: 'Seventies', minAge: 70, maxAge: 79 },
  { id: '80s', label: 'Eighties', minAge: 80, maxAge: 89 },
  { id: '90s', label: 'Nineties', minAge: 90, maxAge: 99 },
]

function computeDefaultChapters(birthYear: number): TimelineChapter[] {
  const currentYear = new Date().getFullYear()
  const currentAge = Math.max(0, currentYear - birthYear)

  const chapters: TimelineChapter[] = []
  // Cover birthYear..currentYear contiguously (Present is included in the most recent chapter).
  for (const ch of BUILTIN_CHAPTERS) {
    if (ch.minAge > currentAge) break
    const startYear = birthYear + ch.minAge
    const endYear = Math.min(birthYear + ch.maxAge, currentYear)
    chapters.push({
      id: ch.id,
      label: ch.label,
      startYear,
      endYear,
      isBuiltin: true,
    })
    if (endYear === currentYear) break
  }

  return chapters.sort((a, b) => a.startYear - b.startYear || a.endYear - b.endYear)
}

function validateChaptersCoverEveryYear(draft: TimelineChapter[], birthYear: number): string | null {
  const currentYear = new Date().getFullYear()
  if (birthYear > currentYear) return 'Birth year must be <= current year.'
  const cleaned = draft
    .map((c) => ({ ...c, label: c.label.trim(), startYear: Number(c.startYear), endYear: Number(c.endYear) }))
    .filter((c) => c.label && Number.isFinite(c.startYear) && Number.isFinite(c.endYear))
    .map((c) => ({
      ...c,
      startYear: Math.max(c.startYear, birthYear),
      endYear: Math.min(c.endYear, currentYear),
    }))
    .filter((c) => c.startYear <= c.endYear)
    .sort((a, b) => a.startYear - b.startYear || a.endYear - b.endYear)

  if (cleaned.length === 0) return 'Chapters must cover every year since birth (no gaps).'
  if (cleaned[0].startYear !== birthYear) return `Chapters must start at ${birthYear}.`
  for (let i = 1; i < cleaned.length; i++) {
    const prev = cleaned[i - 1]
    const next = cleaned[i]
    const expected = prev.endYear + 1
    if (next.startYear !== expected) {
      return `Chapters must be contiguous: expected ${expected} after ${prev.endYear}.`
    }
  }
  const last = cleaned[cleaned.length - 1]
  if (last.endYear !== currentYear) return `Chapters must cover through Present (${currentYear}).`
  return null
}

// You + sample contacts (deeper muted for non-selected, vibrant when primary)
const ALL_PEOPLE: Contact[] = [
  { id: 'me', name: 'You', color: '#1a4a6e', primaryColor: '#002FA7' },        // Deeper blue, Yves Klein Blue when selected
  { id: 'john', name: 'Suchan Chae', color: '#8b4513', primaryColor: '#E65100' }, // Deeper saddle brown/orange
  { id: 'jane', name: 'Hank Lee', color: '#2d5a3d', primaryColor: '#1B8A3E' },    // Deeper forest green
]

// Sample memories
const SAMPLE_MEMORIES: Memory[] = [
  // TODO: Replace these demo URLs with real, signed audio URLs from your backend.
  { id: '1', title: 'Morning Reflection', recordedOn: '2024-03-15', aboutDate: '2024-03-15', durationSec: 156, note: 'A quiet moment...', personId: 'me', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: '2', title: 'Weekend Adventure', recordedOn: '2024-02-20', aboutDate: '2024-02-10', durationSec: 204, note: 'Hiking trip...', personId: 'john', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: '3', title: 'Coffee Chat', recordedOn: '2024-02-01', aboutDate: '2024-01-20', durationSec: 132, note: 'Catching up...', personId: 'jane', visibility: 'private', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: '4', title: 'New Year Goals', recordedOn: '2024-01-15', aboutDate: '2024-01-05', durationSec: 188, note: 'Setting intentions...', personId: 'me', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: '5', title: 'Birthday Party', recordedOn: '2023-11-20', aboutDate: '2023-11-15', durationSec: 242, note: 'Surprise party...', personId: 'john', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: '6', title: 'Project Launch', recordedOn: '2023-09-20', aboutDate: '2023-09-05', durationSec: 171, note: 'Celebrating...', personId: 'jane', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
  { id: '7', title: 'Summer Vacation', recordedOn: '2023-09-01', aboutDate: '2023-08-10', durationSec: 225, note: 'Beach memories...', personId: 'me', visibility: 'private', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' },
  { id: '8', title: 'Graduation Day', recordedOn: '2022-07-01', aboutDate: '2022-06-20', durationSec: 264, note: 'Finally finished...', personId: 'me', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },

  // Preloaded "timeline anchors" for the primary user (requested dates)
  { id: 'pre-2025-09-03', title: 'September 2025', recordedOn: '2025-09-03', aboutDate: '2025-09-03', durationSec: 143, note: '', personId: 'me', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
  { id: 'pre-2020-04-02', title: 'April 2020', recordedOn: '2020-04-02', aboutDate: '2020-04-02', durationSec: 221, note: '', personId: 'me', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
  { id: 'pre-2001-03-01', title: 'March 2001', recordedOn: '2001-03-01', aboutDate: '2001-03-01', durationSec: 176, note: '', personId: 'me', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3' },
  { id: 'pre-2002-03-04', title: 'March 2002', recordedOn: '2002-03-04', aboutDate: '2002-03-04', durationSec: 198, note: '', personId: 'me', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3' },
]

const PRELOADED_ORBS: Memory[] = [
  { id: 'pre-2025-09-03', title: 'September 2025', recordedOn: '2025-09-03', aboutDate: '2025-09-03', durationSec: 143, note: '', personId: 'me', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
  { id: 'pre-2020-04-02', title: 'April 2020', recordedOn: '2020-04-02', aboutDate: '2020-04-02', durationSec: 221, note: '', personId: 'me', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
  { id: 'pre-2001-03-01', title: 'March 2001', recordedOn: '2001-03-01', aboutDate: '2001-03-01', durationSec: 176, note: '', personId: 'me', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3' },
  { id: 'pre-2002-03-04', title: 'March 2002', recordedOn: '2002-03-04', aboutDate: '2002-03-04', durationSec: 198, note: '', personId: 'me', visibility: 'shared', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3' },
]

function isISODate(value: unknown): value is string {
  return typeof value === 'string' && /^\\d{4}-\\d{2}-\\d{2}$/.test(value)
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
    const aboutDate = (mm.aboutDate ?? legacyDate)
    const recordedOn = (mm.recordedOn ?? legacyDate ?? mm.aboutDate)

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

    const normalizedVisibility =
      personId === 'me' ? ((visibility as 'private' | 'shared' | undefined) ?? 'shared') : 'shared'

    result.push({
      id,
      title,
      note,
      personId,
      aboutDate,
      recordedOn,
      durationSec: durationSec as number | undefined,
      visibility: normalizedVisibility,
      audioUrl: audioUrl as string | undefined,
    })
  }
  return result
}

const Build: React.FC = () => {
  const navigate = useNavigate()
  const spiralRef = useRef<HTMLDivElement | null>(null)
  // MVP: list-only Build page (visual view removed from UI).
  // Keep `buildView` as state (without exposing a UI toggle) so the legacy visual code can remain without TS narrowing errors.
  const [buildView] = useState<'visual' | 'list'>('list')
  const playerRef = useRef<HTMLDivElement | null>(null)
  const [playerMetrics, setPlayerMetrics] = useState<{ bottomPx: number; heightPx: number }>({
    bottomPx: 24,
    heightPx: 96,
  })
  const [memoriesData, setMemoriesData] = useState<Memory[]>(() => {
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
  const [selectedPerson, setSelectedPerson] = useState<string>('me')
  const [isPersonDropdownOpen, setIsPersonDropdownOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [meName, setMeName] = useState('You')
  const [activeMemoryId, setActiveMemoryId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Memory | null>(null)
  const [requestStoryFor, setRequestStoryFor] = useState<{ personId: string; personName: string } | null>(null)
  const [requestStoryPrompt, setRequestStoryPrompt] = useState('')
  const [requestStoryError, setRequestStoryError] = useState('')
  const [isRecentering, setIsRecentering] = useState(false)
  const recenterTimerRef = useRef<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const [isEditingAboutDate, setIsEditingAboutDate] = useState(false)
  const [draftAboutDate, setDraftAboutDate] = useState('')
  const aboutDateInputRef = useRef<HTMLInputElement>(null)
  const [panelMode, setPanelMode] = useState<'notes' | null>(null)
  const [panelText, setPanelText] = useState('')
  const [panelDisplayed, setPanelDisplayed] = useState('')
  const [panelIsGenerating, setPanelIsGenerating] = useState(false)
  const panelTimerRef = useRef<number | null>(null)
  const drawerBodyRef = useRef<HTMLDivElement | null>(null)
  const notesAutoscrollActiveRef = useRef(false)
  const [showStoryBuilder, setShowStoryBuilder] = useState(false)
  
  // Chapter state
  const [activeChapter, setActiveChapter] = useState<string | null>(null)
  const [birthYear, setBirthYear] = useState<number | null>(null)
  const [chapters, setChapters] = useState<TimelineChapter[]>(() => {
    try {
      const raw = localStorage.getItem('emberChaptersV2')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) return parsed as TimelineChapter[]
      }
    } catch {
      // ignore
    }
    return []
  })
  const [chaptersInitialized, setChaptersInitialized] = useState(false)
  
  // Edit/Add chapters modal state
  const [showEditChapters, setShowEditChapters] = useState(false)
  const [draftChapters, setDraftChapters] = useState<TimelineChapter[]>([])
  const [draftChapterTitle, setDraftChapterTitle] = useState('')
  const [draftChapterStartYear, setDraftChapterStartYear] = useState('')
  const [draftChapterEndYear, setDraftChapterEndYear] = useState('')
  const [chapterSaveError, setChapterSaveError] = useState<string>('')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    setTimeout(() => setIsLoaded(true), 300)
    return () => {
      document.body.style.overflow = ''
      if (recenterTimerRef.current) {
        window.clearTimeout(recenterTimerRef.current)
        recenterTimerRef.current = null
      }
    }
  }, [])

  // Measure the bottom player to prevent list/window overlap (works for idle + active player, desktop + mobile).
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

    // iOS Safari: address bar / toolbars can change viewport without a full window resize.
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
  }, [activeMemoryId, buildView, panelMode])
  
  // Persist chapters to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('emberChaptersV2', JSON.stringify(chapters))
    } catch {
      // ignore
    }
  }, [chapters])

  // One-time cleanup: remove any persisted legacy "Now" chapter and fold it into the most recent chapter (Present).
  // This matches the new invariant: the last chapter always extends through the current year.
  const removedNowRef = useRef(false)
  useEffect(() => {
    if (removedNowRef.current) return
    if (chapters.length === 0) return

    const hasNow = chapters.some((c) => c.id === 'now' || c.label.trim().toLowerCase() === 'now')
    if (!hasNow) return

    removedNowRef.current = true
    const currentYear = new Date().getFullYear()
    const cleaned = chapters
      .filter((c) => c.id !== 'now' && c.label.trim().toLowerCase() !== 'now')
      .map((c) => ({ ...c }))
      .sort((a, b) => a.startYear - b.startYear || a.endYear - b.endYear)

    if (cleaned.length > 0) {
      const lastIdx = cleaned.length - 1
      cleaned[lastIdx] = { ...cleaned[lastIdx], endYear: currentYear }
      if (activeChapter === 'now') setActiveChapter(cleaned[lastIdx].id)
    } else {
      if (activeChapter === 'now') setActiveChapter(null)
    }

    setChapters(cleaned)
  }, [chapters, activeChapter])

  // Pull user's name and birth year from Account page localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('emberAccountData')
      if (!raw) return
      const parsed = JSON.parse(raw) as { name?: string; birthYear?: string }
      const name = (parsed?.name || '').trim()
      if (name) setMeName(name)
      
      // Parse birth year for chapter filtering
      const yearStr = (parsed?.birthYear || '').trim()
      const year = parseInt(yearStr, 10)
      if (!isNaN(year) && year > 1900 && year <= new Date().getFullYear()) {
        setBirthYear(year)
      }
    } catch {
      // ignore
    }
  }, [])

  // One-time migration: if legacy custom chapters exist and no V2 chapters yet, merge them in.
  useEffect(() => {
    if (chaptersInitialized) return

    try {
      const v2 = localStorage.getItem('emberChaptersV2')
      if (v2) {
        setChaptersInitialized(true)
        return
      }
      const legacyRaw = localStorage.getItem('emberCustomChapters')
      const legacy = legacyRaw ? (JSON.parse(legacyRaw) as Array<{ id: string; label: string; startYear: number; endYear: number }> | null) : null
      if (legacy && Array.isArray(legacy) && legacy.length > 0) {
        const migrated: TimelineChapter[] = legacy.map((c) => ({
          id: c.id,
          label: c.label,
          startYear: Number(c.startYear),
          endYear: Number(c.endYear),
          isBuiltin: false,
        }))
        setChapters(migrated)
      }
    } catch {
      // ignore
    } finally {
      setChaptersInitialized(true)
    }
  }, [chaptersInitialized])

  // (Legacy helper removed) Person selection is handled inline in the selector menu now.

  // Effective chapters (editable): use saved chapters if present, otherwise seed from birth year.
  const availableChapters = useMemo((): TimelineChapter[] => {
    if (chapters.length > 0) {
      const sorted = [...chapters].sort((a, b) => a.startYear - b.startYear || a.endYear - b.endYear)
      // If saved chapters violate the invariant, fall back for display (do not auto-overwrite).
      if (birthYear) {
        const err = validateChaptersCoverEveryYear(sorted, birthYear)
        if (err) return computeDefaultChapters(birthYear)
      }
      return sorted
    }
    if (birthYear) return computeDefaultChapters(birthYear)
    return []
  }, [chapters, birthYear])

  // Get the active chapter's year range
  const activeChapterRange = useMemo(() => {
    if (!activeChapter) return null
    return availableChapters.find(ch => ch.id === activeChapter) || null
  }, [activeChapter, availableChapters])

  const orderedChapters = useMemo(() => {
    return [...availableChapters].sort((a, b) => a.startYear - b.startYear || a.endYear - b.endYear)
  }, [availableChapters])

  const chapterNeighbors = useMemo(() => {
    const active = activeChapterRange
    if (!active) return { prev: null as TimelineChapter | null, next: null as TimelineChapter | null }
    const idx = orderedChapters.findIndex((c) => c.id === active.id)
    return {
      prev: idx > 0 ? orderedChapters[idx - 1] : null,
      next: idx >= 0 && idx < orderedChapters.length - 1 ? orderedChapters[idx + 1] : null,
    }
  }, [orderedChapters, activeChapterRange])

  const jumpToChapter = (chapterId: string) => {
    if (chapterId === activeChapter) return
    setActiveChapter(chapterId)
    setActiveMemoryId(null)

    if (!prefersReducedMotion) {
      setIsRecentering(true)
      if (recenterTimerRef.current) window.clearTimeout(recenterTimerRef.current)
      recenterTimerRef.current = window.setTimeout(() => {
        setIsRecentering(false)
        recenterTimerRef.current = null
      }, 520)
    }
  }

  // Toggle chapter selection
  const toggleChapter = (chapterId: string) => {
    const next = activeChapter === chapterId ? null : chapterId
    setActiveChapter(next)
    setActiveMemoryId(null) // Reset selected memory when changing chapter

    // Swivel the timeline as we jump to a chapter timeframe (avoid if reduced motion).
    if (!prefersReducedMotion) {
      setIsRecentering(true)
      if (recenterTimerRef.current) window.clearTimeout(recenterTimerRef.current)
      recenterTimerRef.current = window.setTimeout(() => {
        setIsRecentering(false)
        recenterTimerRef.current = null
      }, 520)
    }
  }

  const openEditChapters = () => {
    setDraftChapters(availableChapters)
    setDraftChapterTitle('')
    setDraftChapterStartYear('')
    setDraftChapterEndYear('')
    setChapterSaveError('')
    setShowEditChapters(true)
  }

  const closeEditChapters = () => {
    setShowEditChapters(false)
  }

  const updateDraftChapter = (id: string, patch: Partial<TimelineChapter>) => {
    setDraftChapters((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }

  const addDraftChapter = () => {
    const startYear = parseInt(draftChapterStartYear, 10)
    const endYear = parseInt(draftChapterEndYear, 10)
    const title = draftChapterTitle.trim()
    if (!title || isNaN(startYear) || isNaN(endYear)) return
    if (startYear > endYear) return

    const next: TimelineChapter = {
      id: `custom-${Date.now()}`,
      label: title,
      startYear,
      endYear,
      isBuiltin: false,
    }
    setDraftChapters((prev) => [...prev, next])
    setDraftChapterTitle('')
    setDraftChapterStartYear('')
    setDraftChapterEndYear('')
  }

  const saveDraftChapters = () => {
    // Validate + normalize
    const cleaned = draftChapters
      .map((c) => ({
        ...c,
        label: c.label.trim(),
        startYear: Number(c.startYear),
        endYear: Number(c.endYear),
      }))
      .filter((c) => c.label && Number.isFinite(c.startYear) && Number.isFinite(c.endYear))
      .filter((c) => c.startYear <= c.endYear)
      .sort((a, b) => a.startYear - b.startYear || a.endYear - b.endYear)

    if (birthYear) {
      const err = validateChaptersCoverEveryYear(cleaned, birthYear)
      if (err) {
        setChapterSaveError(err)
        return
      }
      setChapterSaveError('')
      setChapters(cleaned)
    } else {
      setChapterSaveError('')
      setChapters(cleaned)
    }

    // If the active chapter no longer exists (shouldn't happen without delete, but safe), clear it.
    if (activeChapter && !cleaned.some((c) => c.id === activeChapter)) setActiveChapter(null)
    setShowEditChapters(false)
  }

  // Filter and sort memories (also filter by chapter if one is selected)
  const visibleMemories = useMemo(() => {
    if (buildView !== 'visual') return []
    let filtered = memoriesData.filter(m => m.personId === selectedPerson)
    
    // If a chapter is selected, filter to only memories within that year range
    if (activeChapterRange) {
      filtered = filtered.filter(m => {
        const memoryYear = new Date(m.aboutDate + 'T12:00:00').getFullYear()
        return memoryYear >= activeChapterRange.startYear && memoryYear <= activeChapterRange.endYear
      })
    }
    
    return filtered.sort((a, b) => new Date(b.aboutDate).getTime() - new Date(a.aboutDate).getTime())
  }, [selectedPerson, memoriesData, activeChapterRange, buildView])

  // Timeline U-shape: cubic Bezier for steeper sides, flatter rounded middle
  // Endpoints at top corners; two control points create the U shape
  const arcP0 = { x: 6, y: 8 }   // top-left start
  const arcC1 = { x: 6, y: 62 }  // left control - pulls straight down for steep side
  const arcC2 = { x: 94, y: 62 } // right control - pulls straight down for steep side
  const arcP3 = { x: 94, y: 8 }  // top-right end

  const arcPoint = (t: number) => {
    // Cubic Bezier: B(t) = (1-t)³P0 + 3(1-t)²tC1 + 3(1-t)t²C2 + t³P3
    const u = 1 - t
    const u2 = u * u
    const u3 = u2 * u
    const t2 = t * t
    const t3 = t2 * t
    const x = u3 * arcP0.x + 3 * u2 * t * arcC1.x + 3 * u * t2 * arcC2.x + t3 * arcP3.x
    const y = u3 * arcP0.y + 3 * u2 * t * arcC1.y + 3 * u * t2 * arcC2.y + t3 * arcP3.y
    return { x, y }
  }

  const arcDerivative = (t: number) => {
    // Cubic Bezier derivative:
    // B'(t) = 3(1-t)^2 (C1-P0) + 6(1-t)t (C2-C1) + 3t^2 (P3-C2)
    const u = 1 - t
    const a = 3 * u * u
    const b = 6 * u * t
    const c = 3 * t * t
    const dx = a * (arcC1.x - arcP0.x) + b * (arcC2.x - arcC1.x) + c * (arcP3.x - arcC2.x)
    const dy = a * (arcC1.y - arcP0.y) + b * (arcC2.y - arcC1.y) + c * (arcP3.y - arcC2.y)
    return { dx, dy }
  }

  const getPersonColor = (personId: string): string => {
    return ALL_PEOPLE.find(p => p.id === personId)?.color || '#ffffff'
  }

  const getPersonPrimaryColor = (personId: string): string => {
    return ALL_PEOPLE.find(p => p.id === personId)?.primaryColor || '#ffffff'
  }

  const getPersonName = (personId: string): string => {
    if (personId === 'me') return meName || 'You'
    return ALL_PEOPLE.find(p => p.id === personId)?.name || personId
  }

  const formatDateNumeric = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    const m = d.getMonth() + 1
    const day = d.getDate()
    const y = d.getFullYear()
    return `${m}/${day}/${y}`
  }

  const formatPointerDate = (isoDate: string) => {
    try {
      const d = new Date(isoDate + 'T12:00:00')
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return isoDate
    }
  }

  const activeMemory = useMemo(() => {
    if (!activeMemoryId) return null
    return memoriesData.find(m => m.id === activeMemoryId) || null
  }, [activeMemoryId, memoriesData])

  // Absolute timeline scale for the current view (chapter if selected, otherwise visible range).
  const timelineScale = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const todayISO = new Date().toISOString().slice(0, 10)

    let startYear = currentYear
    let endYear = currentYear

    if (activeChapterRange) {
      startYear = activeChapterRange.startYear
      endYear = activeChapterRange.endYear
    } else if (visibleMemories.length > 0) {
      const years = visibleMemories.map((m) => new Date(m.aboutDate + 'T12:00:00').getFullYear())
      startYear = Math.min(...years)
      endYear = Math.max(...years)
    }

    const startISO = `${startYear}-01-01`
    const endISO = endYear === currentYear ? todayISO : `${endYear}-12-31`
    return { startYear, endYear, startISO, endISO }
  }, [activeChapterRange, visibleMemories])

  // Pointer orb timeline controls (pointer stays centered; timeline moves beneath it).
  const [pointerFrac, setPointerFrac] = useState(0.5)
  const [pointerIsInteracting, setPointerIsInteracting] = useState(false)
  const pointerInteractTimerRef = useRef<number | null>(null)
  const pointerDragRef = useRef<{ active: boolean; startX: number; startFrac: number }>({ active: false, startX: 0, startFrac: 0.5 })

  const markPointerInteracting = () => {
    setPointerIsInteracting(true)
    if (pointerInteractTimerRef.current) window.clearTimeout(pointerInteractTimerRef.current)
    pointerInteractTimerRef.current = window.setTimeout(() => {
      setPointerIsInteracting(false)
      pointerInteractTimerRef.current = null
    }, 650)
  }

  const scaleTimes = useMemo(() => {
    const startMs = new Date(timelineScale.startISO + 'T12:00:00').getTime()
    const endMs = new Date(timelineScale.endISO + 'T12:00:00').getTime()
    return { startMs, endMs }
  }, [timelineScale])

  const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

  const fracForISO = (isoDate: string) => {
    const v = new Date(isoDate + 'T12:00:00').getTime()
    if (!isFinite(scaleTimes.startMs) || !isFinite(scaleTimes.endMs) || !isFinite(v) || scaleTimes.endMs <= scaleTimes.startMs) return 0.5
    return clamp01((v - scaleTimes.startMs) / (scaleTimes.endMs - scaleTimes.startMs))
  }

  const isoForFrac = (f: number) => {
    const ms = scaleTimes.startMs + clamp01(f) * (scaleTimes.endMs - scaleTimes.startMs)
    const d = new Date(ms)
    return d.toISOString().slice(0, 10)
  }

  const displayTForFrac = (f: number) => {
    const tMin = 0.10
    const tMax = 0.90
    const span = 0.80
    const t = 0.5 + (f - pointerFrac) * span
    return Math.max(tMin, Math.min(tMax, t))
  }

  // Initialize pointer to the most recent memory in the current view (so it starts snapped).
  const pointerInitKeyRef = useRef<string>('')
  useEffect(() => {
    if (visibleMemories.length === 0) return
    const key = `${selectedPerson}:${activeChapterRange?.id ?? 'all'}:${timelineScale.startISO}:${timelineScale.endISO}`
    if (pointerInitKeyRef.current === key) return
    pointerInitKeyRef.current = key
    setPointerFrac(fracForISO(visibleMemories[0].aboutDate))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleMemories, selectedPerson, activeChapterRange?.id, timelineScale.startISO, timelineScale.endISO])

  const pointerISO = useMemo(() => isoForFrac(pointerFrac), [pointerFrac, scaleTimes])

  const snappedMemoryId = useMemo(() => {
    if (buildView !== 'visual') return null
    if (visibleMemories.length === 0) return null
    // Snap should feel like the pointer is "over" a memory, i.e. the rendered orb is near the center.
    // Use screen-space distance to avoid mismatches between time-scale math and what the user sees.
    const center = arcPoint(0.5)
    const centerPx = { x: (center.x / 100) * window.innerWidth, y: (center.y / 100) * window.innerHeight }

    let best: { id: string; dist: number } | null = null
    for (const m of visibleMemories) {
      const f = fracForISO(m.aboutDate)
      const t = displayTForFrac(f)
      const p = arcPoint(t)
      const px = { x: (p.x / 100) * window.innerWidth, y: (p.y / 100) * window.innerHeight }
      const dx = px.x - centerPx.x
      const dy = px.y - centerPx.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (!best || dist < best.dist) best = { id: m.id, dist }
    }

    // Visual snap radius (tuned to pane size; should feel like the arc passes through the pane).
    const SNAP_PX = 42
    if (best && best.dist <= SNAP_PX) return best.id
    return null
  }, [visibleMemories, fracForISO, displayTForFrac, arcPoint, buildView])

  const snappedMemory = useMemo(() => {
    if (!snappedMemoryId) return null
    return visibleMemories.find((m) => m.id === snappedMemoryId) ?? null
  }, [snappedMemoryId, visibleMemories])

  // When snapped, lock the pointer to the exact memory date so the centered state is perfectly stable.
  useEffect(() => {
    if (!snappedMemory) return
    const target = fracForISO(snappedMemory.aboutDate)
    if (Math.abs(target - pointerFrac) < 0.001) return
    setPointerFrac(target)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snappedMemoryId])

  useEffect(() => {
    if (buildView !== 'visual') return
    // Pointer orb drives active memory; when not snapped, player closes.
    if (snappedMemoryId) {
      if (activeMemoryId !== snappedMemoryId) setActiveMemoryId(snappedMemoryId)
    } else {
      if (activeMemoryId !== null) setActiveMemoryId(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snappedMemoryId, buildView])

  const yearTicks = useMemo(() => {
    if (visibleMemories.length === 0 && !activeChapterRange) return []
    const startYear = timelineScale.startYear
    const endYear = timelineScale.endYear
    const spanYears = endYear - startYear + 1
    const step = spanYears > 18 ? 2 : 1

    const ticks: Array<{ year: number; x: number; y: number; normalDeg: number }> = []
    for (let y = startYear; y <= endYear; y += step) {
      const f = fracForISO(`${y}-01-01`)
      const t = displayTForFrac(f)
      const p = arcPoint(t)
      const d = arcDerivative(t)
      const tangentDeg = (Math.atan2(d.dy, d.dx) * 180) / Math.PI
      const normalDeg = tangentDeg + 90
      ticks.push({ year: y, x: p.x, y: p.y, normalDeg })
    }
    return ticks
  }, [timelineScale, fracForISO, displayTForFrac, activeChapterRange, visibleMemories.length])

  // Compute the date range for the floating time indicator
  const timeRange = useMemo(() => {
    // If a chapter is active, show the chapter's explicit year range
    // (even if there are zero memories in that window).
    if (activeChapterRange) {
      const currentYear = new Date().getFullYear()
      const newestLabel = activeChapterRange.endYear === currentYear ? 'Present' : `${activeChapterRange.endYear}`
      return {
        oldest: `${activeChapterRange.startYear}`,
        newest: newestLabel,
        sameYear: activeChapterRange.startYear === activeChapterRange.endYear,
      }
    }

    if (visibleMemories.length === 0) return null
    
    const dates = visibleMemories.map(m => new Date(m.aboutDate + 'T12:00:00').getTime())
    const oldest = new Date(Math.min(...dates))
    const newest = new Date(Math.max(...dates))
    
    const formatYear = (d: Date) => d.getFullYear().toString()
    const formatMonthYear = (d: Date) => {
      const month = d.toLocaleDateString('en-US', { month: 'short' })
      return `${month} ${d.getFullYear()}`
    }
    
    // If same year, show month range
    if (oldest.getFullYear() === newest.getFullYear()) {
      return {
        oldest: formatMonthYear(oldest),
        newest: formatMonthYear(newest),
        sameYear: true
      }
    }
    
    return {
      oldest: formatYear(oldest),
      newest: formatYear(newest),
      sameYear: false
    }
  }, [visibleMemories, activeChapterRange])

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
  }, [activeMemoryId])

  // When active memory changes, load & play immediately (if possible)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    setCurrentTime(0)
    setDuration(activeMemory?.durationSec ?? 0)
    setIsEditingTitle(false)
    setDraftTitle('')
    setIsEditingAboutDate(false)
    setDraftAboutDate('')

    if (!activeMemory?.audioUrl) {
      audio.pause()
      setIsPlaying(false)
      return
    }

    audio.src = activeMemory.audioUrl
    audio.load()
    setIsPlaying(true)
    audio.play().catch(() => {
      // Autoplay may be blocked; user can hit play.
      setIsPlaying(false)
    })
  }, [activeMemory?.audioUrl])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (!activeMemory?.audioUrl) return

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying, activeMemory?.audioUrl])

  const handleSelectMemory = (memory: Memory) => {
    // Clicking a memory jumps the pointer to that date (which may snap and open the player).
    setPointerFrac(fracForISO(memory.aboutDate))
    markPointerInteracting()
  }

  const handleClosePlayer = () => {
    const audio = audioRef.current
    if (audio) audio.pause()
    setIsPlaying(false)
    setActiveMemoryId(null)
    setCurrentTime(0)
    setDuration(0)
    setIsEditingTitle(false)
    setDraftTitle('')
    setIsEditingAboutDate(false)
    setDraftAboutDate('')
  }

  const handleSeek = (value: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = value
    setCurrentTime(value)
  }

  const handleNotes = () => {
    // TODO: Backend: fetch both summary + transcript for activeMemoryId
    // - summary: LLM summarization over transcript/audio
    // - transcript: ASR pipeline
    if (!activeMemory) return
    setPanelMode('notes')
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const persistMemories = (next: Memory[]) => {
    setMemoriesData(next)
    try {
      localStorage.setItem('emberMemoriesV1', JSON.stringify(next))
    } catch {
      // ignore
    }
  }

  const confirmDeleteStory = () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setDeleteTarget(null)

    if (activeMemoryId === id) handleClosePlayer()
    persistMemories(memoriesData.filter((m) => m.id !== id))
  }

  const openRequestStory = (personId: string, personName: string) => {
    setRequestStoryFor({ personId, personName })
    setRequestStoryPrompt('')
    setRequestStoryError('')
  }

  const sendRequestStory = () => {
    if (!requestStoryFor) return
    const prompt = requestStoryPrompt.trim()
    if (!prompt) {
      setRequestStoryError('Please enter a topic.')
      return
    }

    const item = {
      id: `req-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      toPersonId: requestStoryFor.personId,
      toPersonName: requestStoryFor.personName,
      prompt,
      createdAt: new Date().toISOString(),
    }

    try {
      const raw = localStorage.getItem('emberStoryRequestsV1')
      const parsed: unknown = raw ? JSON.parse(raw) : []
      const list = Array.isArray(parsed) ? parsed : []
      list.push(item)
      localStorage.setItem('emberStoryRequestsV1', JSON.stringify(list))
    } catch {
      // ignore
    }

    setRequestStoryFor(null)
    setRequestStoryPrompt('')
    setRequestStoryError('')
  }

  // Ensure requested preloaded orbs exist even if localStorage already had data.
  const preloadedInjectedRef = useRef(false)
  useEffect(() => {
    if (preloadedInjectedRef.current) return
    preloadedInjectedRef.current = true
    const existingIds = new Set(memoriesData.map((m) => m.id))
    const missing = PRELOADED_ORBS.filter((m) => !existingIds.has(m.id))
    if (missing.length === 0) return
    persistMemories([...missing, ...memoriesData])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoriesData])

  const setMemoryVisibility = (memoryId: string, visibility: 'private' | 'shared') => {
    const next = memoriesData.map((m) => {
      if (m.id !== memoryId) return m
      if (m.personId !== 'me') return { ...m, visibility: 'shared' as const }
      return { ...m, visibility }
    })
    persistMemories(next)
  }

  const startEditTitle = () => {
    if (!activeMemory) return
    setIsEditingTitle(true)
    setDraftTitle(activeMemory.title)
    setTimeout(() => titleInputRef.current?.focus(), 0)
  }

  const cancelEditTitle = () => {
    setIsEditingTitle(false)
    setDraftTitle('')
  }

  const commitTitle = () => {
    if (!activeMemory) return
    const nextTitle = draftTitle.trim()
    if (!nextTitle) {
      cancelEditTitle()
      return
    }
    const next = memoriesData.map(m => (m.id === activeMemory.id ? { ...m, title: nextTitle } : m))
    persistMemories(next)
    setIsEditingTitle(false)
    setDraftTitle('')
  }

  // Close panel on track change / close
  useEffect(() => {
    setPanelMode(null)
    setPanelText('')
    setPanelDisplayed('')
    setPanelIsGenerating(false)
    if (panelTimerRef.current) {
      window.clearInterval(panelTimerRef.current)
      panelTimerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMemoryId])

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
  }, [])

  const DEFAULT_PROMPT =
    'What do you want to remember from this chapter — a moment, a person, or a place? Start wherever you like.'

  const DEFAULT_BIO_PATH: string[] = [
    'Start with a scene. Where are you? What can you see, hear, or smell?',
    'Who shows up in this memory? What did they mean to you then?',
    'What were you afraid of back then — and what were you quietly hopeful about?',
    'What did you believe about yourself in this chapter that you no longer believe?',
    'If you could preserve one lesson from this chapter for someone you love, what would it be?',
  ]

  type StoryBuilderMode = 'ember' | 'override' | 'photo'

  const [storyPrompt, setStoryPrompt] = useState(DEFAULT_PROMPT)
  const [isCustomizing, setIsCustomizing] = useState(false)
  const [uploadedPhotoDataUrl, setUploadedPhotoDataUrl] = useState<string | null>(null)
  const [uploadedPhotoName, setUploadedPhotoName] = useState<string>('')
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const [storyBuilderMode, setStoryBuilderMode] = useState<StoryBuilderMode>('ember')
  const [isStoryBuilderExpanded, setIsStoryBuilderExpanded] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const [scheduledForISO, setScheduledForISO] = useState<string>('')
  const [showSchedulePicker, setShowSchedulePicker] = useState(false)
  const [scheduleDraft, setScheduleDraft] = useState<string>('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  // On mobile: default collapsed to preserve the timeline. On desktop: expanded.
  useEffect(() => {
    // Default: show the story builder immediately (mobile + desktop).
    // Users can still collapse it on mobile if they want the timeline full-screen.
    setIsStoryBuilderExpanded(true)
  }, [isMobile])

  // Load/save a per-chapter prompt (local only; TODO backend)
  useEffect(() => {
    if (!activeChapterRange) return
    const key = `emberChapterPromptV1:${selectedPerson}:${activeChapterRange.id}`
    const photoKey = `emberChapterPromptPhotoV1:${selectedPerson}:${activeChapterRange.id}`
    const photoNameKey = `emberChapterPromptPhotoNameV1:${selectedPerson}:${activeChapterRange.id}`
    const modeKey = `emberChapterStoryBuilderModeV1:${selectedPerson}:${activeChapterRange.id}`
    const scheduleKey = `emberChapterStoryScheduleV1:${selectedPerson}:${activeChapterRange.id}`
    try {
      const raw = localStorage.getItem(key)
      if (raw && raw.trim()) {
        setStoryPrompt(raw)
      } else {
        setStoryPrompt(DEFAULT_PROMPT)
      }

      const rawPhoto = localStorage.getItem(photoKey)
      const rawPhotoName = localStorage.getItem(photoNameKey)
      if (rawPhoto && rawPhoto.startsWith('data:image/')) {
        setUploadedPhotoDataUrl(rawPhoto)
      } else {
        setUploadedPhotoDataUrl(null)
      }
      setUploadedPhotoName(rawPhotoName ?? '')

      const rawMode = localStorage.getItem(modeKey)
      if (rawMode === 'ember' || rawMode === 'override' || rawMode === 'photo') {
        setStoryBuilderMode(rawMode)
      } else {
        setStoryBuilderMode('ember')
      }

      const rawSchedule = localStorage.getItem(scheduleKey) ?? ''
      setScheduledForISO(rawSchedule)
      setScheduleDraft(rawSchedule)
      setShowSchedulePicker(false)
    } catch {
      setStoryPrompt(DEFAULT_PROMPT)
      setUploadedPhotoDataUrl(null)
      setUploadedPhotoName('')
      setStoryBuilderMode('ember')
      setScheduledForISO('')
      setScheduleDraft('')
      setShowSchedulePicker(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapterRange?.id, selectedPerson])

  useEffect(() => {
    if (!activeChapterRange) return
    const key = `emberChapterPromptV1:${selectedPerson}:${activeChapterRange.id}`
    const photoKey = `emberChapterPromptPhotoV1:${selectedPerson}:${activeChapterRange.id}`
    const photoNameKey = `emberChapterPromptPhotoNameV1:${selectedPerson}:${activeChapterRange.id}`
    const modeKey = `emberChapterStoryBuilderModeV1:${selectedPerson}:${activeChapterRange.id}`
    const scheduleKey = `emberChapterStoryScheduleV1:${selectedPerson}:${activeChapterRange.id}`
    try {
      localStorage.setItem(key, storyPrompt)
      if (uploadedPhotoDataUrl) {
        localStorage.setItem(photoKey, uploadedPhotoDataUrl)
        localStorage.setItem(photoNameKey, uploadedPhotoName)
      } else {
        localStorage.removeItem(photoKey)
        localStorage.removeItem(photoNameKey)
      }
      localStorage.setItem(modeKey, storyBuilderMode)
      if (scheduledForISO) localStorage.setItem(scheduleKey, scheduledForISO)
      else localStorage.removeItem(scheduleKey)
    } catch {
      // ignore
    }
  }, [storyPrompt, uploadedPhotoDataUrl, uploadedPhotoName, storyBuilderMode, scheduledForISO, activeChapterRange, selectedPerson])

  const resetPromptBox = () => {
    setStoryPrompt(DEFAULT_PROMPT)
    setUploadedPhotoDataUrl(null)
    setUploadedPhotoName('')
    setStoryBuilderMode('ember')
    setScheduledForISO('')
    setScheduleDraft('')
    setShowSchedulePicker(false)
  }

  const handleTalkNowFromEmptyOrb = () => {
    if (!activeChapterRange) return
    try {
      sessionStorage.setItem(
        'emberTalkContextV1',
        JSON.stringify({
          chapterId: activeChapterRange.id,
          chapterLabel: activeChapterRange.label,
          personId: selectedPerson,
          mode: storyBuilderMode,
          prompt: storyPrompt,
          photo: uploadedPhotoDataUrl ? { name: uploadedPhotoName, dataUrl: uploadedPhotoDataUrl } : null,
          scheduledForISO: scheduledForISO || null,
        })
      )
    } catch {
      // ignore
    }
    navigate('/talk')
  }

  const commitSchedule = () => {
    if (!scheduleDraft) {
      setScheduledForISO('')
      setShowSchedulePicker(false)
      return
    }
    setScheduledForISO(scheduleDraft)
    setShowSchedulePicker(false)
  }

  const formatScheduled = (isoLike: string) => {
    try {
      const d = new Date(isoLike)
      if (!isFinite(d.getTime())) return ''
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  const handlePickPhoto = () => {
    photoInputRef.current?.click()
  }

  const handlePhotoSelected: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) return

    setUploadedPhotoName(f.name)
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ''))
        reader.onerror = () => reject(new Error('Failed to read image'))
        reader.readAsDataURL(f)
      })
      if (dataUrl.startsWith('data:image/')) {
        setUploadedPhotoDataUrl(dataUrl)
      }
    } catch {
      // ignore
    } finally {
      // allow re-selecting the same file
      e.target.value = ''
    }
  }

  // On entry, ensure there's at least one memory in the present year for the primary user (so the latest chapter isn't empty).
  useEffect(() => {
    const currentYear = new Date().getFullYear()
    const todayISO = new Date().toISOString().slice(0, 10)

    setSelectedPerson('me')

    const hasPresentMemoryForMe = memoriesData.some((m) => {
      if (m.personId !== 'me') return false
      const y = new Date(m.aboutDate + 'T12:00:00').getFullYear()
      return y === currentYear
    })

    if (hasPresentMemoryForMe) return

    // Seed one memory per year so the most recent chapter always has something in the present year.
    const seedId = `seed-present-${currentYear}`
    const alreadySeeded = memoriesData.some((m) => m.id === seedId)
    if (alreadySeeded) return

    const seeded: Memory = {
      id: seedId,
      title: 'A Story From Today',
      aboutDate: todayISO,
      recordedOn: todayISO,
      durationSec: 156,
      note: 'A short reflection from today.',
      personId: 'me',
      visibility: 'shared',
      // Demo audio so the seed feels like a real recording
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    }

    persistMemories([seeded, ...memoriesData])
    setActiveMemoryId(seedId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Default chapter selection: the most recent chapter (which extends to Present).
  useEffect(() => {
    if (availableChapters.length === 0) return
    if (activeChapter && availableChapters.some((c) => c.id === activeChapter)) return
    setActiveChapter(availableChapters[availableChapters.length - 1].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableChapters])

  // If we just came from Talk, center the newly created memory and jump to the chapter that contains its year.
  useEffect(() => {
    const id =
      sessionStorage.getItem('emberNewMemoryId') ??
      sessionStorage.getItem('emberNewNowMemoryId') // back-compat
    if (!id) return
    sessionStorage.removeItem('emberNewMemoryId')
    sessionStorage.removeItem('emberNewNowMemoryId')
    setSelectedPerson('me')

    const m = memoriesData.find((mm) => mm.id === id) ?? null
    const year = m ? new Date(m.aboutDate + 'T12:00:00').getFullYear() : new Date().getFullYear()
    const chapterForYear =
      availableChapters.find((c) => year >= c.startYear && year <= c.endYear)?.id ??
      availableChapters[availableChapters.length - 1]?.id ??
      null
    setActiveChapter(chapterForYear)
    setActiveMemoryId(id)
  }, [memoriesData, availableChapters])

  // Dummy generation text examples (replace with backend output)
  const buildDummySummary = (m: Memory) => {
    const who = getPersonName(m.personId)
    return (
      `Summary\n` +
      `—\n` +
      `${who} reflects on ${m.title.toLowerCase()}, touching on what felt important in the moment.\n\n` +
      `Highlights\n` +
      `- A clear turning point and what changed afterward\n` +
      `- A small detail that makes the memory vivid\n` +
      `- One lingering question to ask next time`
    )
  }

  const buildDummyTranscript = (m: Memory) => {
    const who = getPersonName(m.personId)
    return (
      `Transcript\n` +
      `—\n` +
      `${who}: Okay… so this one is ${m.title.toLowerCase()}.\n` +
      `${who}: I remember the first moment it clicked — it felt quiet, but also kind of electric.\n` +
      `${who}: There was this detail I didn’t expect to matter, but it does.\n` +
      `${who}: And if I’m honest, I still don’t know what the “right” takeaway is — I just know I want to keep it.\n\n` +
      `[00:42] ${who}: That’s basically it. I’d like to tell this again someday, with more specifics.\n`
    )
  }

  const buildDummyNotes = (m: Memory) => {
    return `${buildDummySummary(m)}\n\nTranscript\n—\n${buildDummyTranscript(m).replace(/^Transcript\n—\n/, '')}`
  }

  // Generate panel content with a typewriter feel
  useEffect(() => {
    if (!panelMode || !activeMemory) return

    const full = buildDummyNotes(activeMemory)
    setPanelText(full)
    setPanelDisplayed('')
    setPanelIsGenerating(true)
    notesAutoscrollActiveRef.current = false

    if (panelTimerRef.current) {
      window.clearInterval(panelTimerRef.current)
      panelTimerRef.current = null
    }

    if (prefersReducedMotion) {
      setPanelDisplayed(full)
      setPanelIsGenerating(false)
      return
    }

    let i = 0
    panelTimerRef.current = window.setInterval(() => {
      i += 2
      setPanelDisplayed(full.slice(0, i))
      if (i >= full.length) {
        if (panelTimerRef.current) window.clearInterval(panelTimerRef.current)
        panelTimerRef.current = null
        setPanelIsGenerating(false)
      }
    }, 18)

    return () => {
      if (panelTimerRef.current) {
        window.clearInterval(panelTimerRef.current)
        panelTimerRef.current = null
      }
    }
  }, [panelMode, activeMemory, prefersReducedMotion])

  // When Transcript starts, auto-scroll so it's obvious there's more content below Summary.
  useEffect(() => {
    if (panelMode !== 'notes') return
    const el = drawerBodyRef.current
    if (!el) return

    const marker = '\n\nTranscript\n—\n'
    const transcriptStarted = panelDisplayed.includes(marker)
    if (!transcriptStarted) return

    // Once transcript begins, keep pinned to bottom while generating.
    notesAutoscrollActiveRef.current = true
    if (panelIsGenerating) {
      el.scrollTop = el.scrollHeight
    }
  }, [panelDisplayed, panelIsGenerating, panelMode])

  const skipPanelGeneration = () => {
    if (!panelIsGenerating) return
    if (panelTimerRef.current) {
      window.clearInterval(panelTimerRef.current)
      panelTimerRef.current = null
    }
    setPanelDisplayed(panelText)
    setPanelIsGenerating(false)
  }

  const startEditAboutDate = () => {
    if (!activeMemory) return
    setIsEditingAboutDate(true)
    setDraftAboutDate(activeMemory.aboutDate)
    setTimeout(() => aboutDateInputRef.current?.focus(), 0)
  }

  const cancelEditAboutDate = () => {
    setIsEditingAboutDate(false)
    setDraftAboutDate('')
  }

  const commitAboutDate = () => {
    if (!activeMemory) return
    const nextISO = (draftAboutDate || '').trim()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(nextISO)) {
      cancelEditAboutDate()
      return
    }
    const next = memoriesData.map(m => (m.id === activeMemory.id ? { ...m, aboutDate: nextISO } : m))
    persistMemories(next)
    setIsEditingAboutDate(false)
    setDraftAboutDate('')
  }

  // ============ List View (per-person stories + upcoming calls) ============
  // (Legacy) placeholder for future "show more" UI if needed.
  const [listFilterPersonId, setListFilterPersonId] = useState<string>('me')

  type ShareContact = {
    id?: string
    name?: string
    phone?: string
    nextCallEveryDays?: number
    nextCallTime?: string
    nextCallTimeZone?: string
    nextCallTopicMode?: 'biography' | 'custom'
    nextCallPrompt?: string
  }

  type AccountNextCall = {
    everyDays?: number
    time?: string
    timeZone?: string
    topicMode?: 'biography' | 'custom'
    prompt?: string
  }

  const defaultAccountBiographyPrompt = () => {
    return `In your last conversation, you shared a meaningful story. For this next conversation, we’ll continue by exploring what happened next and how it shaped your life.`
  }

  const shareContacts: ShareContact[] = useMemo(() => {
    try {
      const raw = localStorage.getItem('emberContactsV1')
      const parsed = raw ? (JSON.parse(raw) as unknown) : null
      return Array.isArray(parsed) ? (parsed as ShareContact[]) : []
    } catch {
      return []
    }
  }, [])

  const accountProfileName: string = useMemo(() => {
    try {
      const raw = localStorage.getItem('emberAccountData')
      const parsed = raw ? (JSON.parse(raw) as any) : null
      return typeof parsed?.name === 'string' ? parsed.name : ''
    } catch {
      return ''
    }
  }, [])

  const accountNextCall: AccountNextCall | null = useMemo(() => {
    try {
      const raw = localStorage.getItem('emberAccountNextCallV1')
      const parsed = raw ? (JSON.parse(raw) as any) : null
      const fallback = {
        everyDays: 1,
        time: '18:00',
        timeZone: 'America/Los_Angeles',
        topicMode: 'biography' as const,
        prompt: defaultAccountBiographyPrompt(),
      }
      if (!parsed || typeof parsed !== 'object') return fallback
      return {
        everyDays: Number.isFinite(parsed.everyDays) ? Math.max(0, Math.min(99, Math.floor(parsed.everyDays))) : 1,
        time: typeof parsed.time === 'string' ? parsed.time : '18:00',
        timeZone: typeof parsed.timeZone === 'string' ? parsed.timeZone : 'America/Los_Angeles',
        topicMode: parsed.topicMode === 'custom' ? 'custom' : 'biography',
        prompt:
          typeof parsed.prompt === 'string' && parsed.prompt.trim()
            ? parsed.prompt
            : defaultAccountBiographyPrompt(),
      }
    } catch {
      return {
        everyDays: 1,
        time: '18:00',
        timeZone: 'America/Los_Angeles',
        topicMode: 'biography',
        prompt: defaultAccountBiographyPrompt(),
      }
    }
  }, [accountProfileName])

  const shareContactByName = useMemo(() => {
    const map = new Map<string, ShareContact>()
    for (const c of shareContacts) {
      const key = typeof c?.name === 'string' ? c.name.trim().toLowerCase() : ''
      if (!key) continue
      map.set(key, c)
    }
    return map
  }, [shareContacts])

  const listPeople = useMemo(() => {
    return ALL_PEOPLE.map((p) => ({
      ...p,
      displayName: p.id === 'me' ? (meName || 'You') : p.name,
    }))
  }, [meName])

  const listPerson = useMemo(() => {
    return listPeople.find((p) => p.id === listFilterPersonId) ?? listPeople[0] ?? null
  }, [listPeople, listFilterPersonId])

  const memoriesByPerson = useMemo(() => {
    const map = new Map<string, Memory[]>()
    for (const p of listPeople) map.set(p.id, [])
    for (const m of memoriesData) {
      if (!map.has(m.personId)) map.set(m.personId, [])
      map.get(m.personId)!.push(m)
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => new Date(b.aboutDate).getTime() - new Date(a.aboutDate).getTime())
      map.set(k, arr)
    }
    return map
  }, [memoriesData, listPeople])

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

  const selectMemoryFromList = (m: Memory) => {
    setActiveMemoryId(m.id)
    setIsPlaying(true)
  }

  useEffect(() => {
    // If a track is selected, keep the UI focused on the player.
    if (activeMemoryId) setShowStoryBuilder(false)
  }, [activeMemoryId])

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

      {/* Person Selector - Top Right (Visual: chooses timeline. List: filters people.) */}
      <div className={`person-selector ${isLoaded ? 'visible' : ''}`}>
        <button
          className="person-selector-trigger"
          onClick={() => setIsPersonDropdownOpen(!isPersonDropdownOpen)}
        >
          <span className="person-selector-label">TIMELINE:</span>
          <span className="person-selector-name">
            {listFilterPersonId === 'me'
              ? meName || 'You'
              : listPeople.find((p) => p.id === listFilterPersonId)?.displayName ?? (meName || 'You')}
          </span>
        </button>

        {isPersonDropdownOpen && (
          <>
            <div className="person-selector-backdrop" onClick={() => setIsPersonDropdownOpen(false)} />
            <div className="person-selector-menu">
              {listPeople.map((p) => ({ id: p.id, name: p.displayName })).map((opt) => {
                const isSelected = listFilterPersonId === opt.id
                return (
                  <button
                    key={opt.id}
                    className={`person-selector-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setListFilterPersonId(opt.id)
                      setIsPersonDropdownOpen(false)
                    }}
                  >
                    {opt.name}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {buildView === 'list' ? (
        <>
          <div className="build-list-window ember-scroll">
          {(() => {
            if (!listPerson) return null
            const p = listPerson
            const storiesAll = memoriesByPerson.get(p.id) ?? []
            const stories = p.id === 'me' ? storiesAll : storiesAll.filter((m) => (m.visibility ?? 'shared') === 'shared')
            const share = shareContactByName.get(p.displayName.trim().toLowerCase()) ?? null
            const nextCallSource: ShareContact | null =
              p.id === 'me'
                ? {
                    nextCallEveryDays: accountNextCall?.everyDays,
                    nextCallTime: accountNextCall?.time,
                    nextCallTimeZone: accountNextCall?.timeZone,
                    nextCallTopicMode: accountNextCall?.topicMode,
                    nextCallPrompt: accountNextCall?.prompt,
                  }
                : share
            // (Legacy) expandedCalls retained for future "show more" UI if needed.

            return (
              <div className="build-list-grid">
                                <section className="build-list-card build-list-card--stories">
                  <div className="build-list-label">STORIES</div>
                  <div className="build-story-list ember-scroll">
                    {p.id === 'me' && (
                      <div
                        className="build-story-alert"
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate('/talk')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            navigate('/talk')
                          }
                        }}
                        aria-label="Go to Talk to respond to a story request"
                      >
                        <span className="build-story-alert-text">Hank has requested a story from you.</span>
                      </div>
                    )}
                    {stories.length === 0 ? <div className="build-list-empty">No stories yet.</div> : null}
                    {stories.map((m) => (
                      <div
                        key={m.id}
                        className={`build-story-row ${activeMemoryId === m.id ? 'active' : ''} ${
                          m.personId === 'me' && (m.visibility ?? 'shared') === 'private' ? 'is-private' : ''
                        }`}
                        onClick={() => selectMemoryFromList(m)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            selectMemoryFromList(m)
                          }
                        }}
                      >
                        <div
                          className={`player-dot build-story-orb ${m.personId === 'me' && (m.visibility ?? 'shared') === 'private' ? 'glass-clear private-orb' : 'glass-solid'}`}
                          style={
                            {
                              '--player-color':
                                m.personId === 'me' && (m.visibility ?? 'shared') === 'private'
                                  ? '#616161'
                                  : getPersonPrimaryColor(m.personId),
                            } as React.CSSProperties
                          }
                        />
                        <div className="build-story-meta">
                          <div className="build-story-title">{m.title}</div>
                          <div className="build-story-sub">
                            <span>RECORDED ON {formatDateNumeric(m.recordedOn)}</span>
                            {typeof m.durationSec === 'number' && isFinite(m.durationSec) ? (
                              <>
                                <span className="build-story-dot">·</span>
                                <span>{formatTime(m.durationSec)}</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="build-story-delete"
                          aria-label="Delete story"
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(m)
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {p.id !== 'me' && (
                      <div
                        className="build-story-row build-story-row--request"
                        onClick={() => openRequestStory(p.id, p.displayName)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            openRequestStory(p.id, p.displayName)
                          }
                        }}
                        aria-label="Request a story"
                      >
                        <div
                          className="player-dot build-story-orb build-story-request-orb glass-clear private-orb"
                          style={{ '--player-color': '#2a2a2a' } as React.CSSProperties}
                        />
                        <div className="build-story-meta">
                          <div className="build-story-sub build-story-request-text">REQUEST A STORY</div>
                        </div>
                        <div aria-hidden="true" />
                      </div>
                    )}
                  </div>
                </section>

                <section className="build-list-card build-list-card--nextcall">
                  <div className="build-list-label">NEXT CALL</div>
                  {!nextCallSource ? (
                    <div className="build-list-empty">No schedule yet.</div>
                  ) : (
                    <>
                      {(() => {
                        const next = nextCallsPreview(nextCallSource, 1)[0] ?? null
                        const topicText =
                          typeof nextCallSource.nextCallPrompt === 'string' ? nextCallSource.nextCallPrompt.trim() : ''
                        return (
                          <div className="build-call-list">
                            <div className="build-call-row">
                              <div className="build-call-when">Scheduled: {next ? next.when : '—'}</div>
                              <div className="build-call-topic">
                                <span className="build-call-note">{topicText || '—'}</span>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </>
                  )}
                </section>
              </div>
            )
          })()}
        </div>

          {deleteTarget && (
            <div
              className="build-confirm-overlay"
              onClick={() => setDeleteTarget(null)}
              role="dialog"
              aria-modal="true"
            >
              <div className="build-confirm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="build-confirm-text">Are you sure you want to delete this story?</div>
                <div className="build-confirm-actions">
                  <button type="button" className="build-confirm-btn" onClick={() => setDeleteTarget(null)}>
                    Cancel
                  </button>
                  <button type="button" className="build-confirm-btn danger" onClick={confirmDeleteStory}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}


          {requestStoryFor && (
            <div
              className="build-confirm-overlay"
              onClick={() => {
                setRequestStoryFor(null)
                setRequestStoryPrompt('')
                setRequestStoryError('')
              }}
              role="dialog"
              aria-modal="true"
            >
              <div className="build-confirm-modal build-request-modal" onClick={(e) => e.stopPropagation()}>
                <div className="build-request-heading">Request a Story</div>
                <div className="build-request-subheading">
                  What topic do you want to hear about from {requestStoryFor.personName.trim().split(/\s+/)[0] || "them"}?
                </div>
                <textarea
                  className="build-request-input ember-scroll"
                  value={requestStoryPrompt}
                  onChange={(e) => {
                    setRequestStoryPrompt(e.target.value)
                    if (requestStoryError) setRequestStoryError('')
                  }}
                  placeholder="Example: Tell me about your first impression of me."
                  rows={4}
                />
                {requestStoryError ? (
                  <div className="build-request-error" role="alert">
                    {requestStoryError}
                  </div>
                ) : null}
                <div className="build-confirm-actions">
                  <button
                    type="button"
                    className="build-confirm-btn"
                    onClick={() => {
                      setRequestStoryFor(null)
                      setRequestStoryPrompt('')
                      setRequestStoryError('')
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="build-confirm-btn primary"
                    onClick={sendRequestStory}
                    disabled={!requestStoryPrompt.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Chapter filter moved to bottom, above player */}

          {/* Edit/Add Chapters Modal */}
          {showEditChapters && (
        <div className="chapter-modal-overlay" onClick={closeEditChapters}>
          <div className="chapter-modal" onClick={(e) => e.stopPropagation()}>
            <button className="chapter-modal-close" onClick={closeEditChapters}>×</button>

            <div className="chapter-modal-body">
              <div className="chapter-editor">
                <div className="chapter-editor-header">
                  <span className="chapter-editor-note">EDIT CHAPTER TITLES AND YEAR RANGES</span>
                </div>

                {chapterSaveError && (
                  <div className="chapter-editor-error" role="alert">
                    {chapterSaveError}
                  </div>
          )}

                {draftChapters.length > 0 && (
                  <div className="chapter-editor-list ember-scroll">
                    {draftChapters.map((ch) => (
                      <div key={ch.id} className="chapter-editor-row">
                        <input
                          type="text"
                          className="chapter-form-input"
                          value={ch.label}
                          onChange={(e) => updateDraftChapter(ch.id, { label: e.target.value })}
                          placeholder="Chapter title"
                          aria-label="Chapter title"
                        />
                        <div className="chapter-editor-years">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="chapter-form-input"
                            value={String(ch.startYear || '')}
                            onChange={(e) => updateDraftChapter(ch.id, { startYear: parseInt(e.target.value.replace(/\D/g, ''), 10) || 0 })}
                            aria-label="Start year"
                          />
                          <span className="chapter-editor-dash">–</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="chapter-form-input"
                            value={String(ch.endYear || '')}
                            onChange={(e) => updateDraftChapter(ch.id, { endYear: parseInt(e.target.value.replace(/\D/g, ''), 10) || 0 })}
                            aria-label="End year"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="chapter-editor-divider" />

                <div className="chapter-form-group">
                  <label className="chapter-form-label">NEW CHAPTER TITLE</label>
                  <input
                    type="text"
                    className="chapter-form-input"
                    placeholder="e.g. College, Twenties, Thirties"
                    value={draftChapterTitle}
                    onChange={(e) => setDraftChapterTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="chapter-form-row">
                  <div className="chapter-form-group">
                    <label className="chapter-form-label">Start Year</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="chapter-form-input"
                      placeholder="2018"
                      value={draftChapterStartYear}
                      onChange={(e) => setDraftChapterStartYear(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div className="chapter-form-group">
                    <label className="chapter-form-label">End Year</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className="chapter-form-input"
                      placeholder="2022"
                      value={draftChapterEndYear}
                      onChange={(e) => setDraftChapterEndYear(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                </div>

                <div className="chapter-editor-actions">
                  <button
                    type="button"
                    className="chapter-save-btn"
                    onClick={addDraftChapter}
                    disabled={!draftChapterTitle.trim() || !draftChapterStartYear || !draftChapterEndYear}
                  >
                    ADD CHAPTER
                  </button>
                  <button
                    type="button"
                    className="chapter-save-btn primary"
                    onClick={saveDraftChapters}
                    disabled={Boolean(birthYear && validateChaptersCoverEveryYear(draftChapters, birthYear))}
                  >
                    SAVE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Bar - Above timeline graphic */}
          {(availableChapters.length > 0 || birthYear) && (
        <div className={`chapter-bar ${isLoaded ? 'visible' : ''}`}>
          <span className="chapter-bar-label">CHAPTERS</span>
          <div className="chapter-bar-scroll">
            {availableChapters.map(chapter => {
              const currentYear = new Date().getFullYear()
              const isActive = activeChapter === chapter.id
              const endLabel = chapter.endYear === currentYear ? 'Present' : `${chapter.endYear}`
              return (
                <div key={chapter.id} className="chapter-bar-item">
                  <button
                    className={`chapter-bar-chip ${isActive ? 'active' : ''}`}
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <span className="chapter-bar-name">{chapter.label}</span>
                    <span className="chapter-bar-years">{chapter.startYear}–{endLabel}</span>
                  </button>
                </div>
              )
            })}
            
            {/* Add Chapter Button */}
            {birthYear && (
              <button
                className="chapter-bar-add"
                onClick={openEditChapters}
              >
                Edit/Add Chapters
              </button>
            )}
          </div>
        </div>
          )}

      {/* Spiral Constellation */}
          <div
        ref={spiralRef}
        className={`spiral-container ${isRecentering ? 'recentering' : ''}`}
        onWheel={(e) => {
          if (visibleMemories.length === 0) return
          e.preventDefault()
          const delta = e.deltaY
          const next = clamp01(pointerFrac - delta / 1400) // scroll to move across the timeline
          setPointerFrac(next)
          markPointerInteracting()
        }}
        onMouseDown={(e) => {
          if (visibleMemories.length === 0) return
          pointerDragRef.current = { active: true, startX: e.clientX, startFrac: pointerFrac }
          markPointerInteracting()
        }}
        onMouseMove={(e) => {
          if (!pointerDragRef.current.active) return
          const width = spiralRef.current?.clientWidth ?? window.innerWidth
          const dx = e.clientX - pointerDragRef.current.startX
          const next = clamp01(pointerDragRef.current.startFrac + dx / width)
          setPointerFrac(next)
          markPointerInteracting()
        }}
        onMouseUp={() => {
          pointerDragRef.current.active = false
        }}
        onMouseLeave={() => {
          pointerDragRef.current.active = false
        }}
        onTouchStart={(e) => {
          if (visibleMemories.length === 0) return
          const t = e.touches[0]
          if (!t) return
          pointerDragRef.current = { active: true, startX: t.clientX, startFrac: pointerFrac }
          markPointerInteracting()
        }}
        onTouchMove={(e) => {
          if (!pointerDragRef.current.active) return
          const t = e.touches[0]
          if (!t) return
          const width = spiralRef.current?.clientWidth ?? window.innerWidth
          const dx = t.clientX - pointerDragRef.current.startX
          const next = clamp01(pointerDragRef.current.startFrac + dx / width)
          setPointerFrac(next)
          markPointerInteracting()
        }}
        onTouchEnd={() => {
          pointerDragRef.current.active = false
        }}
      >
        {/* Time arc scaffold (future timeline structure) */}
        <svg className="timeline-arc" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="emberArcStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="18%" stopColor="rgba(255,255,255,0.12)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.16)" />
              <stop offset="82%" stopColor="rgba(255,255,255,0.12)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
          </defs>

          {/* U-shaped arc: past on left, future on right. Cubic Bezier for steeper sides, flatter middle. */}
          <path
            className="arc-path"
            d="M 6 8 C 6 62, 94 62, 94 8"
            stroke="url(#emberArcStroke)"
          />

          {/* center anchor (aligned with the primary memory at t=0.5) */}
          <circle className="arc-center" cx="50" cy="48.5" r="0.75" />
        </svg>

        {/* Year ticks (faint) */}
        {yearTicks.length > 0 && (
          <div className="year-ticks" aria-hidden="true">
            {yearTicks.map((tick) => (
              <div
                key={`y-${tick.year}`}
                className="year-tick"
                style={{ left: `${tick.x}%`, top: `${tick.y}%` } as React.CSSProperties}
              >
                <div className="year-tick-line" style={{ transform: `rotate(${tick.normalDeg}deg)` }} />
                <div className="year-tick-label">{tick.year}</div>
              </div>
            ))}
          </div>
        )}

        {/* Pointer orb (center locator). When snapped, it fades out and is replaced by the centered memory orb. */}
        {visibleMemories.length > 0 && (
          <div
            className={`pointer-orb ${pointerIsInteracting ? 'active' : ''} ${snappedMemory ? 'hidden' : ''}`}
            style={
              {
                left: `${arcPoint(0.5).x}%`,
                top: `${arcPoint(0.5).y}%`,
              } as React.CSSProperties
            }
            aria-hidden="true"
          >
            <div className="orb-glow" />
            <div className="orb-core" />
            <div className={`pointer-label ${pointerIsInteracting ? 'visible' : ''}`}>
              {formatPointerDate(pointerISO)}
            </div>
          </div>
        )}

        {/* Centered memory pane (glass photo): only appears when the pointer is snapped to a memory. */}
        {visibleMemories.length > 0 && (
          <div
            className={`memory-pane centered-memory-pane ${snappedMemory ? 'visible-centered active' : ''} ${(snappedMemory && (snappedMemory.visibility ?? 'shared') === 'private') ? 'private' : ''}`}
            style={
              {
                left: `${arcPoint(0.5).x}%`,
                top: `${arcPoint(0.5).y}%`,
                '--pane-color': snappedMemory
                  ? ((snappedMemory.visibility ?? 'shared') === 'private' ? '#6a6a6a' : getPersonPrimaryColor(snappedMemory.personId))
                  : 'rgba(255,255,255,0.10)',
                '--pane-bg': snappedMemory && (snappedMemory as any).photoUrl
                  ? `url("${(snappedMemory as any).photoUrl}")`
                  : 'radial-gradient(circle at 24% 22%, rgba(255,255,255,0.22) 0%, rgba(0,0,0,0.04) 42%, rgba(0,0,0,0.22) 100%), radial-gradient(circle at 70% 78%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0.00) 56%), linear-gradient(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.20))',
                '--pane-scale': 1.0,
                '--pane-rx': '10deg',
                '--pane-ry': '22deg',
                '--pane-rz': '6deg',
              } as React.CSSProperties
            }
            aria-hidden="true"
          >
            {/* Intentionally no text inside panes (photo-like glass surfaces only). */}
          </div>
        )}

        {/* Floating time range indicators at screen edges */}
        {(timeRange || activeChapterRange) && (
          <div className="time-range-indicators">
            {activeChapterRange && chapterNeighbors.prev ? (
              <button
                type="button"
                className="time-indicator left chapter-nav"
                onClick={() => jumpToChapter(chapterNeighbors.prev!.id)}
                aria-label={`Go to ${chapterNeighbors.prev.label}`}
              >
                <span className="time-top">
                  <span className="time-arrow">←</span>
                  <span className="time-label">{chapterNeighbors.prev.endYear}</span>
                </span>
                <span className="time-chapter">{chapterNeighbors.prev.label}</span>
              </button>
            ) : activeChapterRange ? null : (
              <div className="time-indicator left">
                <span className="time-arrow">←</span>
                <span className="time-label">{timeRange?.oldest ?? ''}</span>
              </div>
            )}

            {activeChapterRange && chapterNeighbors.next ? (
              <button
                type="button"
                className="time-indicator right chapter-nav"
                onClick={() => jumpToChapter(chapterNeighbors.next!.id)}
                aria-label={`Go to ${chapterNeighbors.next.label}`}
              >
                <span className="time-top">
                  <span className="time-label">{chapterNeighbors.next.startYear}</span>
                  <span className="time-arrow">→</span>
                </span>
                <span className="time-chapter">{chapterNeighbors.next.label}</span>
              </button>
            ) : activeChapterRange ? null : (
              <div className="time-indicator right">
                <span className="time-label">{timeRange?.newest ?? ''}</span>
                <span className="time-arrow">→</span>
              </div>
            )}
          </div>
        )}

        {/* Empty chapter placeholder: render as a real orb on the arc (t=0.5) so the timeline passes through it */}
        {activeChapterRange && visibleMemories.length === 0 && isLoaded && (
          <>
            <div
              className="share-orb-actions"
              style={
                {
                  left: `${arcPoint(0.5).x}%`,
                  top: `${arcPoint(0.5).y}%`,
                } as React.CSSProperties
              }
            >
              <button type="button" className="share-orb-btn" onClick={handleTalkNowFromEmptyOrb}>
                TALK NOW
              </button>
              <span className="share-orb-sep" aria-hidden="true" />
              <button
                type="button"
                className="share-orb-btn"
                onClick={() => {
                  setShowSchedulePicker((v) => !v)
                  setScheduleDraft((prev) => prev || scheduledForISO || '')
                }}
              >
                SCHEDULED FOR
              </button>
            </div>

            {showSchedulePicker && (
              <div
                className="share-orb-schedule"
                style={
                  {
                    left: `${arcPoint(0.5).x}%`,
                    top: `${arcPoint(0.5).y}%`,
                  } as React.CSSProperties
                }
              >
                <input
                  className="share-orb-datetime"
                  type="datetime-local"
                  value={scheduleDraft}
                  onChange={(e) => setScheduleDraft(e.target.value)}
                  aria-label="Schedule Ember call"
                />
                <div className="share-orb-schedule-actions">
                  <button type="button" className="share-orb-action" onClick={commitSchedule}>
                    SET
                  </button>
                  <button
                    type="button"
                    className="share-orb-action"
                    onClick={() => {
                      setShowSchedulePicker(false)
                      setScheduleDraft(scheduledForISO)
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {scheduledForISO && !showSchedulePicker && (
              <div
                className="share-orb-scheduled"
                style={
                  {
                    left: `${arcPoint(0.5).x}%`,
                    top: `${arcPoint(0.5).y}%`,
                  } as React.CSSProperties
                }
              >
                Scheduled for {formatScheduled(scheduledForISO)}
              </div>
            )}

            <div
              className="memory-orb primary visible share-story-orb glass-clear"
              style={
                {
                  left: `${arcPoint(0.5).x}%`,
                  top: `${arcPoint(0.5).y}%`,
                  '--orb-color': getPersonPrimaryColor(selectedPerson),
                  '--orb-scale': 1.15,
                } as React.CSSProperties
              }
              aria-hidden="true"
            >
              <div className="orb-glow" />
              <div className="orb-core" />
              <div className="orb-label visible">
                <span className="orb-title">Share a Story</span>
              </div>
            </div>
          </>
        )}

        {/* Memory Panes (glass photos placed along the semi-circle timeline) */}
        {visibleMemories.map((memory, index) => {
          const f = fracForISO(memory.aboutDate)
          const t = displayTForFrac(f)
          const p = arcPoint(t)
          const pos = { x: p.x, y: p.y }
          const isHovered = hoveredId === memory.id
          const isPrivate = (memory.visibility ?? 'shared') === 'private'
          const isSnappedSource = memory.id === snappedMemoryId
          const baseColor = getPersonColor(memory.personId)
          const color = isPrivate ? '#6a6a6a' : baseColor
          const isActive = activeMemoryId === memory.id

          // Face "future" (right side of screen): flip yaw compared to past-facing panes.
          const tiltY = 22 + (t - 0.5) * -28
          const tiltX = 10 + Math.abs(t - 0.5) * 4
          const tiltZ = 6 + (t - 0.5) * 10

          const paneBg =
            (memory as any).photoUrl
              ? `url("${(memory as any).photoUrl}")`
              : 'radial-gradient(circle at 24% 22%, rgba(255,255,255,0.18) 0%, rgba(0,0,0,0.04) 42%, rgba(0,0,0,0.22) 100%), radial-gradient(circle at 70% 78%, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0.00) 56%), linear-gradient(135deg, rgba(255,255,255,0.04), rgba(0,0,0,0.22))'

          return (
            <div
              key={memory.id}
              className={`memory-pane ${isPrivate ? 'private' : ''} ${isHovered ? 'hovered' : ''} ${isLoaded ? 'visible' : ''} ${isActive ? 'active' : ''} ${isSnappedSource ? 'snapped-source' : ''}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                '--pane-color': color,
                '--pane-bg': paneBg,
                '--pane-scale': 1.0,
                '--pane-rx': `${tiltX.toFixed(2)}deg`,
                '--pane-ry': `${tiltY.toFixed(2)}deg`,
                '--pane-rz': `${tiltZ.toFixed(2)}deg`,
                animationDelay: `${index * 0.06}s`,
              } as React.CSSProperties}
              onClick={() => handleSelectMemory(memory)}
              onMouseEnter={() => setHoveredId(memory.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Intentionally no text inside panes (photo-like glass surfaces only). */}
            </div>
          )
        })}
          </div>
        </>
      )}

      {/* Bottom player (Spotify-style) */}
      {activeMemory ? (
        <>
          {/* Drawer above the player */}
          {panelMode && (
            <div className="build-player-drawer" role="region" aria-label="Notes">
              <div className="drawer-header">
                <div className="drawer-title">
                  NOTES
                  {panelIsGenerating && <span className="drawer-generating">Generating…</span>}
                </div>
                <button
                  type="button"
                  className="drawer-close"
                  onClick={() => setPanelMode(null)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div
                className="drawer-body ember-scroll"
                ref={drawerBodyRef}
                onMouseDown={skipPanelGeneration}
                onTouchStart={skipPanelGeneration}
              >
                <pre className="drawer-text">{panelDisplayed}</pre>
              </div>
            </div>
          )}

          <div ref={playerRef} className="build-player" role="region" aria-label="Audio player">
          <div className="player-left">
            <div
              className={`player-dot ${(activeMemory.visibility ?? 'shared') === 'private' ? 'glass-clear private-orb' : 'glass-solid'}`}
              style={{
                '--player-color':
                  (activeMemory.visibility ?? 'shared') === 'private'
                    ? '#616161'
                    : getPersonPrimaryColor(activeMemory.personId),
              } as React.CSSProperties}
            />
            <div className="player-meta">
              <div
                className={`player-title-row ${!isEditingTitle ? 'clickable' : ''}`}
                onClick={() => {
                  if (!isEditingTitle) startEditTitle()
                }}
                onKeyDown={(e) => {
                  if (isEditingTitle) return
                  if (e.key === 'Enter' || e.key === ' ') startEditTitle()
                }}
                role="button"
                tabIndex={0}
                aria-label="Edit memory title"
              >
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    className="player-title-input"
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={commitTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitTitle()
                      if (e.key === 'Escape') cancelEditTitle()
                    }}
                    aria-label="Edit memory title"
                  />
                ) : (
                  <>
                    <div className="player-title" title={activeMemory.title}>{activeMemory.title}</div>
                    <button
                      type="button"
                      className="player-edit"
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditTitle()
                      }}
                      aria-label="Edit title"
                    >
                      <span className="player-edit-icon" aria-hidden="true">✎</span>
                    </button>
                  </>
                )}
              </div>
              <div className="player-sub">
                <span className="player-sub-person">{getPersonName(activeMemory.personId)}</span>
                <span className="player-sub-sep">·</span>
                <span className="player-sub-label">ABOUT:</span>
                {isEditingAboutDate ? (
                  <input
                    ref={aboutDateInputRef}
                    className="player-date-input"
                    type="date"
                    value={draftAboutDate}
                    onChange={(e) => setDraftAboutDate(e.target.value)}
                    onBlur={commitAboutDate}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitAboutDate()
                      if (e.key === 'Escape') cancelEditAboutDate()
                    }}
                    aria-label="Edit ABOUT date"
                  />
                ) : (
                  <button
                    type="button"
                    className="player-sub-editable"
                    onClick={startEditAboutDate}
                    aria-label="Edit ABOUT date"
                  >
                    {formatDateNumeric(activeMemory.aboutDate)}
                  </button>
                )}
                <span className="player-sub-sep">·</span>
                <span className="player-sub-label">RECORDED:</span>
                <span className="player-sub-value">{formatDateNumeric(activeMemory.recordedOn)}</span>
              </div>
            </div>
          </div>

          <div className="player-center">
        {/*
          Prefer real audio metadata duration when available.
          Fall back to stored durationSec (useful for seeded/demo memories and while metadata loads).
        */}
        {(() => {
          const effectiveDuration = duration > 0 ? duration : (activeMemory.durationSec ?? 0)
          return (
            <>
            <button
              type="button"
              className="player-btn"
              onClick={() => setIsPlaying(p => !p)}
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
            <div className="player-actions">
              <button type="button" className="player-action" onClick={handleNotes}>
                Notes
              </button>
            </div>
            {activeMemory.personId === 'me' && (
              <div className="player-visibility" aria-label="Visibility">
                <button
                  type="button"
                  className={`vis-toggle ${(activeMemory.visibility ?? 'shared') === 'private' ? 'active' : ''}`}
                  onClick={() => setMemoryVisibility(activeMemory.id, 'private')}
                >
                  PRIVATE
                </button>
                <button
                  type="button"
                  className={`vis-toggle ${(activeMemory.visibility ?? 'shared') === 'shared' ? 'active' : ''}`}
                  onClick={() => setMemoryVisibility(activeMemory.id, 'shared')}
                >
                  SHARED
                </button>
              </div>
            )}
            <button type="button" className="player-close" onClick={handleClosePlayer} aria-label="Close player">
              ×
            </button>
          </div>

          <audio ref={audioRef} preload="metadata" />
          </div>
        </>
      ) : (
        <div ref={playerRef} className="build-player idle" role="region" aria-label="Audio player">
          <div className="player-left">
            <div className="player-meta">
              <div className="player-idle-label">Select a story to play</div>
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

          <div className="player-right">
            <div className="player-actions" />
          </div>
        </div>
      )}

      {/* Story Builder: stays hidden until the user presses "New story". */}
      {buildView === 'visual' && showStoryBuilder && activeChapterRange && isLoaded && (
        <div
          className={`prompt-player lifted ${isMobile ? 'mobile' : ''} ${isMobile && !isStoryBuilderExpanded ? 'collapsed' : ''}`}
          role="region"
          aria-label="Story builder"
        >
          <div className="prompt-header">
            <button
              type="button"
              className="prompt-title-btn"
              onClick={() => setIsStoryBuilderExpanded((v) => (isMobile ? !v : true))}
              aria-expanded={isStoryBuilderExpanded}
            >
              <span className="prompt-label">STORY BUILDER</span>
              {isMobile && (
                <span className="prompt-chevron" aria-hidden="true">
                  {isStoryBuilderExpanded ? '▾' : '▴'}
                </span>
              )}
            </button>

            <div className="prompt-header-actions">
              <button type="button" className="prompt-reset" onClick={resetPromptBox}>
                RESET
              </button>
              <button type="button" className="prompt-reset" onClick={handleTalkNowFromEmptyOrb}>
                TALK NOW
              </button>
              <button type="button" className="prompt-reset" onClick={() => setShowStoryBuilder(false)} aria-label="Close story builder">
                ×
              </button>
            </div>
          </div>

          <div className="prompt-body ember-scroll" aria-hidden={isMobile && !isStoryBuilderExpanded}>
            <div className="prompt-mode-row" role="radiogroup" aria-label="Choose story builder mode">
              <button
                type="button"
                className={`prompt-mode-option ${storyBuilderMode === 'ember' ? 'selected' : ''}`}
                onClick={() => setStoryBuilderMode('ember')}
                role="radio"
                aria-checked={storyBuilderMode === 'ember'}
              >
                <span className="prompt-mode-check" aria-hidden="true">
                </span>
                <span className="prompt-mode-name">EMBER BIOGRAPHY</span>
              </button>
              <button
                type="button"
                className={`prompt-mode-option ${storyBuilderMode === 'override' ? 'selected' : ''}`}
                onClick={() => setStoryBuilderMode('override')}
                role="radio"
                aria-checked={storyBuilderMode === 'override'}
              >
                <span className="prompt-mode-check" aria-hidden="true">
                </span>
                <span className="prompt-mode-name">YOUR OVERRIDE</span>
              </button>
              <button
                type="button"
                className={`prompt-mode-option ${storyBuilderMode === 'photo' ? 'selected' : ''}`}
                onClick={() => setStoryBuilderMode('photo')}
                role="radio"
                aria-checked={storyBuilderMode === 'photo'}
              >
                <span className="prompt-mode-check" aria-hidden="true">
                </span>
                <span className="prompt-mode-name">PHOTO</span>
              </button>
            </div>

            {/* Always show only the selected panel (desktop + mobile). */}
            <div className="prompt-grid single">
              {storyBuilderMode === 'ember' && (
                <div className="prompt-panel active">
                  <div className="prompt-panel-header">
                    <span className="prompt-panel-subtitle">Ember's flagship biography experience - default prompts over time</span>
                  </div>
                  <ol className="prompt-list" aria-label="Default Ember biography prompts">
                    {(isMobile ? DEFAULT_BIO_PATH.slice(0, 3) : DEFAULT_BIO_PATH.slice(0, 4)).map((q, idx) => (
                      <li key={`${idx}-${q}`} className="prompt-list-item">
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {storyBuilderMode === 'override' && (
                <div className="prompt-panel active">
                  <div className="prompt-panel-header prompt-panel-header-row">
                    <div className="prompt-panel-header-text">
                      <span className="prompt-panel-subtitle">Steer the next conversation</span>
                    </div>
                    <button
                      type="button"
                      className="prompt-toggle"
                      onClick={() => setIsCustomizing((v) => !v)}
                      aria-pressed={isCustomizing}
                    >
                      {isCustomizing ? 'DONE' : 'EDIT'}
                    </button>
                  </div>
                  {isCustomizing ? (
                    <textarea
                      className="prompt-input"
                      value={storyPrompt}
                      onChange={(e) => setStoryPrompt(e.target.value)}
                      rows={2}
                      aria-label="Edit your override prompt"
                    />
                  ) : (
                    <div className="prompt-preview" aria-label="Current override prompt">
                      {storyPrompt.trim() ? storyPrompt.trim() : DEFAULT_PROMPT}
                    </div>
                  )}
                  <div className="prompt-hint">Tip: write one clear question. Ember will engage for more detail</div>
                </div>
              )}

              {storyBuilderMode === 'photo' && (
                <div className="prompt-panel active">
                  <div className="prompt-panel-header">
                    <span className="prompt-panel-subtitle">Upload a photo to talk about</span>
                  </div>

                  <input
                    ref={photoInputRef}
                    className="prompt-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelected}
                    tabIndex={-1}
                    aria-hidden="true"
                  />

                  {uploadedPhotoDataUrl ? (
                    <div className="prompt-photo-row">
                      <button type="button" className="prompt-photo-thumb" onClick={handlePickPhoto} aria-label="Change photo">
                        <img
                          src={uploadedPhotoDataUrl}
                          alt={uploadedPhotoName ? `Uploaded: ${uploadedPhotoName}` : 'Uploaded photo'}
                        />
                      </button>
                      <div className="prompt-photo-meta">
                        <div className="prompt-photo-name">{uploadedPhotoName || 'Photo selected'}</div>
                        <div className="prompt-photo-actions">
                          <button type="button" className="prompt-photo-action" onClick={handlePickPhoto}>
                            REPLACE
                          </button>
                          <button
                            type="button"
                            className="prompt-photo-action danger"
                            onClick={() => {
                              setUploadedPhotoDataUrl(null)
                              setUploadedPhotoName('')
                            }}
                          >
                            REMOVE
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button type="button" className="prompt-photo-upload" onClick={handlePickPhoto}>
                      UPLOAD PHOTO
                    </button>
                  )}

                  <div className="prompt-hint">Ember will ask: “What’s happening here?” then follow up with details.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state (when there are no memories for the selected person) */}
      {visibleMemories.length === 0 && isLoaded && !activeChapterRange && (
        <div className="empty-state">
          <h2>No memories yet</h2>
          <p>
            Start recording to build your story
          </p>
        </div>
      )}
    </div>
  )
}

export default Build
