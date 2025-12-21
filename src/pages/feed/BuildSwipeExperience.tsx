import React, { useEffect, useMemo, useRef, useState } from 'react'
import type { FeedTopState, Recording, RecordingInnerState } from './types'
import { SAMPLE_RECORDINGS } from './sampleFeed'
import { useSwipeRouter } from './useSwipeRouter'
import CollageBackground from './CollageBackground'
import './feed.css'

type InteractionSheetState =
  | { open: false }
  | { open: true; mode: 'react' | 'respond' | 'followup'; target: { recordingId: string; snippetId?: string } }

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

  const [audioEnabled, setAudioEnabled] = useState(false) // flips true after any user gesture/click
  const [, setAutoplayBlocked] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

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
    a.currentTime = 0

    if (!audioEnabled) {
      // User has not interacted yet → browsers may block autoplay.
      setAutoplayBlocked(true)
      return
    }

    setAutoplayBlocked(false)
    const playPromise = a.play()
    if (playPromise && typeof (playPromise as any).catch === 'function') {
      ;(playPromise as Promise<void>).catch(() => {
        setAutoplayBlocked(true)
      })
    }
  }, [activeRecording, audioEnabled, inner, sheet.open, topState])

  // Close transcript when page changes.
  useEffect(() => {
    setTranscriptOpen(false)
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

  const openSheet = (mode: 'react' | 'respond' | 'followup') => {
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
                <button className="feed-rail-btn" type="button" onClick={() => openSheet('react')}>
                  React
                </button>
                <button className="feed-rail-btn" type="button" onClick={() => openSheet('respond')}>
                  Respond
                </button>
                <button className="feed-rail-btn" type="button" onClick={() => openSheet('followup')}>
                  Follow-up
                </button>
              </div>

              <div className="feed-transport">
                <div className="feed-transport-left">
                  <div className="feed-transport-label">
                    {i + 1}/{activeRecording.snippets.length}
                  </div>
                  <div className="feed-transport-sub">Highlight</div>
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
            </section>
          ))}

          {/* Full recording page */}
          <section className="feed-page feed-page--full" aria-label="Full recording">
            <CollageBackground
              variantKey={`${activeRecording.recordingId}:full`}
              accent={activeRecording.coverArtSet?.accent}
              calm
            />
            <div className="feed-full">
              <div className="feed-full-header">
                <div className="feed-full-kicker">Full recording</div>
                <div className="feed-full-title">
                  {activeRecording.speakerName}
                  <span className="feed-full-dur">{formatDuration(activeRecording.durationSec)}</span>
                </div>
                <div className="feed-full-sub">
                  The long thread. Context, pauses, what didn’t fit in highlights.
                </div>
              </div>

              <div className="feed-full-hero">
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

              <div className="feed-full-markersTitle">Highlights</div>
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
                      <div className="feed-marker-tags">{sn.themes.slice(0, 2).join(' · ')}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
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
              {sheet.mode === 'react' ? 'React' : sheet.mode === 'respond' ? 'Respond' : 'Request follow-up'}
            </div>
            <div className="feed-sheet-body">
              {sheet.mode === 'react' && (
                <div className="feed-react-row">
                  {['♥', '⚡', '☺', '✺'].map((x) => (
                    <button key={x} className="feed-react" type="button" onClick={closeSheet}>
                      {x}
                    </button>
                  ))}
                </div>
              )}
              {sheet.mode === 'respond' && (
                <>
                  <textarea className="feed-textarea" placeholder="Write a response…" rows={3} />
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


