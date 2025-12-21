import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { FeedTopState, Recording, RecordingInnerState } from './types'
import { SAMPLE_RECORDINGS } from './sampleFeed'
import { useSwipeRouter } from './useSwipeRouter'
import CollageBackground from './CollageBackground'
import MiniScrubBar from './MiniScrubBar'
import './feed.css'

type InteractionSheetState =
  | { open: false }
  | { open: true; mode: 'respond' | 'followup' | 'comment'; target: { recordingId: string; snippetId?: string } }

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n))
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

const BuildSwipeExperience: React.FC = () => {
  const [topState, setTopState] = useState<FeedTopState>('LOADING_FEED')
  const [recordings] = useState<Recording[]>(SAMPLE_RECORDINGS)
  const [recordingIdx, setRecordingIdx] = useState(0)
  const [inner, setInner] = useState<RecordingInnerState>({ kind: 'SNIPPET_PAGE_ACTIVE', index: 0 })
  const [sheet, setSheet] = useState<InteractionSheetState>({ open: false })
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const [reactMenuOpen, setReactMenuOpen] = useState(false)

  const [audioEnabled, setAudioEnabled] = useState(false) // flips true after any user gesture/click
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [scrubSec, setScrubSec] = useState(0)

  // Entry/transition UI helpers
  const [transitionCard, setTransitionCard] = useState<{ visible: boolean; label: string; sub: string } | null>(null)
  const [restCtaVisible, setRestCtaVisible] = useState(false)

  const activeRecording = recordings[recordingIdx] ?? null

  const activePageCount = useMemo(() => {
    if (!activeRecording) return 0
    return activeRecording.snippets.length + 1 // + full recording page
  }, [activeRecording])

  const activePageIndex = useMemo(() => {
    if (!activeRecording) return 0
    if (inner.kind === 'FULL_RECORDING_ACTIVE') return activeRecording.snippets.length
    return clamp(inner.index, 0, activeRecording.snippets.length - 1)
  }, [activeRecording, inner])

  const activeSeekRange = useMemo(() => {
    if (!activeRecording) return { start: 0, end: 0, kind: 'none' as const }
    if (inner.kind === 'SNIPPET_PAGE_ACTIVE') {
      const sn = activeRecording.snippets[inner.index]
      if (!sn) return { start: 0, end: 0, kind: 'none' as const }
      return { start: sn.startTimeSec ?? 0, end: sn.endTimeSec ?? 0, kind: 'snippet' as const }
    }
    return { start: 0, end: activeRecording.durationSec ?? 0, kind: 'full' as const }
  }, [activeRecording, inner])

  const activeClipDuration = useMemo(() => {
    const d = Math.max(0, (activeSeekRange.end ?? 0) - (activeSeekRange.start ?? 0))
    // If we only have recording.durationSec but no clip range, keep it.
    if (activeSeekRange.kind === 'full') return Math.max(0, activeSeekRange.end ?? 0)
    return d
  }, [activeSeekRange])

  // --- Top-level state machine bootstrap ---
  useEffect(() => {
    // Simulate loading for now.
    const t = setTimeout(() => setTopState('RECORDING_STACK_ACTIVE'), 250)
    return () => clearTimeout(t)
  }, [])

  // --- Audio rules: autoplay snippet on visibility, pause on change / sheet open ---
  useEffect(() => {
    if (topState !== 'RECORDING_STACK_ACTIVE') return
    if (!activeRecording) return

    // Pause if sheet open (keeps listening calm).
    if (sheet.open) {
      audioRef.current?.pause()
      return
    }

    // Only autoplay on snippet pages.
    if (inner.kind !== 'SNIPPET_PAGE_ACTIVE') {
      audioRef.current?.pause()
      return
    }

    const snippet = activeRecording.snippets[inner.index]
    if (!snippet) return

    // Create or reuse audio element.
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
    const a = audioRef.current
    a.src = snippet.audioUrl

    if (!audioEnabled) {
      // User has not interacted yet → browsers may block autoplay.
      setAutoplayBlocked(true)
      return
    }

    setAutoplayBlocked(false)
    // Try to seek into the snippet window (best-effort).
    const seekTo = () => {
      try {
        a.currentTime = Math.max(0, snippet.startTimeSec ?? 0)
      } catch {
        // ignore
      }
    }
    if (a.readyState >= 1) seekTo()
    else a.addEventListener('loadedmetadata', seekTo, { once: true })

    const playPromise = a.play()
    if (playPromise && typeof (playPromise as any).catch === 'function') {
      ;(playPromise as Promise<void>).catch(() => {
        setAutoplayBlocked(true)
      })
    }
  }, [activeRecording, audioEnabled, inner, sheet.open, topState])

  // Keep scrub bar in sync with playback, and clamp within the active range.
  useEffect(() => {
    const a = audioRef.current
    if (!a) return

    const tick = () => {
      const start = activeSeekRange.start ?? 0
      const end = activeSeekRange.end ?? 0
      const dur = activeClipDuration
      if (dur <= 0) {
        setScrubSec(0)
        return
      }
      const rel = Math.max(0, Math.min(dur, (a.currentTime ?? 0) - start))
      setScrubSec(rel)

      // If we're on a snippet, stop at end (keeps snippet feeling like a clip).
      if (activeSeekRange.kind === 'snippet' && end > start && a.currentTime >= end) {
        try {
          a.pause()
          a.currentTime = end
        } catch {
          // ignore
        }
      }
    }

    a.addEventListener('timeupdate', tick)
    a.addEventListener('loadedmetadata', tick)
    return () => {
      a.removeEventListener('timeupdate', tick)
      a.removeEventListener('loadedmetadata', tick)
    }
  }, [activeClipDuration, activeSeekRange])

  // Close transcript when page changes.
  useEffect(() => {
    setTranscriptOpen(false)
    setScrubSec(0)
  }, [recordingIdx, inner.kind, inner.kind === 'SNIPPET_PAGE_ACTIVE' ? inner.index : -1])

  // Stop audio when leaving feed states.
  useEffect(() => {
    if (topState !== 'RECORDING_STACK_ACTIVE') {
      audioRef.current?.pause()
    }
  }, [topState])

  // --- End-of-feed rest CTA reveal ---
  useEffect(() => {
    if (topState !== 'END_OF_FEED_REST') {
      setRestCtaVisible(false)
      return
    }
    const reduced = prefersReducedMotion()
    const t = setTimeout(() => setRestCtaVisible(true), reduced ? 300 : 1600)
    return () => clearTimeout(t)
  }, [topState])

  const goNextWithinStack = () => {
    if (!activeRecording) return
    if (inner.kind === 'FULL_RECORDING_ACTIVE') {
      // Wrap behavior: full → snippet 1
      setInner({ kind: 'SNIPPET_PAGE_ACTIVE', index: 0 })
      return
    }
    const next = inner.index + 1
    if (next >= activeRecording.snippets.length) setInner({ kind: 'FULL_RECORDING_ACTIVE' })
    else setInner({ kind: 'SNIPPET_PAGE_ACTIVE', index: next })
  }

  const goPrevWithinStack = () => {
    if (!activeRecording) return
    if (inner.kind === 'FULL_RECORDING_ACTIVE') {
      // Full → last snippet
      setInner({ kind: 'SNIPPET_PAGE_ACTIVE', index: Math.max(0, activeRecording.snippets.length - 1) })
      return
    }
    const prev = inner.index - 1
    if (prev < 0) {
      // Wrap behavior: first snippet → full
      setInner({ kind: 'FULL_RECORDING_ACTIVE' })
    } else {
      setInner({ kind: 'SNIPPET_PAGE_ACTIVE', index: prev })
    }
  }

  const goNextRecording = () => {
    const nextIdx = recordingIdx + 1
    if (nextIdx >= recordings.length) {
      setTopState('END_OF_FEED_REST')
      return
    }

    const next = recordings[nextIdx]
    setTransitionCard({
      visible: true,
      label: next.speakerName,
      sub: `${next.snippets.length} highlights · ${next.dateLabel ?? 'Recorded'}`,
    })
    setRecordingIdx(nextIdx)
    setInner({ kind: 'SNIPPET_PAGE_ACTIVE', index: 0 })

    const reduced = prefersReducedMotion()
    window.setTimeout(() => setTransitionCard(null), reduced ? 220 : 520)
  }

  const goPrevRecording = () => {
    // Optional / disabled (per brief). Keep it simple for now.
  }

  const swipeHandlers = useMemo(
    () => ({
      onSwipeLeft: () => {
        setAudioEnabled(true)
        goPrevWithinStack()
      },
      onSwipeRight: () => {
        setAudioEnabled(true)
        goNextWithinStack()
      },
      onSwipeDown: () => {
        setAudioEnabled(true)
        goNextRecording()
      },
      onSwipeUp: () => {
        setAudioEnabled(true)
        goPrevRecording()
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recordingIdx, recordings.length, inner, topState],
  )

  const swipe = useSwipeRouter(swipeHandlers)

  const openSheet = (mode: 'respond' | 'followup' | 'comment') => {
    if (!activeRecording) return
    const target =
      inner.kind === 'SNIPPET_PAGE_ACTIVE'
        ? { recordingId: activeRecording.recordingId, snippetId: activeRecording.snippets[inner.index]?.snippetId }
        : { recordingId: activeRecording.recordingId }
    setSheet({ open: true, mode, target })
  }

  const closeSheet = () => setSheet({ open: false })

  if (topState === 'LOADING_FEED') {
    return (
      <div className="feed-stage feed-loading">
        <div className="feed-loading-poster">
          <div className="feed-loading-title">Loading feed</div>
          <div className="feed-loading-sub">Pulling highlights…</div>
        </div>
      </div>
    )
  }

  if (topState === 'END_OF_FEED_REST') {
    return (
      <div className="feed-stage feed-rest" {...swipe}>
        <CollageBackground variantKey="rest" calm />
        <div className="feed-rest-poster">
          <div className="feed-rest-line">That’s everything that’s been shared so far.</div>
          {restCtaVisible && (
            <button className="feed-rest-cta" type="button" onClick={() => setTopState('REQUEST_STORY')}>
              Ask for the next story
            </button>
          )}
          {!restCtaVisible && <div className="feed-rest-hint">…</div>}
        </div>
        <div className="feed-rest-gestures">
          <div className="feed-rest-gesture">Swipe left to loop</div>
          <div className="feed-rest-gesture">Swipe up to revisit (soon)</div>
        </div>
      </div>
    )
  }

  if (topState === 'REQUEST_STORY') {
    return (
      <div className="feed-stage feed-request" {...swipe}>
        <CollageBackground variantKey="request" calm />
        <div className="feed-request-card">
          <div className="feed-stamp">REQUEST</div>
          <div className="feed-request-title">Ask for the next story</div>
          <div className="feed-request-form">
            <label className="feed-label">
              Target person (optional)
              <input className="feed-input" placeholder="Mom / Dad / …" />
            </label>
            <label className="feed-label">
              Topic
              <input className="feed-input" placeholder="Tell me about the house you grew up in." />
            </label>
            <button
              className="feed-submit"
              type="button"
              onClick={() => {
                // MVP: fake submit then return to start
                setTopState('RECORDING_STACK_ACTIVE')
                setRecordingIdx(0)
                setInner({ kind: 'SNIPPET_PAGE_ACTIVE', index: 0 })
              }}
            >
              Send Request
            </button>
            <button className="feed-ghost" type="button" onClick={() => setTopState('RECORDING_STACK_ACTIVE')}>
              Back to feed
            </button>
          </div>
        </div>
      </div>
    )
  }

  // RECORDING_STACK_ACTIVE
  if (!activeRecording) {
    return (
      <div className="feed-stage feed-rest">
        <div className="feed-rest-poster">
          <div className="feed-rest-line">No recordings.</div>
          <button className="feed-rest-cta" type="button" onClick={() => setTopState('REQUEST_STORY')}>
            Ask for a story
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="feed-stage" {...swipe}>
      {/* Top-right React */}
      <div className="feed-reactTop">
        <button
          type="button"
          className="feed-reactTop-btn"
          onClick={() => {
            setAudioEnabled(true)
            setReactMenuOpen((v) => !v)
          }}
        >
          React
        </button>
        {reactMenuOpen && (
          <div className="feed-reactTop-menu" role="menu" aria-label="React menu">
            <button type="button" className="feed-reactTop-option" onClick={() => setReactMenuOpen(false)} role="menuitem">
              👍
            </button>
            <button type="button" className="feed-reactTop-option" onClick={() => setReactMenuOpen(false)} role="menuitem">
              ♥
            </button>
            <button type="button" className="feed-reactTop-option" onClick={() => setReactMenuOpen(false)} role="menuitem">
              😂
            </button>
            <button
              type="button"
              className="feed-reactTop-option"
              onClick={() => {
                setReactMenuOpen(false)
                openSheet('comment')
              }}
              role="menuitem"
            >
              💬
            </button>
          </div>
        )}
      </div>

      {/* Transition card on recording change */}
      {transitionCard?.visible && (
        <div className="feed-transition-card" aria-hidden="true">
          <div className="feed-transition-name">{transitionCard.label}</div>
          <div className="feed-transition-sub">{transitionCard.sub}</div>
        </div>
      )}

      {/* Top-left stamp */}
      <div className="feed-speaker-stamp">
        <div className="feed-speaker-name">{activeRecording.speakerName}</div>
        <div className="feed-speaker-sub">
          {activeRecording.snippets.length} highlights · {activeRecording.dateLabel ?? 'Recorded'}
        </div>
      </div>

      {/* Horizontal stack */}
      <div className="feed-horizontal">
        <div
          className="feed-horizontal-track"
          style={{
            width: `${activePageCount * 100}vw`,
            transform: `translateX(-${activePageIndex * 100}vw)`,
          }}
        >
          {activeRecording.snippets.map((sn, i) => (
            <section key={sn.snippetId} className="feed-page" aria-label={`Snippet ${i + 1}`}>
              <CollageBackground
                variantKey={`${activeRecording.recordingId}:${sn.snippetId}`}
                accent={activeRecording.coverArtSet?.accent}
              />
              <button
                type="button"
                className="feed-headline feed-headline-btn"
                data-glitch={!prefersReducedMotion()}
                onClick={() => setTranscriptOpen((v) => !v)}
              >
                {sn.summary}
              </button>
              <div className="feed-tags">
                {sn.themes.slice(0, 5).map((t) => (
                  <span className="feed-tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>

              {transcriptOpen &&
                inner.kind === 'SNIPPET_PAGE_ACTIVE' &&
                inner.index === i &&
                (sn.transcriptExcerpt || '').trim() && (
                  <div className="feed-transcript" role="region" aria-label="Transcript excerpt">
                    <div className="feed-transcript-title">Transcript</div>
                    <div className="feed-transcript-body">{sn.transcriptExcerpt}</div>
                  </div>
                )}

              <div className="feed-rail">
                <button className="feed-rail-btn" type="button" onClick={() => openSheet('respond')}>
                  Respond
                </button>
                <button className="feed-rail-btn" type="button" onClick={() => openSheet('followup')}>
                  Follow-up
                </button>
              </div>

              <div className="feed-footer">
                <div className="feed-footer-inner">
                  <div className="feed-transport">
                  <div className="feed-transport-left">
                    <div className="feed-transport-label">
                      {i + 1}/{activeRecording.snippets.length}
                    </div>
                    <div className="feed-transport-sub">Highlight</div>
                    {autoplayBlocked && inner.kind === 'SNIPPET_PAGE_ACTIVE' && inner.index === i && (
                      <div className="feed-transport-note">Audio locked until you swipe</div>
                    )}
                  </div>
                  <div className="feed-transport-right">
                    <button
                      className="feed-play"
                      type="button"
                      onClick={() => {
                        setAudioEnabled(true)
                        if (!audioRef.current) return
                        if (audioRef.current.paused) audioRef.current.play().catch(() => setAutoplayBlocked(true))
                        else audioRef.current.pause()
                      }}
                    >
                      Play / Pause
                    </button>
                  </div>
                  </div>

                {inner.kind === 'SNIPPET_PAGE_ACTIVE' && inner.index === i && (
                  <MiniScrubBar
                    currentSec={scrubSec}
                    durationSec={Math.max(0, (sn.endTimeSec ?? 0) - (sn.startTimeSec ?? 0))}
                    onSeek={(next) => {
                      const a = audioRef.current
                      if (!a) return
                      setAudioEnabled(true)
                      const start = sn.startTimeSec ?? 0
                      const end = sn.endTimeSec ?? 0
                      const dur = Math.max(0, end - start)
                      const clamped = dur > 0 ? Math.max(0, Math.min(dur, next)) : 0
                      setScrubSec(clamped)
                      try {
                        a.currentTime = start + clamped
                      } catch {
                        // ignore
                      }
                    }}
                    label="Snippet seek"
                  />
                )}
                </div>
              </div>
            </section>
          ))}

          {/* Full recording page */}
          <section className="feed-page feed-page--full" aria-label="Full recording">
            <CollageBackground
              variantKey={`${activeRecording.recordingId}:full`}
              accent={activeRecording.coverArtSet?.accent}
              calm
            />
            <div className="feed-full-card">
              <div className="feed-full-kicker">Full recording</div>
              <div className="feed-full-titleRow">
                <div className="feed-full-speaker">{activeRecording.speakerName}</div>
                <div className="feed-full-dur">{formatDuration(activeRecording.durationSec)}</div>
              </div>
              <div className="feed-full-sub">The long thread: context, pauses, what didn’t fit in highlights.</div>

              <div className="feed-full-actions">
                <button
                  className="feed-full-play"
                  type="button"
                  onClick={() => {
                    setAudioEnabled(true)
                    if (!audioRef.current) audioRef.current = new Audio()
                    const a = audioRef.current
                    a.src = activeRecording.fullAudioUrl
                    a.currentTime = 0
                    a.play().catch(() => setAutoplayBlocked(true))
                  }}
                >
                  Play full recording
                </button>
                <button className="feed-full-secondary" type="button" onClick={() => openSheet('followup')}>
                  Request follow-up
                </button>
              </div>

              <div className="feed-full-divider" />
              <div className="feed-full-sectionTitle">Highlights</div>
              <div className="feed-full-markersGrid">
                {activeRecording.snippets.map((sn, idx) => (
                  <button
                    key={sn.snippetId}
                    className="feed-marker"
                    type="button"
                    onClick={() => setInner({ kind: 'SNIPPET_PAGE_ACTIVE', index: idx })}
                  >
                    <div className="feed-marker-num">{idx + 1}</div>
                    <div className="feed-marker-body">
                      <div className="feed-marker-title">{sn.summary}</div>
                      <div className="feed-marker-tags">{sn.themes.slice(0, 3).join(' · ')}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {inner.kind === 'FULL_RECORDING_ACTIVE' && (
              <div className="feed-footer feed-footer--full">
                <div className="feed-footer-inner">
                  <MiniScrubBar
                    currentSec={scrubSec}
                    durationSec={Math.max(0, activeRecording.durationSec ?? 0)}
                    onSeek={(next) => {
                      const a = audioRef.current
                      if (!a) return
                      setAudioEnabled(true)
                      const dur = Math.max(0, activeRecording.durationSec ?? 0)
                      const clamped = dur > 0 ? Math.max(0, Math.min(dur, next)) : 0
                      setScrubSec(clamped)
                      try {
                        a.currentTime = clamped
                      } catch {
                        // ignore
                      }
                    }}
                    label="Full recording seek"
                  />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Bottom sheet */}
      {sheet.open && (
        <div
          className="feed-sheet-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeSheet()
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Interaction sheet"
        >
          <div className="feed-sheet">
            <div className="feed-sheet-handle" />
            <div className="feed-sheet-title">
              {sheet.mode === 'comment' ? 'Comment' : sheet.mode === 'respond' ? 'Respond' : 'Request follow-up'}
            </div>
            <div className="feed-sheet-body">
              {(sheet.mode === 'respond' || sheet.mode === 'comment') && (
                <>
                  <textarea
                    className="feed-textarea"
                    placeholder={sheet.mode === 'comment' ? 'Write a comment…' : 'Write a response…'}
                    rows={3}
                  />
                  <button className="feed-submit" type="button" onClick={closeSheet}>
                    Send
                  </button>
                </>
              )}
              {sheet.mode === 'followup' && (
                <>
                  <div className="feed-suggestions">
                    {[
                      'What happened right after that?',
                      'What did you wish someone told you then?',
                      'Who was with you?',
                    ].map((q) => (
                      <button key={q} className="feed-suggestion" type="button">
                        {q}
                      </button>
                    ))}
                  </div>
                  <input className="feed-input" placeholder="Custom question…" />
                  <button className="feed-submit" type="button" onClick={closeSheet}>
                    Send request
                  </button>
                </>
              )}
              <div className="feed-sheet-meta">
                Attached to {sheet.target.snippetId ? 'snippet' : 'recording'} · {sheet.target.recordingId}
              </div>
            </div>
            <button className="feed-ghost" type="button" onClick={closeSheet}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BuildSwipeExperience


