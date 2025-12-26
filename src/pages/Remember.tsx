import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Remember.css'

// ============================================
// Types
// ============================================

interface Memory {
  id: string
  imageUrl: string
  creatorId: string
  creatorName: string
  date: Date
  recordingId?: string
}

interface Creator {
  id: string
  name: string
}

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
  { z: 0, size: 180, yOffset: 0, opacity: 1, titleSize: 24, dateSize: 13 },
  { z: -120, size: 130, yOffset: -310, opacity: 0.9, titleSize: 17, dateSize: 6 },
  { z: -220, size: 100, yOffset: -540, opacity: 0.8, titleSize: 13, dateSize: 5 },
  { z: -300, size: 70, yOffset: -700, opacity: 0.7, titleSize: 9, dateSize: 3.5 },
  { z: -360, size: 60, yOffset: -810, opacity: 0.6, titleSize: 7, dateSize: 3 },
  { z: -410, size: 45, yOffset: -900, opacity: 0.5, titleSize: 5, dateSize: 2 },
  { z: -450, size: 35, yOffset: -970, opacity: 0.4, titleSize: 4, dateSize: 1.5 },
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

const creators: Creator[] = [
  { id: 'dad', name: 'Dad' },
  { id: 'mom', name: 'Mom' },
  { id: 'me', name: 'Me' },
]

// Position-based offsets (left, center, right)
const POSITION_OFFSETS = [-340, 0, 340]

function generateSampleMemories(): Memory[] {
  const memories: Memory[] = []
  const years = [2025, 2024, 2023, 2022, 2021, 2020]

  creators.forEach(creator => {
    years.forEach((year) => {
      const count = 2 + Math.floor(Math.random() * 3)
      for (let i = 0; i < count; i++) {
        const month = Math.floor(Math.random() * 12)
        const day = 1 + Math.floor(Math.random() * 28)
        memories.push({
          id: `${creator.id}-${year}-${i}`,
          imageUrl: `/placeholder-memory.jpg`,
          creatorId: creator.id,
          creatorName: creator.name,
          date: new Date(year, month, day),
          recordingId: `recording-${creator.id}-${year}-${i}`,
        })
      }
    })
  })

  return memories
}

// ============================================
// Date Formatting
// ============================================

const monthNames = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
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

// ============================================
// Memory Card Component
// ============================================

interface MemoryCardProps {
  memory: Memory
  depthState: CardDepthState
  xOffset: number
  isActive: boolean
  centerBlend: number // 0 = side styling, 1 = center styling
  onNavigate?: (recordingId: string) => void
}

const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  depthState,
  xOffset,
  isActive,
  centerBlend,
  onNavigate,
}) => {
  // Traffic cone model: X offset + Z depth into screen + Y offset up
  // Calculate convergence with accelerating pigeon-toe (squared for more aggressive end convergence)
  const depthRatio = Math.abs(depthState.z) / 450
  const convergenceFactor = 1 - Math.pow(depthRatio, 0.7) * 0.98  // Accelerating convergence
  const convergedXOffset = xOffset * convergenceFactor

  // Derive center/side blend from X position for perfect sync
  // xOffset: -340 (left) to 0 (center) to +340 (right)
  // positionBlend: 0 (side) to 1 (center)
  const positionBlend = 1 - Math.min(Math.abs(xOffset) / 340, 1)

  // Blend between side and center styling using positionBlend (derived from X position)
  // Side: 0.80 scale, center: 1.0 scale
  const sideScaleFactor = 0.80 + positionBlend * 0.20
  // Side: extra depth shrink, center: none
  const sideDepthScale = 1 - (1 - positionBlend) * depthRatio * 0.25
  const finalSize = depthState.size * sideScaleFactor * sideDepthScale

  // Y offsets derived from X position - moves in perfect sync with horizontal slide
  const centerYExtra = positionBlend * depthRatio * -100
  const sideYBase = (1 - positionBlend) * 60
  const sideYExtra = (1 - positionBlend) * depthRatio * 60
  const finalYOffset = depthState.yOffset + centerYExtra + sideYBase + sideYExtra

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
    fontSize: `${depthState.titleSize * textScale}px`,
  }

  const dateStyle: React.CSSProperties = {
    fontSize: `${depthState.dateSize * textScale}px`,
  }

  const handleClick = () => {
    if (onNavigate && memory.recordingId) {
      onNavigate(memory.recordingId)
    }
  }

  // Active state only applies when fully in center (centerBlend > 0.5)
  const isFullyCenter = centerBlend > 0.5

  return (
    <div
      className={`memory-card ${isActive && isFullyCenter ? 'memory-card--active' : ''}`}
      style={cardStyle}
      onClick={handleClick}
    >
      <div className="memory-card__image">
        <div className="memory-card__placeholder" />
      </div>
      {/* Show title/date on all cards, sized proportionally */}
      <div className="memory-card__meta" style={{ opacity: depthState.opacity }}>
        <span className="memory-card__title" style={titleStyle}>almost</span>
        <span className="memory-card__date" style={dateStyle}>{formatDate(memory.date)}</span>
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
  onNavigate?: (recordingId: string) => void
}

const TimelineColumn: React.FC<TimelineColumnProps> = ({
  memories,
  scrollPosition,
  xOffset,
  isCenter,
  centerBlend,
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

        // Front-most card in center column is active
        const isActive = depthIndex >= 0 && depthIndex < 1

        return (
          <MemoryCard
            key={memory.id}
            memory={memory}
            depthState={depthState}
            xOffset={xOffset}
            isActive={isActive}
            centerBlend={centerBlend}
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
// Y values create arc: sides are lower (y=46), center is higher (y=0)
// This naturally creates a curved floating path when transitioning
const HEADER_POSITIONS = {
  left: { x: -120, y: 46, scale: 0.95, opacity: 0.85 },
  center: { x: 0, y: 0, scale: 1, opacity: 1 },
  right: { x: 120, y: 46, scale: 0.95, opacity: 0.85 },
  // Fade out positions (same spot, just invisible)
  fadeOutLeft: { x: -120, y: 46, scale: 0.95, opacity: 0 },
  fadeOutRight: { x: 120, y: 46, scale: 0.95, opacity: 0 },
  // Teleport positions (new spot, invisible, ready to fade in)
  teleportLeft: { x: -120, y: 46, scale: 0.95, opacity: 0 },
  teleportRight: { x: 120, y: 46, scale: 0.95, opacity: 0 },
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
      const relativePos = (index - 1 + 3) % 3 // Assuming Mom (index 1) starts as center
      const position: PositionKey = relativePos === 0 ? 'center' : relativePos === 1 ? 'right' : 'left'
      initial.set(creator.id, { position, isAnimating: false, isFadingOut: false, isTeleporting: false, animation: null })
    })
    return initial
  })

  const [isRotating, setIsRotating] = useState(false)

  // Handle rotation animation
  const handleRotation = useCallback((targetIndex: number) => {
    if (isRotating || targetIndex === activeCreatorIndex) return

    // Determine current positions
    const getPositionOfCreator = (idx: number): PositionKey => {
      const rel = (idx - activeCreatorIndex + 3) % 3
      return rel === 0 ? 'center' : rel === 1 ? 'right' : 'left'
    }

    const clickedPosition = getPositionOfCreator(targetIndex)

    // Clicking LEFT: everyone rotates clockwise (left→center, center→right, right→left via wrap)
    // Clicking RIGHT: everyone rotates counter-clockwise (right→center, center→left, left→right via wrap)
    const isClickingLeft = clickedPosition === 'left'

    setIsRotating(true)

    // Find who is in each position
    let leftCreatorIdx = -1, centerCreatorIdx = -1, rightCreatorIdx = -1
    creators.forEach((_, idx) => {
      const pos = getPositionOfCreator(idx)
      if (pos === 'left') leftCreatorIdx = idx
      else if (pos === 'center') centerCreatorIdx = idx
      else if (pos === 'right') rightCreatorIdx = idx
    })

    const wrapFinalPosition: PositionKey = isClickingLeft ? 'left' : 'right'

    // Step 1: After 500ms delay, start ALL animations simultaneously
    setTimeout(() => {
      setAnimStates(prev => {
        const next = new Map(prev)

        if (isClickingLeft) {
          // Clockwise: all 3 animate together
          next.set(creators[leftCreatorIdx].id, {
            position: 'center', isAnimating: true, isFadingOut: false, isTeleporting: false,
            animation: 'arcLeftToCenter'
          })
          next.set(creators[centerCreatorIdx].id, {
            position: 'right', isAnimating: true, isFadingOut: false, isTeleporting: false,
            animation: 'arcCenterToRight'
          })
          next.set(creators[rightCreatorIdx].id, {
            position: wrapFinalPosition, isAnimating: true, isFadingOut: false, isTeleporting: false,
            animation: 'fadeOutRight' // Combined fade-out-teleport-fade-in
          })
        } else {
          // Counter-clockwise: all 3 animate together
          next.set(creators[rightCreatorIdx].id, {
            position: 'center', isAnimating: true, isFadingOut: false, isTeleporting: false,
            animation: 'arcRightToCenter'
          })
          next.set(creators[centerCreatorIdx].id, {
            position: 'left', isAnimating: true, isFadingOut: false, isTeleporting: false,
            animation: 'arcCenterToLeft'
          })
          next.set(creators[leftCreatorIdx].id, {
            position: wrapFinalPosition, isAnimating: true, isFadingOut: false, isTeleporting: false,
            animation: 'fadeOutLeft' // Combined fade-out-teleport-fade-in
          })
        }

        return next
      })
    }, 500) // Initial delay before movement

    // Step 2: Change active creator when header animation starts (so cards animate together)
    setTimeout(() => {
      onCreatorChange(targetIndex)
    }, 500) // Same time as header animation starts

    // Step 3: Complete animation - reset header states
    setTimeout(() => {
      setIsRotating(false)
      // Reset all animation states to final positions
      setAnimStates(prev => {
        const next = new Map(prev)
        creators.forEach((creator, index) => {
          const relativePos = (index - targetIndex + 3) % 3
          const position: PositionKey = relativePos === 0 ? 'center' : relativePos === 1 ? 'right' : 'left'
          next.set(creator.id, { position, isAnimating: false, isFadingOut: false, isTeleporting: false, animation: null })
        })
        return next
      })
    }, 500 + 1500) // Delay + animation duration

  }, [isRotating, activeCreatorIndex, creators, onCreatorChange])

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
                transform: state.animation ? undefined : `translate(${pos.x}px, ${pos.y}px) scale(${pos.scale})`,
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
  const [activeCreatorIndex, setActiveCreatorIndex] = useState(1) // Start with Mom
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isNavigatingToListen, setIsNavigatingToListen] = useState(false)
  const [isVisible, setIsVisible] = useState(false) // Start hidden, fade in after delay
  // Animated positions: [Dad xOffset, Mom xOffset, Me xOffset]
  // Start: Dad=left(-340), Mom=center(0), Me=right(340)
  const [animatedXOffsets, setAnimatedXOffsets] = useState<number[]>([-340, 0, 340])
  // centerBlend values for each creator (0 = side styling, 1 = center styling)
  const [centerBlends, setCenterBlends] = useState<number[]>([0, 1, 0]) // Dad=side, Mom=center, Me=side
  const animationFrameRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 })
  const gestureRef = useRef<{ isVertical: boolean | null }>({ isVertical: null })

  // Entrance animation: wait 0.5s, then fade in over 2s
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Generate memories
  const allMemories = useMemo(() => generateSampleMemories(), [])

  // Get current memory for season display
  const currentMemory = useMemo(() => {
    const creatorMemories = allMemories
      .filter(m => m.creatorId === creators[activeCreatorIndex].id)
      .sort((a, b) => b.date.getTime() - a.date.getTime())

    const index = Math.floor(scrollPosition / 100)
    return creatorMemories[Math.max(0, Math.min(index, creatorMemories.length - 1))]
  }, [allMemories, activeCreatorIndex, scrollPosition])

  // Switch to different creator with synchronized animations
  const switchToCreator = useCallback((newIndex: number) => {
    if (isAnimating || newIndex === activeCreatorIndex) return
    setIsAnimating(true)
    setActiveCreatorIndex(newIndex)

    // Calculate target positions based on new active creator
    // Position 0 = left (-340), Position 1 = center (0), Position 2 = right (340)
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

  // Handle scroll (macOS natural scrolling - content follows finger)
  const handleWheel = useCallback((e: React.WheelEvent) => {
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
  }, [activeCreatorIndex, switchToCreator])

  // Touch gesture handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    }
    gestureRef.current.isVertical = null
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
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
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
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
  }, [activeCreatorIndex, switchToCreator])

  // Handle shuffle
  const handleShuffle = useCallback(() => {
    const creatorMemories = allMemories.filter(
      m => m.creatorId === creators[activeCreatorIndex].id
    )
    const randomIndex = Math.floor(Math.random() * creatorMemories.length)
    setScrollPosition(randomIndex * 100)
  }, [allMemories, activeCreatorIndex])

  // Navigation with fade transition
  const handleNavigateToListen = useCallback((recordingId: string) => {
    setIsNavigatingToListen(true)
    // Wait 0.5s delay, then fade out, then navigate
    setTimeout(() => {
      navigate(`/listen/${recordingId}`, { state: { fromRemember: true } })
    }, 500)
  }, [navigate])

  // Ensure root has dark background immediately when Remember page loads
  // This prevents white flash when navigating from landing page
  useEffect(() => {
    const root = document.getElementById('root')
    if (root) {
      // Set immediately to prevent white flash
      root.style.backgroundColor = 'var(--black)'
    }
  }, [])

  return (
    <>
      <img
        className="remember-background"
        src="/stock/ember_purple.png"
        alt=""
        aria-hidden="true"
      />
      <div className={`remember-page ${isNavigatingToListen ? 'remember-page--fading-out' : ''}`}>
        <Header />

        <div className={`remember-content ${isVisible ? 'remember-content--visible' : ''} ${isNavigatingToListen ? 'remember-content--fading-out' : ''}`}>
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
          <div className="timeline-viewport">
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
                  onNavigate={handleNavigateToListen}
                />
              )
            })}
          </div>

          {/* UI Controls */}
          <div className="remember-controls">
            <button className="remember-btn remember-btn--shuffle" onClick={handleShuffle}>
              ⤭
            </button>

            {currentMemory && (
              <div className="remember-season">
                {formatSeason(currentMemory.date)}
              </div>
            )}
          </div>
        </main>
        </div>

        <Footer />
      </div>
    </>
  )
}

export default Remember
