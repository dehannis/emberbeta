import React, { useState, useRef, useCallback, useMemo, useEffect, useLayoutEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import type { Creator, Memory } from '../data/sampleMemories'
import { creators, generateSampleMemories } from '../data/sampleMemories'
import './Remember.css'

// ============================================
// Types
// ============================================

// ============================================
// Card Depth States (from Figma)
// Traffic cone model: cards recede INTO screen along Z-axis
// ============================================

interface CardDepthState {
  z: number      // translateZ depth (negative = into screen)
  size: number   // card size in pixels
  yOffset: number // Y offset (negative = up toward vanishing point)
  opacity: number
  titleSize: number
  dateSize: number
}

// Lookup table matching Figma's card sizes/positions
// yOffset values tuned for steeper center stack angle
const CARD_DEPTH_STATES: CardDepthState[] = [
  // NOTE: sizes tuned for mobile-first readability at 100% zoom (avoid oversized serif + overlaps).
  { z: 0, size: 180, yOffset: 0, opacity: 1, titleSize: 16, dateSize: 12 },
  { z: -120, size: 130, yOffset: -310, opacity: 0.9, titleSize: 12, dateSize: 10 },
  { z: -220, size: 100, yOffset: -540, opacity: 0.8, titleSize: 10, dateSize: 9 },
  { z: -300, size: 70, yOffset: -700, opacity: 0.7, titleSize: 8, dateSize: 8 },
  { z: -360, size: 60, yOffset: -810, opacity: 0.6, titleSize: 7, dateSize: 7 },
  { z: -410, size: 45, yOffset: -900, opacity: 0.5, titleSize: 6, dateSize: 6 },
  { z: -450, size: 35, yOffset: -970, opacity: 0.4, titleSize: 5, dateSize: 5 },
]

// Interpolate between two depth states based on progress (0-1)
function interpolateDepthState(
  from: CardDepthState,
  to: CardDepthState,
  progress: number
): CardDepthState {
  const lerp = (a: number, b: number) => a + (b - a) * progress
  return {
    z: lerp(from.z, to.z),
    size: lerp(from.size, to.size),
    yOffset: lerp(from.yOffset, to.yOffset),
    opacity: lerp(from.opacity, to.opacity),
    titleSize: lerp(from.titleSize, to.titleSize),
    dateSize: lerp(from.dateSize, to.dateSize),
  }
}

// Get depth state for a card at a given depth index (can be fractional)
function getCardDepthState(depthIndex: number): CardDepthState | null {
  if (depthIndex < -0.5) return null // Card is in front/below viewport
  if (depthIndex >= CARD_DEPTH_STATES.length) return null // Card is too far back

  const clampedIndex = Math.max(0, depthIndex)
  const fromIndex = Math.floor(clampedIndex)
  const toIndex = Math.min(fromIndex + 1, CARD_DEPTH_STATES.length - 1)
  const progress = clampedIndex - fromIndex

  return interpolateDepthState(
    CARD_DEPTH_STATES[fromIndex],
    CARD_DEPTH_STATES[toIndex],
    progress
  )
}

// ============================================
// Sample Data
// ============================================

// Position-based offsets (left, center, right)
// Tighten the left/right columns so near-front blocks don't feel overly separated on mobile.
// 25% tighter than the original ±340 => 340 * 0.75 = 255
const MAX_COLUMN_X_OFFSET = 255
const POSITION_OFFSETS = [-MAX_COLUMN_X_OFFSET, 0, MAX_COLUMN_X_OFFSET]

// ============================================
// Date Formatting
// ============================================

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function formatDate(date: Date): string {
  const month = monthNames[date.getMonth()]
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}

function formatSeason(date: Date): string {
  const month = date.getMonth()
  const year = date.getFullYear()

  if (month >= 2 && month <= 4) return `spring ${year}`
  if (month >= 5 && month <= 7) return `summer ${year}`
  if (month >= 8 && month <= 10) return `fall ${year}`
  return `winter ${year}`
}

function toTitleCase(input: string): string {
  return input
    .trim()
    .split(/\s+/)
    .map(word => {
      const lower = word.toLowerCase()
      return lower.length ? lower[0].toUpperCase() + lower.slice(1) : lower
    })
    .join(' ')
}

function formatDuration(durationSec: number): string {
  const total = Math.max(0, Math.floor(durationSec))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// ============================================
// Memory Card Component
// ============================================

interface MemoryCardProps {
  memory: Memory
  depthState: CardDepthState
  xOffset: number
  isActive: boolean
  centerBlend: number // 0 = side styling, 1 = center styling
  columnId: string
  depthIndex: number
  sortedIndex: number
  onSelect?: (args: { creatorId: string; sortedIndex: number }) => void
  onNavigate?: (recordingId: string) => void
}

const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  depthState,
  xOffset,
  isActive,
  centerBlend,
  columnId,
  depthIndex,
  sortedIndex,
  onSelect,
  onNavigate,
}) => {
  // Traffic cone model: X offset + Z depth into screen + Y offset up
  // Calculate convergence with accelerating pigeon-toe (squared for more aggressive end convergence)
  const depthRatio = Math.abs(depthState.z) / 450
  const convergenceFactor = 1 - Math.pow(depthRatio, 0.7) * 0.98  // Accelerating convergence
  const convergedXOffset = xOffset * convergenceFactor

  // Derive center/side blend from X position for perfect sync
  // xOffset: -MAX_COLUMN_X_OFFSET (left) to 0 (center) to +MAX_COLUMN_X_OFFSET (right)
  // positionBlend: 0 (side) to 1 (center)
  const positionBlend = 1 - Math.min(Math.abs(xOffset) / MAX_COLUMN_X_OFFSET, 1)

  // Blend between side and center styling using positionBlend (derived from X position)
  // Side: 0.80 scale, center: 1.0 scale
  const sideScaleFactor = 0.80 + positionBlend * 0.20
  // Side: extra depth shrink, center: none
  const sideDepthScale = 1 - (1 - positionBlend) * depthRatio * 0.25
  // Global "zoom out" so more blocks are visible at once (mobile-first).
  const globalScale = 0.78
  const finalSize = depthState.size * sideScaleFactor * sideDepthScale * globalScale

  // Y offsets derived from X position - moves in perfect sync with horizontal slide
  // Perception tuning:
  // - Center column should feel slightly "closer" than side columns.
  // In this perspective setup, lower on screen reads closer, so we bias center down a bit
  // and bias side columns up a bit (especially for the near-front blocks).
  const centerYExtra = positionBlend * depthRatio * -85
  const centerYBase = positionBlend * 18
  const sideYBase = (1 - positionBlend) * -18
  const sideYExtra = (1 - positionBlend) * depthRatio * -18

  // Tighten vertical spacing between depth layers so the stack reads denser on mobile.
  const ySpacingScale = 0.86
  // Desktop-only lift: cards are absolutely positioned, so CSS spacing tokens won't move them.
  // Lift the whole stack slightly on desktop so labels never collide with the bottom info bar.
  // Mobile-only lift: add a bit more breathing room above the bottom info bar.
  const isDesktop =
    typeof window !== 'undefined' && window.matchMedia('(min-width: 769px)').matches
  const desktopLift = isDesktop ? -110 : 0
  // Apply to all non-desktop widths (mobile web + small tablets) so it reliably triggers.
  const mobileLift = !isDesktop ? -48 /* ~3rem */ : 0
  const finalYOffset =
    (depthState.yOffset + centerYExtra + centerYBase + sideYBase + sideYExtra) * ySpacingScale
    + desktopLift
    + mobileLift

  const cardStyle: React.CSSProperties = {
    width: finalSize,
    height: finalSize,
    transform: `translateX(${convergedXOffset - finalSize / 2}px) translateY(${finalYOffset}px) translateZ(${depthState.z}px)`,
    opacity: depthState.opacity,
    zIndex: Math.round(1000 + depthState.z), // Higher z-index for closer cards
  }

  // Scale title/date sizes based on blend
  const textScale = sideScaleFactor * sideDepthScale
  const titleStyle: React.CSSProperties = {
    // Block labels should be quieter/smaller than the card itself.
    fontSize: `${depthState.titleSize * textScale * 0.66}px`,
  }

  const handleClick = () => {
    // Only navigate when this card is truly the centered/locked "main" memory.
    if (isActive && isFullyCenter && onNavigate && memory.recordingId) {
      onNavigate(memory.recordingId)
      return
    }

    // Otherwise, select it (rotate/scroll to make it active).
    onSelect?.({ creatorId: memory.creatorId, sortedIndex })
  }

  // Active state only applies when fully in center (centerBlend > 0.5)
  const isFullyCenter = centerBlend > 0.5

  // Fade images earlier than text so the stack never visually collides with the creator header.
  // As depth increases, imageOpacity falls off faster than overall card opacity.
  const imageOpacity = Math.max(0, Math.min(1, 1 - Math.pow(depthRatio, 0.9) * 1.35))

  // Make the main (centered/locked) memory slightly more prominent.
  // IMPORTANT: avoid a sudden "hitch" by ramping the boost smoothly as the front-most card approaches.
  // depthIndex moves from ~1 → 0 as it becomes the front-most card. We ramp in over [1..0],
  // then keep full emphasis until it drops out of the render window (< -0.5).
  const smoothstep = (t: number) => t * t * (3 - 2 * t)
  const centerEmphasis = useMemo(() => {
    if (!isFullyCenter) return 0
    if (depthIndex <= 0) return 1
    if (depthIndex >= 1) return 0
    const t = 1 - depthIndex // 0 at 1, 1 at 0
    return smoothstep(Math.max(0, Math.min(1, t)))
  }, [depthIndex, isFullyCenter])
  const activeSizeBoost = 1 + 0.10 * centerEmphasis
  // Pass-through glow should fade aggressively with depth (far memories much fainter).
  const depthGlow = Math.pow(depthState.opacity, 2)
  const threadNodeOpacityBase = 0.02 + depthGlow * 0.24
  const threadNodeOpacity = isActive
    ? Math.min(1, threadNodeOpacityBase + (isFullyCenter ? 0.14 : 0.10))
    : threadNodeOpacityBase

  return (
    <div
      className={`memory-card ${isActive && isFullyCenter ? 'memory-card--active' : ''}`}
      style={{
        ...cardStyle,
        width: cardStyle.width ? Number(cardStyle.width) * activeSizeBoost : cardStyle.width,
        height: cardStyle.height ? Number(cardStyle.height) * activeSizeBoost : cardStyle.height,
        transform: `translateX(${convergedXOffset - (finalSize * activeSizeBoost) / 2}px) translateY(${finalYOffset}px) translateZ(${depthState.z}px)`,
      }}
      onClick={handleClick}
      data-memory-id={memory.id}
      data-creator-id={memory.creatorId}
    >
      <div
        className={`memory-thread-node ${isActive && isFullyCenter ? 'memory-thread-node--active' : ''}`}
        style={{ opacity: threadNodeOpacity }}
        data-thread-node="1"
        data-column-id={columnId}
        data-depth-index={depthIndex}
        aria-hidden="true"
      />
      <div className="memory-card__image" style={{ opacity: imageOpacity }}>
        <div className="memory-card__placeholder" />
      </div>
      {/* Show title/date on all cards, sized proportionally */}
      <div className="memory-card__meta" style={{ opacity: depthState.opacity }}>
        <span className="memory-card__title" style={titleStyle}>
          {toTitleCase(memory.title)}
        </span>
      </div>
    </div>
  )
}

// ============================================
// Timeline Column Component (Traffic Cone Model)
// ============================================

interface TimelineColumnProps {
  memories: Memory[]
  scrollPosition: number
  xOffset: number
  isCenter: boolean
  centerBlend: number // 0 = full side styling, 1 = full center styling (for smooth transitions)
  onSelect?: (args: { creatorId: string; sortedIndex: number }) => void
  onNavigate?: (recordingId: string) => void
}

const TimelineColumn: React.FC<TimelineColumnProps> = ({
  memories,
  scrollPosition,
  xOffset,
  centerBlend,
  onSelect,
  onNavigate,
}) => {
  // Sort memories by date (newest first)
  const sortedMemories = useMemo(() =>
    [...memories].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [memories]
  )

  // Column opacity blends between side (0.7) and center (1)
  const columnOpacity = 0.7 + centerBlend * 0.3

  return (
    <div className="timeline-column" style={{ opacity: columnOpacity }}>
      {sortedMemories.map((memory, index) => {
        // Calculate depth index based on position and scroll
        // Each unit = one card position in the depth state table
        const depthIndex = index - (scrollPosition / 100)

        // Get interpolated depth state
        const depthState = getCardDepthState(depthIndex)
        if (!depthState) return null

        // Front-most card should stay "active" until it actually leaves the render window.
        // Cards are only removed once depthIndex < -0.5 (see getCardDepthState), so keep the
        // active styling through that threshold to avoid a jarring revert at the bottom.
        const isActive = depthIndex > -0.5 && depthIndex < 1

        return (
          <MemoryCard
            key={memory.id}
            memory={memory}
            depthState={depthState}
            xOffset={xOffset}
            isActive={isActive}
            centerBlend={centerBlend}
            columnId={memory.creatorId}
            depthIndex={depthIndex}
            sortedIndex={index}
            onSelect={onSelect}
            onNavigate={onNavigate}
          />
        )
      })}
    </div>
  )
}

// ============================================
// Creator Header Component
// Carousel animation: names rotate along curved path
// ============================================

interface CreatorHeaderProps {
  creators: Creator[]
  activeCreatorIndex: number
  onCreatorChange: (index: number) => void
}

// Position configs for the 3 slots: left, center, right
// Y values: sides sit slightly below center (~1rem) for a subtle hierarchy
// This naturally creates a curved floating path when transitioning
const HEADER_POSITIONS = {
  left: { x: -120, y: 16, scale: 0.95, opacity: 0.85 },
  center: { x: 0, y: 0, scale: 1, opacity: 1 },
  right: { x: 120, y: 16, scale: 0.95, opacity: 0.85 },
  // Fade out positions (same spot, just invisible)
  fadeOutLeft: { x: -120, y: 16, scale: 0.95, opacity: 0 },
  fadeOutRight: { x: 120, y: 16, scale: 0.95, opacity: 0 },
  // Teleport positions (new spot, invisible, ready to fade in)
  teleportLeft: { x: -120, y: 16, scale: 0.95, opacity: 0 },
  teleportRight: { x: 120, y: 16, scale: 0.95, opacity: 0 },
}

type PositionKey = keyof typeof HEADER_POSITIONS

interface CreatorAnimState {
  position: PositionKey
  isAnimating: boolean
  isFadingOut: boolean  // true when fading out in place
  isTeleporting: boolean // true when instantly moving (no transition)
  animation: string | null // CSS animation name
}

const CreatorHeader: React.FC<CreatorHeaderProps> = ({
  creators,
  activeCreatorIndex,
  onCreatorChange,
}) => {
  const [animStates, setAnimStates] = useState<Map<string, CreatorAnimState>>(() => {
    const initial = new Map<string, CreatorAnimState>()
    creators.forEach((creator, index) => {
      // Initialize positions based on the passed-in activeCreatorIndex (centered creator).
      const relativePos = (index - activeCreatorIndex + creators.length) % creators.length
      const position: PositionKey =
        relativePos === 0 ? 'center' : relativePos === 1 ? 'right' : 'left'
      initial.set(creator.id, { position, isAnimating: false, isFadingOut: false, isTeleporting: false, animation: null })
    })
    return initial
  })

  const [isRotating, setIsRotating] = useState(false)

  // Sync header rotation with external column swivel.
  // When activeCreatorIndex changes (via swipe/wheel or click), animate names to match the columns.
  const prevActiveIndexRef = useRef(activeCreatorIndex)
  useEffect(() => {
    const prev = prevActiveIndexRef.current
    if (prev === activeCreatorIndex) return

    // Determine whether the new active was previously on the right (rel=1) or left (rel=2).
    const rel = (activeCreatorIndex - prev + creators.length) % creators.length
    if (rel === 0) return

    // Based on previous active, find who was left/center/right.
    const getPositionOfCreatorFrom = (idx: number, activeIdx: number): PositionKey => {
      const r = (idx - activeIdx + creators.length) % creators.length
      return r === 0 ? 'center' : r === 1 ? 'right' : 'left'
    }

    let leftCreatorIdx = -1, centerCreatorIdx = -1, rightCreatorIdx = -1
    creators.forEach((_, idx) => {
      const pos = getPositionOfCreatorFrom(idx, prev)
      if (pos === 'left') leftCreatorIdx = idx
      else if (pos === 'center') centerCreatorIdx = idx
      else if (pos === 'right') rightCreatorIdx = idx
    })

    // If new active was previously on the right (rel=1), we rotate counter-clockwise:
    // right→center, center→left, left wraps to right (fadeOutLeft).
    // If new active was previously on the left (rel=2), rotate clockwise:
    // left→center, center→right, right wraps to left (fadeOutRight).
    const isClockwise = rel === 2

    setIsRotating(true)
    setAnimStates(prevMap => {
      const next = new Map(prevMap)
      if (isClockwise) {
        next.set(creators[leftCreatorIdx].id, {
          position: 'center', isAnimating: true, isFadingOut: false, isTeleporting: false,
          animation: 'arcLeftToCenter',
        })
        next.set(creators[centerCreatorIdx].id, {
          position: 'right', isAnimating: true, isFadingOut: false, isTeleporting: false,
          animation: 'arcCenterToRight',
        })
        next.set(creators[rightCreatorIdx].id, {
          position: 'left', isAnimating: true, isFadingOut: false, isTeleporting: false,
          animation: 'fadeOutRight',
        })
      } else {
        next.set(creators[rightCreatorIdx].id, {
          position: 'center', isAnimating: true, isFadingOut: false, isTeleporting: false,
          animation: 'arcRightToCenter',
        })
        next.set(creators[centerCreatorIdx].id, {
          position: 'left', isAnimating: true, isFadingOut: false, isTeleporting: false,
          animation: 'arcCenterToLeft',
        })
        next.set(creators[leftCreatorIdx].id, {
          position: 'right', isAnimating: true, isFadingOut: false, isTeleporting: false,
          animation: 'fadeOutLeft',
        })
      }
      return next
    })

    const timer = window.setTimeout(() => {
      setIsRotating(false)
      setAnimStates(prevMap => {
        const next = new Map(prevMap)
        creators.forEach((creator, index) => {
          const relativePos = (index - activeCreatorIndex + creators.length) % creators.length
          const position: PositionKey = relativePos === 0 ? 'center' : relativePos === 1 ? 'right' : 'left'
          next.set(creator.id, { position, isAnimating: false, isFadingOut: false, isTeleporting: false, animation: null })
        })
        return next
      })
    }, 1500)

    prevActiveIndexRef.current = activeCreatorIndex
    return () => window.clearTimeout(timer)
  }, [activeCreatorIndex, creators])

  // Click: just request a creator change; the effect above will animate the header in sync with columns.
  const handleRotation = useCallback((targetIndex: number) => {
    if (isRotating || targetIndex === activeCreatorIndex) return
    onCreatorChange(targetIndex)
  }, [isRotating, activeCreatorIndex, onCreatorChange])

  return (
    <div className="creator-header">
      <div className="creator-header__carousel">
        {creators.map((creator, index) => {
          const state = animStates.get(creator.id)!
          const pos = HEADER_POSITIONS[state.position]
          const isCenter = state.position === 'center'

          return (
            <button
              key={creator.id}
              className={`creator-name ${isCenter ? 'creator-name--active' : 'creator-name--side'}`}
              style={{
                // Baseline at true center (independent of button width), then apply position offsets.
                transform: state.animation ? undefined : `translate(-50%, 0) translate(${pos.x}px, ${pos.y}px) scale(${pos.scale})`,
                opacity: state.animation ? undefined : pos.opacity,
                animation: state.animation
                  ? `${state.animation} 1.5s ease-in-out forwards`
                  : 'none',
                pointerEvents: isRotating ? 'none' : 'auto',
              }}
              onClick={() => handleRotation(index)}
              disabled={isRotating}
            >
              {creator.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Main Remember Component
// ============================================

const Remember: React.FC = () => {
  const navigate = useNavigate()
  const [activeCreatorIndex, setActiveCreatorIndex] = useState(2) // Start with Me
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false) // Start hidden, fade in after delay
  // Animated positions: [Dad xOffset, Mom xOffset, Me xOffset]
  // Start: Mom=left, Me=center, Dad=right (per request)
  const [animatedXOffsets, setAnimatedXOffsets] = useState<number[]>([
    MAX_COLUMN_X_OFFSET,  // Dad on the right
    -MAX_COLUMN_X_OFFSET, // Mom on the left
    0,                    // Me in the center
  ])
  // centerBlend values for each creator (0 = side styling, 1 = center styling)
  const [centerBlends, setCenterBlends] = useState<number[]>([0, 0, 1]) // Dad=side, Mom=side, Me=center
  const animationFrameRef = useRef<number | null>(null)
  const scrollAnimRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const timelineViewportRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 })
  const gestureRef = useRef<{ isVertical: boolean | null }>({ isVertical: null })

  // Thread polylines: measured from per-card glow nodes (pixel perfect)
  const [threadSvgSize, setThreadSvgSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 })
  const [threadPaths, setThreadPaths] = useState<Record<string, string>>({})

  // Transition into Play page (zoom into active memory, fade everything else).
  const PLAY_QUOTES = useMemo(
    () => [
      'I didn’t realize it at the time, but that moment stayed with me.',
      'Some memories don’t fade—they just change shape.',
      'I can still hear the room, the pause, the breath before the story.',
      'There are days that quietly become the foundation for everything else.',
    ],
    [],
  )
  const [playTransition, setPlayTransition] = useState<null | {
    recordingId: string
    creatorName: string
    quote: string
    rect: { top: number; left: number; width: number; height: number }
  }>(null)
  const [isPlayZooming, setIsPlayZooming] = useState(false)
  const playNavTimerRef = useRef<number | null>(null)

  // Entrance animation: wait 0.5s, then fade in over 2s
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Build per-column thread polylines by measuring the actual glow nodes in DOM.
  // We render the SVG as a fixed overlay (viewport coordinates) to avoid browser quirks with SVG
  // inside 3D/perspective containers (can show as a "broken image" overlay on some mobile browsers).
  useLayoutEffect(() => {
    const viewportEl = timelineViewportRef.current
    if (!viewportEl) return

    let raf = 0

    const measure = () => {
      const vv = window.visualViewport
      const w = Math.max(0, Math.round(vv?.width ?? window.innerWidth))
      const h = Math.max(0, Math.round(vv?.height ?? window.innerHeight))
      setThreadSvgSize({ w, h })

      const nodes = Array.from(
        viewportEl.querySelectorAll<HTMLElement>('[data-thread-node="1"]')
      )

      type Pt = { x: number; y: number; depthIndex: number }
      const byCol: Record<string, Pt[]> = {}

      for (const node of nodes) {
        const col = node.dataset.columnId
        const depth = Number(node.dataset.depthIndex)
        if (!col || Number.isNaN(depth)) continue

        const r = node.getBoundingClientRect()
        const x = (r.left + r.width / 2)
        const y = (r.top + r.height / 2)
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue
        ;(byCol[col] ||= []).push({ x, y, depthIndex: depth })
      }

      const next: Record<string, string> = {}
      for (const [col, pts] of Object.entries(byCol)) {
        if (pts.length < 2) continue
        // Farther back cards have larger depthIndex; front-most is ~0..1 (and can go slightly negative).
        pts.sort((a, b) => b.depthIndex - a.depthIndex)
        next[col] = pts
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
          .join(' ')
      }

      setThreadPaths(next)
    }

    raf = requestAnimationFrame(measure)
    const onResize = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(measure)
    }
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('scroll', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('scroll', onResize)
    }
  }, [scrollPosition, animatedXOffsets, centerBlends])

  // Generate memories
  const allMemories = useMemo(() => generateSampleMemories(), [])

  // Get current memory for info bar display.
  // Important: switch as soon as the current front card is no longer visible.
  // Cards become non-rendered when depthIndex < -0.5 (see getCardDepthState),
  // so we advance the active index at ~50% between steps.
  const currentMemory = useMemo(() => {
    const creatorMemories = allMemories
      .filter(m => m.creatorId === creators[activeCreatorIndex].id)
      .sort((a, b) => b.date.getTime() - a.date.getTime())

    // Advance once the current card would drop below the render threshold.
    // scrollPosition is in 100-unit steps per card; threshold is at +50.
    const rawIndex = Math.ceil(scrollPosition / 100 - 0.5)
    const index = Math.max(0, Math.min(rawIndex, creatorMemories.length - 1))
    return creatorMemories[index]
  }, [allMemories, activeCreatorIndex, scrollPosition])

  // Switch to different creator with synchronized animations
  const switchToCreator = useCallback((newIndex: number) => {
    if (isAnimating || newIndex === activeCreatorIndex) return
    setIsAnimating(true)
    setActiveCreatorIndex(newIndex)

    // Calculate target positions based on new active creator
    // Position 0 = left, Position 1 = center, Position 2 = right
    const getTargetXOffset = (creatorIdx: number) => {
      const relativePosition = (creatorIdx - newIndex + 3) % 3
      const positionIndex = relativePosition === 0 ? 1 : relativePosition === 1 ? 2 : 0
      return POSITION_OFFSETS[positionIndex]
    }

    // Animate both xOffsets and centerBlends together over 1.5s
    const duration = 1500
    const startTime = performance.now()
    const startXOffsets = [...animatedXOffsets]
    const startBlends = [...centerBlends]
    const targetXOffsets = creators.map((_, i) => getTargetXOffset(i))
    const targetBlends = creators.map((_, i) => i === newIndex ? 1 : 0)

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Use ease-in-out curve
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      // Animate both xOffsets and blends in sync
      const newXOffsets = startXOffsets.map((start, i) => {
        const target = targetXOffsets[i]
        return start + (target - start) * eased
      })
      const newBlends = startBlends.map((start, i) => {
        const target = targetBlends[i]
        return start + (target - start) * eased
      })

      setAnimatedXOffsets(newXOffsets)
      setCenterBlends(newBlends)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        animationFrameRef.current = null
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)
  }, [activeCreatorIndex, isAnimating, animatedXOffsets, centerBlends])

  const animateScrollTo = useCallback((target: number, durationMs: number = 650) => {
    if (scrollAnimRef.current) {
      cancelAnimationFrame(scrollAnimRef.current)
      scrollAnimRef.current = null
    }

    const start = scrollPosition
    const end = Math.max(0, target)
    const startTime = performance.now()
    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs)
      const eased = easeInOut(t)
      setScrollPosition(start + (end - start) * eased)
      if (t < 1) {
        scrollAnimRef.current = requestAnimationFrame(tick)
      } else {
        scrollAnimRef.current = null
      }
    }

    scrollAnimRef.current = requestAnimationFrame(tick)
  }, [scrollPosition])

  const handleSelectMemory = useCallback((args: { creatorId: string; sortedIndex: number }) => {
    const creatorIndex = creators.findIndex(c => c.id === args.creatorId)
    if (creatorIndex < 0) return

    const targetScroll = args.sortedIndex * 100

    if (creatorIndex !== activeCreatorIndex) {
      // First swivel to the correct column, then scroll the timeline to bring the clicked memory forward.
      switchToCreator(creatorIndex)
      window.setTimeout(() => {
        animateScrollTo(targetScroll, 750)
      }, 650)
      return
    }

    animateScrollTo(targetScroll, 650)
  }, [activeCreatorIndex, switchToCreator, animateScrollTo])

  // Handle scroll (macOS natural scrolling - content follows finger)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (playTransition) return
    e.preventDefault()

    // Horizontal scroll → switch creators
    // Natural: swipe left (deltaX > 0) → content moves left → next creator
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 10) {
      if (e.deltaX > 30) {
        // Swipe left → next creator
        const nextIndex = (activeCreatorIndex + 1) % creators.length
        switchToCreator(nextIndex)
      } else if (e.deltaX < -30) {
        // Swipe right → previous creator
        const prevIndex = (activeCreatorIndex - 1 + creators.length) % creators.length
        switchToCreator(prevIndex)
      }
      return
    }

    // Vertical scroll → navigate through time
    // Natural: swipe up (deltaY < 0) → content moves up → older memories (scrollPosition increases)
    // Inverted from traditional: subtract instead of add
    setScrollPosition(prev => Math.max(0, prev - e.deltaY * 0.5))
  }, [activeCreatorIndex, playTransition, switchToCreator])

  // Touch gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (playTransition) return
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
    gestureRef.current.isVertical = null
  }, [playTransition])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (playTransition) return
    const currentX = e.touches[0].clientX
    const currentY = e.touches[0].clientY
    const deltaX = Math.abs(currentX - touchStartRef.current.x)
    const deltaY = Math.abs(currentY - touchStartRef.current.y)

    if (gestureRef.current.isVertical === null && (deltaX > 10 || deltaY > 10)) {
      gestureRef.current.isVertical = deltaY > deltaX
    }

    if (gestureRef.current.isVertical === true) {
      // Natural scrolling: finger moves up → content moves up with finger → older memories
      const scrollDelta = touchStartRef.current.y - currentY
      setScrollPosition(prev => Math.max(0, prev + scrollDelta * 0.5))
      touchStartRef.current.y = currentY
    }
  }, [playTransition])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (playTransition) return
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x
    const deltaTime = Date.now() - touchStartRef.current.time

    const velocityX = deltaX / Math.max(deltaTime, 1)
    const isHorizontalGesture = gestureRef.current.isVertical === false
    const isQuickSwipe = Math.abs(velocityX) > 0.3
    const isLongSwipe = Math.abs(deltaX) > 50

    if (isHorizontalGesture && (isQuickSwipe || isLongSwipe)) {
      if (deltaX > 0) {
        // Swipe right → previous creator
        const prevIndex = (activeCreatorIndex - 1 + creators.length) % creators.length
        switchToCreator(prevIndex)
      } else {
        // Swipe left → next creator
        const nextIndex = (activeCreatorIndex + 1) % creators.length
        switchToCreator(nextIndex)
      }
    }

    gestureRef.current.isVertical = null
  }, [activeCreatorIndex, playTransition, switchToCreator])

  // Handle shuffle
  const handleShuffle = useCallback(() => {
    const creatorMemories = allMemories.filter(
      m => m.creatorId === creators[activeCreatorIndex].id
    )
    const randomIndex = Math.floor(Math.random() * creatorMemories.length)
    setScrollPosition(randomIndex * 100)
  }, [allMemories, activeCreatorIndex])

  const startPlayTransition = useCallback((recordingId: string) => {
    if (!recordingId) return
    if (playNavTimerRef.current) {
      window.clearTimeout(playNavTimerRef.current)
      playNavTimerRef.current = null
    }

    const memoryForRecording =
      allMemories.find(m => m.recordingId === recordingId) ?? currentMemory
    const creatorName =
      creators.find(c => c.id === memoryForRecording.creatorId)?.name ?? 'Me'
    const quote = PLAY_QUOTES[Math.floor(Math.random() * PLAY_QUOTES.length)]
    const playMeta = {
      title: memoryForRecording.title,
      topic: memoryForRecording.topic,
      dateISO: memoryForRecording.date.toISOString(),
    }

    const viewportEl = timelineViewportRef.current
    const sel = `[data-memory-id="${memoryForRecording.id}"][data-creator-id="${memoryForRecording.creatorId}"]`
    const cardEl = (viewportEl?.querySelector(sel) ?? document.querySelector(sel)) as HTMLElement | null
    const r = cardEl?.getBoundingClientRect()

    if (!r || r.width <= 0 || r.height <= 0) {
      // Fallback: no measured rect → navigate immediately.
      navigate(`/play/${recordingId}`, { state: { fromRemember: true, quote, creatorName, playMeta } })
      return
    }

    setPlayTransition({
      recordingId,
      creatorName,
      quote,
      rect: { top: r.top, left: r.left, width: r.width, height: r.height },
    })
    setIsPlayZooming(false)
    requestAnimationFrame(() => setIsPlayZooming(true))

    // 700ms zoom per spec; navigate right after.
    playNavTimerRef.current = window.setTimeout(() => {
      navigate(`/play/${recordingId}`, { state: { fromRemember: true, quote, creatorName, playMeta } })
    }, 700)
  }, [PLAY_QUOTES, allMemories, creators, currentMemory, navigate])

  // Clean up timers if unmounting mid-transition.
  useEffect(() => {
    return () => {
      if (playNavTimerRef.current) window.clearTimeout(playNavTimerRef.current)
    }
  }, [])

  // Ensure root has dark background immediately when Remember page loads
  // This prevents white flash when navigating from landing page
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) {
      // Ensure we don't stomp the galaxy background image applied via CSS.
      // Keep a dark fallback color only.
      root.style.backgroundColor = 'var(--black)'
    }
  }, [])

  return (
    <>
      <div
        className={[
          'remember-page',
          playTransition ? 'remember-page--playTransition' : '',
          isPlayZooming ? 'remember-page--playZooming' : '',
        ].join(' ')}
      >
        {playTransition && (
          <>
            <div
              className={`remember-playOverlay ${isPlayZooming ? 'remember-playOverlay--zooming' : ''}`}
              style={{
                top: `${playTransition.rect.top}px`,
                left: `${playTransition.rect.left}px`,
                width: `${playTransition.rect.width}px`,
                height: `${playTransition.rect.height}px`,
              }}
              aria-hidden="true"
            >
              <div className="memory-card__image" style={{ opacity: 1 }}>
                <div className="memory-card__placeholder" />
              </div>
            </div>
          </>
        )}
        {isVisible && threadSvgSize.w > 0 && threadSvgSize.h > 0 && (
          <svg
            className="remember-threadOverlay remember-threadOverlay--visible"
            viewBox={`0 0 ${threadSvgSize.w} ${threadSvgSize.h}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              {/* Fade threads into disappearance as they recede upward/back in the cone */}
              <linearGradient
                id="rememberThreadFade"
                gradientUnits="userSpaceOnUse"
                x1="0"
                x2="0"
                y1={threadSvgSize.h}
                y2="0"
              >
                {/* Dark graphite thread, same fade curve */}
                <stop offset="0%" stopColor="rgba(92,92,98,0.42)" />
                <stop offset="40%" stopColor="rgba(92,92,98,0.22)" />
                <stop offset="70%" stopColor="rgba(92,92,98,0.10)" />
                <stop offset="100%" stopColor="rgba(92,92,98,0.00)" />
              </linearGradient>
            </defs>
            {Object.entries(threadPaths).map(([col, d]) => (
              <path key={col} className="timeline-threadPath" d={d} />
            ))}
          </svg>
        )}
        <Header />

        <div className={`remember-content ${isVisible ? 'remember-content--visible' : ''}`}>
          <CreatorHeader
            creators={creators}
            activeCreatorIndex={activeCreatorIndex}
            onCreatorChange={switchToCreator}
          />

          <main
            ref={containerRef}
            className="remember-container"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
          {/* Timeline viewport - CSS perspective creates traffic cone effect */}
          <div ref={timelineViewportRef} className="timeline-viewport">
            {creators.map((creator, index) => {
              const creatorMemories = allMemories.filter(m => m.creatorId === creator.id)

              // Use animated xOffset (driven by JS animation, not CSS transitions)
              const xOffset = animatedXOffsets[index]
              const isCenter = index === activeCreatorIndex

              return (
                <TimelineColumn
                  key={creator.id}
                  memories={creatorMemories}
                  scrollPosition={scrollPosition}
                  xOffset={xOffset}
                  isCenter={isCenter}
                  centerBlend={centerBlends[index]}
                  onSelect={handleSelectMemory}
                  onNavigate={startPlayTransition}
                />
              )
            })}
          </div>

          {/* UI Controls */}
        </main>
        </div>

        {/* Info bar (bottom): delay until page has entered, then slide up */}
        <div
          className={`remember-bottomBar ${isVisible ? 'remember-bottomBar--visible' : ''}`}
          role="region"
          aria-label="Active memory"
        >
          <div className="remember-bottomBar-inner">
            <div className="remember-bottomBar-left">
              {currentMemory && (
                <>
                  <div className="remember-bottomBar-season">{formatSeason(currentMemory.date)}</div>
                  <div className="remember-bottomBar-title" title={toTitleCase(currentMemory.title)}>
                    {toTitleCase(currentMemory.title)}
                  </div>
                  <div className="remember-bottomBar-meta">
                    <div className="remember-bottomBar-metaRow">
                      <span className="remember-bottomBar-label">Topic</span>
                      <span className="remember-bottomBar-value">{toTitleCase(currentMemory.topic)}</span>
                    </div>
                    <div className="remember-bottomBar-metaRow">
                      <span className="remember-bottomBar-label">Recorded On</span>
                      <span className="remember-bottomBar-value">{formatDate(currentMemory.date)}</span>
                    </div>
                    <div className="remember-bottomBar-metaRow">
                      <span className="remember-bottomBar-label">Length Of Memory</span>
                      <span className="remember-bottomBar-value">{formatDuration(currentMemory.durationSec)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="remember-bottomBar-actions">
              <button
                className="remember-btn remember-btn--play"
                type="button"
                aria-label="Play"
                disabled={!currentMemory?.recordingId}
                onClick={() => {
                  if (!currentMemory?.recordingId) return
                  startPlayTransition(currentMemory.recordingId)
                }}
              >
                ▶
              </button>
              <button
                className="remember-btn remember-btn--shuffle"
                type="button"
                onClick={handleShuffle}
                aria-label="Shuffle"
              >
                ⤭
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  )
}

export default Remember
