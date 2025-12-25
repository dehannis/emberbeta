import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
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
}

interface Creator {
  id: string
  name: string
}

// ============================================
// Perspective Math Utilities
// ============================================

/**
 * True hyperbolic perspective projection
 * scale = d / (d + z)
 * where d = viewing distance, z = depth into scene
 * This is convex: drops faster initially, flattens out
 */
function perspectiveScale(viewingDistance: number, depth: number): number {
  return viewingDistance / (viewingDistance + depth)
}

/**
 * Calculate opacity based on depth (fades with distance)
 */
function perspectiveOpacity(scale: number, minOpacity = 0.2): number {
  return Math.max(minOpacity, scale)
}

/**
 * Get responsive parameters based on container width
 */
function getResponsiveParams(containerWidth: number) {
  // Mobile: 390px, Desktop: 800px max
  const t = Math.min(1, Math.max(0, (containerWidth - 390) / (800 - 390)))

  return {
    viewingDistance: 500 + t * 100, // 500px mobile → 600px desktop
    baseOffset: 200 + t * 100,      // 200px mobile → 300px desktop
    cardWidth: 120 + t * 40,        // 120px mobile → 160px desktop
    cardHeight: 160 + t * 50,       // 160px mobile → 210px desktop
    verticalSpacing: 100 + t * 40,  // 100px mobile → 140px desktop
  }
}

// ============================================
// Sample Data
// ============================================

const creators: Creator[] = [
  { id: 'me', name: 'Me' },
  { id: 'mom', name: 'Mom' },
  { id: 'dad', name: 'Dad' },
  { id: 'sister', name: 'Sister' },
]

// Generate sample memories for each creator across years
function generateSampleMemories(): Memory[] {
  const memories: Memory[] = []
  const years = [2025, 2024, 2023, 2022, 2021, 2020]

  creators.forEach(creator => {
    years.forEach((year) => {
      // 2-4 memories per year per person
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
  scale: number
  opacity: number
  yOffset: number
  xOffset: number
  isActive: boolean
  isCenterColumn: boolean
  onClick?: () => void
}

const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  scale,
  opacity,
  yOffset,
  xOffset,
  isActive,
  isCenterColumn,
  onClick,
}) => {
  const cardStyle: React.CSSProperties = {
    transform: `translate(${xOffset}px, ${yOffset}px) scale(${scale})`,
    opacity,
    zIndex: Math.round(scale * 100),
    // LINEAR_DODGE only on front-most center card
    mixBlendMode: isActive && isCenterColumn ? 'color-dodge' : 'normal',
  }

  return (
    <div
      className={`memory-card ${isActive ? 'memory-card--active' : ''}`}
      style={cardStyle}
      onClick={onClick}
    >
      <div className="memory-card__image">
        {/* Placeholder gradient for now */}
        <div className="memory-card__placeholder" />
      </div>
      <div className="memory-card__meta">
        <span className="memory-card__creator">{memory.creatorName}</span>
        <span className="memory-card__date">{formatDate(memory.date)}</span>
      </div>
    </div>
  )
}

// ============================================
// Memory Timeline Column Component
// ============================================

interface TimelineColumnProps {
  memories: Memory[]
  scrollPosition: number
  params: ReturnType<typeof getResponsiveParams>
  isCenter: boolean
  columnOffset: number
}

const TimelineColumn: React.FC<TimelineColumnProps> = ({
  memories,
  scrollPosition,
  params,
  isCenter,
  columnOffset,
}) => {
  // Sort memories by date (newest first)
  const sortedMemories = useMemo(() =>
    [...memories].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [memories]
  )

  return (
    <div className="timeline-column" style={{ transform: `translateX(${columnOffset}px)` }}>
      {sortedMemories.map((memory, index) => {
        // Calculate depth based on position and scroll
        const baseDepth = index * params.verticalSpacing
        const depth = baseDepth - scrollPosition

        // Skip cards that are too far behind or in front
        if (depth < -params.verticalSpacing || depth > params.viewingDistance * 2) {
          return null
        }

        // Calculate perspective values
        const scale = perspectiveScale(params.viewingDistance, Math.max(0, depth))
        const opacity = perspectiveOpacity(scale)
        const yOffset = depth * 0.5 // Compress vertical space in perspective

        // Front-most card in center column
        const isActive = isCenter && depth >= 0 && depth < params.verticalSpacing

        return (
          <MemoryCard
            key={memory.id}
            memory={memory}
            scale={scale}
            opacity={opacity}
            yOffset={yOffset}
            xOffset={0}
            isActive={isActive}
            isCenterColumn={isCenter}
          />
        )
      })}
    </div>
  )
}

// ============================================
// Creator Tabs Component
// ============================================

interface CreatorTabsProps {
  creators: Creator[]
  activeCreatorId: string
  onCreatorChange: (id: string) => void
}

const CreatorTabs: React.FC<CreatorTabsProps> = ({
  creators,
  activeCreatorId,
  onCreatorChange,
}) => {
  return (
    <div className="creator-tabs">
      {creators.map(creator => (
        <button
          key={creator.id}
          className={`creator-tab ${creator.id === activeCreatorId ? 'creator-tab--active' : ''}`}
          onClick={() => onCreatorChange(creator.id)}
        >
          {creator.name}
        </button>
      ))}
    </div>
  )
}

// ============================================
// Main Remember Component
// ============================================

const Remember: React.FC = () => {
  const [activeCreatorIndex, setActiveCreatorIndex] = useState(0)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [containerWidth, setContainerWidth] = useState(390)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartRef = useRef({ x: 0, y: 0 })

  // Get responsive parameters
  const params = useMemo(() => getResponsiveParams(containerWidth), [containerWidth])

  // Generate memories
  const allMemories = useMemo(() => generateSampleMemories(), [])

  // Get visible creators (active + neighbors for cylinder effect)
  const visibleCreators = useMemo(() => {
    const prev = (activeCreatorIndex - 1 + creators.length) % creators.length
    const next = (activeCreatorIndex + 1) % creators.length
    return [
      { creator: creators[prev], position: -1 },
      { creator: creators[activeCreatorIndex], position: 0 },
      { creator: creators[next], position: 1 },
    ]
  }, [activeCreatorIndex])

  // Get current year/season for display
  const currentMemory = useMemo(() => {
    const creatorMemories = allMemories
      .filter(m => m.creatorId === creators[activeCreatorIndex].id)
      .sort((a, b) => b.date.getTime() - a.date.getTime())

    // Find memory closest to current scroll position
    const index = Math.floor(scrollPosition / params.verticalSpacing)
    return creatorMemories[Math.max(0, Math.min(index, creatorMemories.length - 1))]
  }, [allMemories, activeCreatorIndex, scrollPosition, params.verticalSpacing])

  // Handle container resize
  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth)
    }
  }, [])

  React.useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  // Handle vertical scroll (navigate through time)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setScrollPosition(prev => Math.max(0, prev + e.deltaY * 0.5))
  }, [])

  // Handle touch gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y

    // Horizontal swipe threshold
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        // Swipe right → previous creator
        setActiveCreatorIndex(prev => (prev - 1 + creators.length) % creators.length)
      } else {
        // Swipe left → next creator
        setActiveCreatorIndex(prev => (prev + 1) % creators.length)
      }
    }
  }, [])

  // Handle shuffle (random memory)
  const handleShuffle = useCallback(() => {
    const creatorMemories = allMemories.filter(
      m => m.creatorId === creators[activeCreatorIndex].id
    )
    const randomIndex = Math.floor(Math.random() * creatorMemories.length)
    setScrollPosition(randomIndex * params.verticalSpacing)
  }, [allMemories, activeCreatorIndex, params.verticalSpacing])

  return (
    <>
      <img
        className="remember-background"
        src="/stock/ember_purple.png"
        alt=""
        aria-hidden="true"
      />
      <div className="remember-page">
        <Header />

      <main
        ref={containerRef}
        className="remember-container"
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Timeline viewport */}
        <div className="timeline-viewport">
          {visibleCreators.map(({ creator, position }) => {
            const creatorMemories = allMemories.filter(m => m.creatorId === creator.id)
            const columnOffset = position * params.baseOffset

            return (
              <TimelineColumn
                key={creator.id}
                memories={creatorMemories}
                scrollPosition={scrollPosition}
                params={params}
                isCenter={position === 0}
                columnOffset={columnOffset}
              />
            )
          })}
        </div>

        {/* UI Controls */}
        <div className="remember-controls">
          {/* Shuffle button (bottom left) */}
          <button className="remember-btn remember-btn--shuffle" onClick={handleShuffle}>
            ⟳
          </button>

          {/* Season/Year display (bottom right) */}
          {currentMemory && (
            <div className="remember-season">
              {formatSeason(currentMemory.date)}
            </div>
          )}
        </div>

        {/* Creator tabs */}
        <CreatorTabs
          creators={creators}
          activeCreatorId={creators[activeCreatorIndex].id}
          onCreatorChange={(id) => {
            const index = creators.findIndex(c => c.id === id)
            if (index !== -1) setActiveCreatorIndex(index)
          }}
        />
      </main>

      <Footer />
      </div>
    </>
  )
}

export default Remember
