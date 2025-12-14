import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import './Build.css'

interface Memory {
  id: number
  title: string
  date: string
  year: number
  month: number
  duration: string
  preview: string
  audioUrl?: string
  color: string
}

const Build: React.FC = () => {
  const navigate = useNavigate()
  const audioRef = useRef<HTMLAudioElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  
  const [birthYear, setBirthYear] = useState<number>(1990)
  const [currentYear] = useState<number>(new Date().getFullYear())
  const [zoom, setZoom] = useState<number>(1)
  const [rotateX, setRotateX] = useState<number>(15)
  const [rotateY, setRotateY] = useState<number>(0)
  const [translateZ, setTranslateZ] = useState<number>(0)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [lastRotation, setLastRotation] = useState<{ x: number; y: number }>({ x: 15, y: 0 })
  
  // Sample memories with different colors
  const [memories] = useState<Memory[]>([
    {
      id: 1,
      title: 'Morning Reflection',
      date: 'March 15, 2024',
      year: 2024,
      month: 3,
      duration: '12:34',
      preview: 'A quiet moment to reflect on the week ahead and set intentions for the coming days...',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      color: 'rgba(140, 200, 255, 0.9)',
    },
    {
      id: 2,
      title: 'Family Stories',
      date: 'March 10, 2024',
      year: 2024,
      month: 3,
      duration: '8:21',
      preview: 'Sharing stories about growing up together, the summers at grandma\'s house...',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      color: 'rgba(255, 180, 140, 0.9)',
    },
    {
      id: 3,
      title: 'Gratitude Practice',
      date: 'December 5, 2023',
      year: 2023,
      month: 12,
      duration: '5:47',
      preview: 'Today I am grateful for the simple moments that make life beautiful...',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      color: 'rgba(180, 255, 180, 0.9)',
    },
    {
      id: 4,
      title: 'First Day Memories',
      date: 'September 1, 2020',
      year: 2020,
      month: 9,
      duration: '15:12',
      preview: 'Remembering my first day at the new job, the excitement and nervousness...',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      color: 'rgba(255, 220, 140, 0.9)',
    },
    {
      id: 5,
      title: 'Summer Adventure',
      date: 'July 20, 2018',
      year: 2018,
      month: 7,
      duration: '9:33',
      preview: 'That road trip we took along the coast, the ocean breeze and sunset views...',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      color: 'rgba(200, 160, 255, 0.9)',
    },
  ])

  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hoveredYear, setHoveredYear] = useState<number | null>(null)

  // Load birth year from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('emberAccountData')
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      if (parsedData.birthYear) {
        const year = parseInt(parsedData.birthYear, 10)
        if (!isNaN(year) && year > 1900 && year <= currentYear) {
          setBirthYear(year)
        }
      }
    }
  }, [currentYear])

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [selectedMemory])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(console.error)
    } else {
      audio.pause()
    }
  }, [isPlaying, selectedMemory])

  // Calculate timeline structure
  const totalYears = currentYear - birthYear + 1
  const years = Array.from({ length: totalYears }, (_, i) => birthYear + i)

  // Get memories for a specific year
  const getMemoriesForYear = (year: number) => {
    return memories.filter(m => m.year === year)
  }

  // Calculate 3D position for year markers (spiral/helix arrangement)
  const getYearPosition = (year: number) => {
    const yearIndex = year - birthYear
    const progress = yearIndex / (totalYears - 1 || 1)
    
    // Create a flowing timeline going into the distance
    const z = (1 - progress) * 1000 - 500  // Further = past, closer = present
    const x = Math.sin(progress * Math.PI * 0.3) * 50
    const y = 0
    
    return { x, y, z }
  }

  // Calculate position for a memory sphere
  const getMemoryPosition = (memory: Memory, index: number, total: number) => {
    const yearPos = getYearPosition(memory.year)
    
    // Spread memories around the year marker
    const angle = (index / (total || 1)) * Math.PI * 2 + memory.month * 0.5
    const radius = 80 + (total > 1 ? index * 20 : 0)
    
    return {
      x: yearPos.x + Math.cos(angle) * radius,
      y: yearPos.y + Math.sin(angle) * radius * 0.6 - 30,
      z: yearPos.z + Math.sin(angle) * 30,
    }
  }

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.25, 2.5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.25, 0.4))
  }

  // Drag handlers for 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.memory-sphere-wrapper') || 
        (e.target as HTMLElement).closest('.ghost-sphere-wrapper')) {
      return
    }
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setLastRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const deltaX = (e.clientX - dragStart.x) * 0.3
      const deltaY = (e.clientY - dragStart.y) * 0.2
      
      setRotateY(lastRotation.y + deltaX)
      setRotateX(Math.max(-30, Math.min(45, lastRotation.x - deltaY)))
    }
  }, [isDragging, dragStart, lastRotation])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Wheel for zoom and depth navigation
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    
    if (e.shiftKey) {
      // Shift + scroll = navigate through time
      setTranslateZ(prev => Math.max(-300, Math.min(300, prev - e.deltaY * 0.5)))
    } else {
      // Normal scroll = zoom
      const delta = e.deltaY > 0 ? 0.92 : 1.08
      setZoom(prev => Math.max(0.4, Math.min(2.5, prev * delta)))
    }
  }

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      setIsDragging(true)
      setDragStart({ x: touch.clientX, y: touch.clientY })
      setLastRotation({ x: rotateX, y: rotateY })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0]
      const deltaX = (touch.clientX - dragStart.x) * 0.3
      const deltaY = (touch.clientY - dragStart.y) * 0.2
      
      setRotateY(lastRotation.y + deltaX)
      setRotateX(Math.max(-30, Math.min(45, lastRotation.x - deltaY)))
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Memory interaction
  const handleMemoryClick = (memory: Memory) => {
    setSelectedMemory(memory)
    setIsPlaying(true)
  }

  const handleClosePlayer = () => {
    setIsPlaying(false)
    setSelectedMemory(null)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Navigate to Talk to record new memory
  const handleRecordNew = () => {
    navigate('/talk')
  }

  // Calculate scale based on z-position (for depth effect)
  const getScaleFromZ = (z: number) => {
    const normalizedZ = (z + 500) / 1000  // 0 = far, 1 = close
    return 0.4 + normalizedZ * 0.6
  }

  // Calculate opacity based on z-position
  const getOpacityFromZ = (z: number) => {
    const normalizedZ = (z + 500) / 1000
    return 0.3 + normalizedZ * 0.7
  }

  return (
    <div className="build-page">
      <Header />
      
      {/* Timeline Viewport */}
      <div 
        className="timeline-viewport"
        ref={timelineRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 3D Timeline Space */}
        <div 
          className="timeline-space"
          style={{
            transform: `
              translateZ(${translateZ}px)
              rotateX(${rotateX}deg)
              rotateY(${rotateY}deg)
              scale(${zoom})
            `,
          }}
        >
          {/* Timeline axis - year markers */}
          <div className="timeline-axis">
            {years.map((year) => {
              const pos = getYearPosition(year)
              const scale = getScaleFromZ(pos.z)
              const opacity = getOpacityFromZ(pos.z)
              const yearMemories = getMemoriesForYear(year)
              const hasMemories = yearMemories.length > 0
              
              return (
                <div
                  key={year}
                  className={`timeline-year-marker ${hasMemories ? 'has-memories' : ''} ${hoveredYear === year ? 'hovered' : ''}`}
                  style={{
                    transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) scale(${scale})`,
                    opacity,
                  }}
                  onMouseEnter={() => setHoveredYear(year)}
                  onMouseLeave={() => setHoveredYear(null)}
                >
                  <span className="year-label">{year}</span>
                  <div className="year-line" />
                </div>
              )
            })}
          </div>

          {/* Memory Spheres */}
          {years.map(year => {
            const yearMemories = getMemoriesForYear(year)
            return yearMemories.map((memory, index) => {
              const pos = getMemoryPosition(memory, index, yearMemories.length)
              const scale = getScaleFromZ(pos.z)
              const opacity = getOpacityFromZ(pos.z)
              
              return (
                <div
                  key={memory.id}
                  className="memory-sphere-wrapper"
                  style={{
                    transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) scale(${scale})`,
                    opacity,
                  }}
                  onClick={() => handleMemoryClick(memory)}
                >
                  <div 
                    className="memory-sphere"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, 
                        ${memory.color.replace('0.9', '1')}, 
                        ${memory.color}, 
                        ${memory.color.replace('0.9', '0.6')})`,
                      boxShadow: `
                        0 0 30px ${memory.color.replace('0.9', '0.4')}, 
                        0 0 60px ${memory.color.replace('0.9', '0.2')},
                        inset 0 0 20px ${memory.color.replace('0.9', '0.3')}
                      `,
                    }}
                  />
                  <div className="memory-sphere-label">
                    <span className="memory-sphere-title">{memory.title}</span>
                    <span className="memory-sphere-date">{memory.date}</span>
                  </div>
                </div>
              )
            })
          })}

          {/* Ghost Spheres - Empty years with subtle prompt */}
          {years
            .filter(year => getMemoriesForYear(year).length === 0)
            .filter((_, i) => i % 3 === 0) // Show every 3rd empty year
            .slice(0, 10)
            .map((year) => {
              const pos = getYearPosition(year)
              const scale = getScaleFromZ(pos.z) * 0.8
              const opacity = getOpacityFromZ(pos.z) * 0.5
              
              // Add some variation
              const offset = {
                x: Math.sin(year * 0.7) * 60,
                y: Math.cos(year * 0.5) * 40 - 20,
              }
              
              return (
                <div
                  key={`ghost-${year}`}
                  className="ghost-sphere-wrapper"
                  style={{
                    transform: `translate3d(${pos.x + offset.x}px, ${pos.y + offset.y}px, ${pos.z}px) scale(${scale})`,
                    opacity,
                  }}
                  onClick={handleRecordNew}
                >
                  <div className="ghost-sphere">
                    <span className="ghost-plus">+</span>
                  </div>
                  <div className="ghost-label">{year}</div>
                </div>
              )
            })}
        </div>

        {/* Depth fog effect */}
        <div className="depth-fog depth-fog-far" />
        <div className="depth-fog depth-fog-near" />
      </div>

      {/* Zoom Controls */}
      <div className="timeline-controls">
        <button className="zoom-btn" onClick={handleZoomOut} aria-label="Zoom out">−</button>
        <div className="zoom-indicator">{Math.round(zoom * 100)}%</div>
        <button className="zoom-btn" onClick={handleZoomIn} aria-label="Zoom in">+</button>
      </div>

      {/* Year info overlay when hovering */}
      {hoveredYear && (
        <div className="year-info-overlay">
          <span className="year-info-year">{hoveredYear}</span>
          <span className="year-info-count">
            {getMemoriesForYear(hoveredYear).length} {getMemoriesForYear(hoveredYear).length === 1 ? 'memory' : 'memories'}
          </span>
        </div>
      )}

      {/* Empty state prompt */}
      {memories.length < 5 && (
        <div className="empty-prompt">
          <p>Your timeline has empty spaces waiting to be filled</p>
          <button onClick={handleRecordNew} className="record-btn">
            Record a Memory
          </button>
        </div>
      )}

      {/* Audio Player Modal */}
      {selectedMemory && (
        <div className="audio-player-overlay" onClick={handleClosePlayer}>
          <div className="audio-player" onClick={(e) => e.stopPropagation()}>
            <div className="player-header">
              <button className="player-close" onClick={handleClosePlayer}>
                ×
              </button>
            </div>
            <div 
              className="player-sphere"
              style={{
                background: `radial-gradient(circle at 30% 30%, 
                  ${selectedMemory.color.replace('0.9', '1')}, 
                  ${selectedMemory.color}, 
                  rgba(0, 0, 0, 0.6))`,
                boxShadow: `
                  0 0 50px ${selectedMemory.color.replace('0.9', '0.5')}, 
                  0 0 100px ${selectedMemory.color.replace('0.9', '0.3')}
                `,
              }}
            />
            <div className="player-content">
              <h2 className="player-title">{selectedMemory.title}</h2>
              <p className="player-date">{selectedMemory.date}</p>
              <p className="player-preview">{selectedMemory.preview}</p>
            </div>
            <div className="player-controls">
              <button className="play-pause-button" onClick={handlePlayPause}>
                {isPlaying ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="6 3 20 12 6 21" />
                  </svg>
                )}
              </button>
              <div className="player-progress-container">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="player-progress"
                />
                <div className="player-time">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
            {selectedMemory.audioUrl && (
              <audio
                ref={audioRef}
                src={selectedMemory.audioUrl}
                preload="metadata"
              />
            )}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="timeline-instructions">
        <span>Drag to explore • Scroll to zoom • Click memories to play</span>
      </div>
    </div>
  )
}

export default Build
