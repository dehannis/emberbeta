import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { PEOPLE_MOCK } from './mock'
import type { PeopleSnippet, Person, TopicEntry } from './types'

type PeopleState = {
  people: Person[]
  updatePerson: (id: string, patch: Partial<Pick<Person, 'cadenceDays' | 'nextCallAt' | 'language' | 'topicsNext'>>) => void
  attachTopicPhoto: (personId: string, topicId: string, photoUrl: string) => void

  audio: {
    activeSnippetId: string | null
    isPlaying: boolean
    playSnippet: (snippet: PeopleSnippet) => void
    toggle: () => void
    stop: () => void
  }
}

const PeopleCtx = createContext<PeopleState | null>(null)

const STORAGE_KEY = 'emberPeopleV1'

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function mergePeople(base: Person[], saved: Partial<Person>[] | null): Person[] {
  if (!saved || saved.length === 0) return base
  const byId = new Map(saved.filter(Boolean).map((p) => [p.id as string, p]))
  return base.map((p) => {
    const s = byId.get(p.id)
    if (!s) return p
    return {
      ...p,
      cadenceDays: typeof s.cadenceDays === 'number' ? s.cadenceDays : p.cadenceDays,
      nextCallAt: typeof s.nextCallAt === 'string' ? s.nextCallAt : p.nextCallAt,
      language: typeof s.language === 'string' ? s.language : p.language,
      topicsNext: Array.isArray(s.topicsNext) ? (s.topicsNext as TopicEntry[]) : p.topicsNext,
    }
  })
}

export function PeopleProvider(props: { children: React.ReactNode }) {
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = safeParse<Partial<Person>[]>(localStorage.getItem(STORAGE_KEY))
    return mergePeople(PEOPLE_MOCK, saved)
  })

  useEffect(() => {
    // Persist only editable fields.
    const payload = people.map((p) => ({
      id: p.id,
      cadenceDays: p.cadenceDays,
      nextCallAt: p.nextCallAt,
      language: p.language,
      topicsNext: p.topicsNext,
    }))
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // ignore
    }
  }, [people])

  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const ensureAudio = () => {
    if (!audioElRef.current) audioElRef.current = new Audio()
    return audioElRef.current
  }

  useEffect(() => {
    const a = ensureAudio()
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    a.addEventListener('ended', onEnded)
    return () => {
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      a.removeEventListener('ended', onEnded)
    }
  }, [])

  const updatePerson: PeopleState['updatePerson'] = (id, patch) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const attachTopicPhoto: PeopleState['attachTopicPhoto'] = (personId, topicId, photoUrl) => {
    setPeople((prev) =>
      prev.map((p) => {
        if (p.id !== personId) return p
        return {
          ...p,
          topicsNext: p.topicsNext.map((t) => (t.id === topicId ? { ...t, attachedPhotoUrl: photoUrl } : t)),
        }
      }),
    )
  }

  const audio = useMemo<PeopleState['audio']>(
    () => ({
      activeSnippetId,
      isPlaying,
      playSnippet: (snippet) => {
        const a = ensureAudio()
        if (a.src !== snippet.audioUrl) a.src = snippet.audioUrl
        setActiveSnippetId(snippet.id)
        a.currentTime = 0
        a.play().catch(() => {
          // autoplay blocked; user can press play again
        })
      },
      toggle: () => {
        const a = ensureAudio()
        if (a.paused) a.play().catch(() => {})
        else a.pause()
      },
      stop: () => {
        const a = ensureAudio()
        a.pause()
        setActiveSnippetId(null)
      },
    }),
    [activeSnippetId, isPlaying],
  )

  const value: PeopleState = useMemo(
    () => ({ people, updatePerson, attachTopicPhoto, audio }),
    [attachTopicPhoto, audio, people],
  )

  return <PeopleCtx.Provider value={value}>{props.children}</PeopleCtx.Provider>
}

export function usePeople() {
  const ctx = useContext(PeopleCtx)
  if (!ctx) throw new Error('usePeople must be used within PeopleProvider')
  return ctx
}


