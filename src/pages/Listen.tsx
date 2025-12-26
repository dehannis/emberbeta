import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import './Listen.css'

// ============================================
// Types
// ============================================

interface Recording {
  id: string
  audioUrl: string
  transcript: string
  duration: number // seconds
  creatorId: string
  creatorName: string
  observations: Observation[]
  entities: Entity[]
  imageUrl: string
  title: string
  date: Date
  year: number
}

interface Observation {
  id: string
  startTime: number // seconds
  endTime: number // seconds
  memoryDate: Date
  content: string
  confidence: number
}

interface Entity {
  id: string
  name: string
  type: 'person' | 'place' | 'event' | 'period' | 'theme'
  mentions: EntityMention[]
}

interface EntityMention {
  startTime: number
  endTime: number
  text: string
}

interface TranscriptLine {
  text: string
  startTime: number
  endTime: number
  fontSize: number
  opacity: number
  padding: number
  translateY: number
  translateZ: number
  scale: number
}

// ============================================
// Sample Data (Mock - replace with API call)
// ============================================

function generateMockRecording(recordingId: string): Recording {
  // Sample transcript with Korean + English
  const transcript = `the first time dad farted, the smell was terrible horrible. I have never been so... dis disgusting in my life before But  you are WORSE. It was so smelly 지독해 지독해... 어떡해... One time I went to the doctor to see if there was a cure 야채를 많이 안먹어서 그런가? When I die and go to Heaven, Please God no more farts from Chae Family. No more! I cannot smell flowers anymore. My nose has been over the many many years But you know who in our family had really bad gas? 외삼촌. He was`

  return {
    id: recordingId,
    audioUrl: '/ember_purple_animated.mp4', // Using existing video file for testing (has audio track)
    transcript,
    duration: 339, // 5:39 in seconds
    creatorId: 'mom',
    creatorName: 'Mom',
    imageUrl: '/stock/1.webp',
    title: 'almost',
    date: new Date(2025, 11, 3), // December 3, 2025
    year: 2025,
    observations: [
      {
        id: 'obs-1',
        startTime: 36,
        endTime: 120,
        memoryDate: new Date(2025, 11, 3),
        content: 'Memory about dad farting',
        confidence: 0.9,
      },
      {
        id: 'obs-2',
        startTime: 180,
        endTime: 250,
        memoryDate: new Date(2025, 11, 3),
        content: 'Memory about going to doctor',
        confidence: 0.85,
      },
    ],
    entities: [
      {
        id: 'entity-1',
        name: '외삼촌',
        type: 'person',
        mentions: [
          {
            startTime: 300,
            endTime: 320,
            text: '외삼촌. He was',
          },
        ],
      },
    ],
  }
}

// ============================================
// Transcript Parsing Utility
// ============================================

/**
 * Parse transcript text into lines with estimated timestamps
 * Uses sentence-based splitting with character-count estimation
 * Handles Korean + English mixed text
 */
function parseTranscript(transcript: string, duration: number): TranscriptLine[] {
  // Split by sentences (period, exclamation, question mark, Korean period)
  // Also handle ellipsis and multiple spaces
  const sentenceEnders = /([.!?。]\s+|\.{2,}\s+)/g
  const parts = transcript.split(sentenceEnders)
  
  // Combine parts back into sentences
  const lines: string[] = []
  let currentLine = ''
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim()
    if (!part) continue
    
    // If it's a sentence ender, add to current line and push
    if (/^[.!?。]+$/.test(part) || part.match(/\.{2,}/)) {
      currentLine += part
      if (currentLine.trim()) {
        lines.push(currentLine.trim())
        currentLine = ''
      }
    } else {
      currentLine += (currentLine ? ' ' : '') + part
    }
  }
  
  // Add remaining line if any
  if (currentLine.trim()) {
    lines.push(currentLine.trim())
  }

  // If no lines were created, split by commas or create single line
  if (lines.length === 0) {
    lines.push(transcript)
  }

  // Calculate timestamps based on character count
  const totalChars = transcript.length
  const charsPerSecond = totalChars / duration

  const transcriptLines: TranscriptLine[] = []
  let currentCharCount = 0

  lines.forEach((line) => {
    const lineChars = line.length
    const startTime = currentCharCount / charsPerSecond
    const endTime = (currentCharCount + lineChars) / charsPerSecond

    transcriptLines.push({
      text: line,
      startTime,
      endTime,
      fontSize: 11, // Will be calculated dynamically
      opacity: 0.3, // Will be calculated dynamically
      padding: 0, // Will be calculated dynamically
      translateY: 0, // Will be calculated dynamically
      translateZ: 0, // Will be calculated dynamically
      scale: 1, // Will be calculated dynamically
    })

    currentCharCount += lineChars
  })

  return transcriptLines
}

// ============================================
// Format Time Utility
// ============================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// ============================================
// Format Date Utility
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

// ============================================
// Creator Name Display Component
// ============================================

interface CreatorNameProps {
  name: string
}

const CreatorName: React.FC<CreatorNameProps> = ({ name }) => {
  return (
    <div className="listen-creator-name">
      <p>{name}</p>
    </div>
  )
}

// ============================================
// Transcript Scroll Component
// ============================================

interface TranscriptScrollProps {
  lines: TranscriptLine[]
  currentTime: number
  isPlaying: boolean
}

const TranscriptScroll: React.FC<TranscriptScrollProps> = ({
  lines,
  currentTime,
  isPlaying,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number>()
  const smoothTimeRef = useRef<number>(currentTime)
  const lastUpdateTimeRef = useRef<number>(performance.now())
  const [, forceUpdate] = useState(0) // Force re-render trigger

  // Smooth interpolation of currentTime for 60fps updates
  useEffect(() => {
    if (!isPlaying) {
      smoothTimeRef.current = currentTime
      return
    }

    const animate = () => {
      const now = performance.now()
      const deltaTime = (now - lastUpdateTimeRef.current) / 1000 // Convert to seconds
      lastUpdateTimeRef.current = now

      // Smoothly interpolate towards the actual currentTime
      // This creates consistent movement even when timeupdate events are irregular
      const timeDiff = currentTime - smoothTimeRef.current
      const smoothingFactor = Math.min(1, deltaTime * 10) // Smooth interpolation rate
      smoothTimeRef.current += timeDiff * smoothingFactor

      // Force re-render for smooth 60fps animation
      forceUpdate(prev => prev + 1)
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    lastUpdateTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, currentTime])

  // Calculate line states based on smooth interpolated time
  const updatedLines = useMemo(() => {
    const SCROLL_SPEED = 50 // pixels per second - consistent speed throughout
    const DEPTH_FACTOR = 0.5 // how much depth per scroll unit
    const PERSPECTIVE_DISTANCE = 1000
    
    // Font size constants - match header sizes
    const INITIAL_FONT_SIZE = 34 // Match "almost" (32px) and "2025" (36px) - use 34px as middle ground
    const MIN_FONT_SIZE = 18 // Minimum size when near header
    const HEADER_DISTANCE = 120 // pixels from header where size should be minimum

    // Use smooth interpolated time for consistent movement
    const smoothTime = smoothTimeRef.current
    const scrollY = smoothTime * SCROLL_SPEED

    return lines.map((line, index) => {
      // Calculate translateY (upward scroll) - linear, consistent movement
      const lineSpacing = 100 // pixels between lines
      const containerCenter = 0 // Start from top of container
      const lineStartY = containerCenter + (index * lineSpacing)
      const translateY = lineStartY - scrollY

      // Calculate distance from header (top of container)
      const distanceFromHeader = Math.max(0, translateY)
      
      // Calculate font size - large initially, shrinks as it approaches header
      // Use smooth easing function for continuous transition
      const headerProgress = Math.min(1, distanceFromHeader / HEADER_DISTANCE)
      // Ease-out cubic for smooth deceleration
      const easedProgress = 1 - Math.pow(1 - headerProgress, 3)
      const fontSize = MIN_FONT_SIZE + (easedProgress * (INITIAL_FONT_SIZE - MIN_FONT_SIZE))

      // Calculate opacity based on font size - larger font = whiter, smaller font = more translucent
      // Map font size (MIN_FONT_SIZE to INITIAL_FONT_SIZE) to opacity (0.3 to 1.0)
      const fontSizeRange = INITIAL_FONT_SIZE - MIN_FONT_SIZE
      const fontSizeProgress = (fontSize - MIN_FONT_SIZE) / fontSizeRange
      const opacity = 0.3 + (fontSizeProgress * 0.7) // Smooth from 0.3 to 1.0 based on font size

      // Calculate padding (0px to 8px) - smoother transition
      const padding = easedProgress * 8

      // Calculate 3D depth - linear with scroll
      const translateZ = -scrollY * DEPTH_FACTOR

      // Calculate scale based on depth
      const scale = 1 + (translateZ / PERSPECTIVE_DISTANCE)
      const clampedScale = Math.max(0.3, Math.min(1.5, scale))

      return {
        ...line,
        fontSize,
        opacity,
        padding,
        translateY,
        translateZ,
        scale: clampedScale,
      }
    })
  }, [lines, currentTime, isPlaying]) // Recalculate when currentTime or playing state changes

  return (
    <div className="listen-transcript-container" ref={containerRef}>
      <div className="listen-transcript-scroll">
        {updatedLines.map((line, index) => {
          // Only render visible lines (performance optimization)
          // Lines that have scrolled too far up or haven't appeared yet
          if (line.translateY < -200 || line.translateY > window.innerHeight + 200) {
            return null
          }

          return (
            <div
              key={`line-${index}-${line.startTime}`}
              className="listen-transcript-line"
              style={{
                opacity: line.opacity,
                fontSize: `${line.fontSize}px`,
                paddingTop: `${line.padding}px`,
                paddingBottom: `${line.padding}px`,
                transform: `translateX(-50%) translateY(${line.translateY}px) translateZ(${line.translateZ}px) scale(${line.scale})`,
                /* Transform updates are immediate (no transition) for smooth 60fps movement */
              }}
            >
              {line.text}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Album Cover Component
// ============================================

interface AlbumCoverProps {
  imageUrl: string
}

const AlbumCover: React.FC<AlbumCoverProps> = ({ imageUrl }) => {
  // Figma mask SVG for faded edges
  const imgCardImagePlaceholder = "http://localhost:3845/assets/bb9aa03bf552cdf224b7eef7ec4d5def6db0d8ae.svg"
  
  return (
    <div className="listen-album-cover">
      <div className="listen-album-cover__container">
        <div 
          className="listen-album-cover__mask"
          style={{ maskImage: `url('${imgCardImagePlaceholder}')` }}
        >
          <div className="listen-album-cover__image-wrapper">
            <img src={imageUrl} alt="Memory" className="listen-album-cover__image" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Memory Info Component (Entity/Title/Date/Year)
// ============================================

interface MemoryInfoProps {
  entityName: string | null
  title: string
  date: Date
  year: number
  onEntityClick: () => void
  onYearClick: () => void
}

const MemoryInfo: React.FC<MemoryInfoProps> = ({
  entityName,
  title,
  date,
  year,
  onEntityClick,
  onYearClick,
}) => {
  return (
    <div className="listen-memory-info">
      <div className="listen-memory-info__entity-wrapper">
        {entityName ? (
          <button
            className="listen-memory-info__entity"
            onClick={onEntityClick}
          >
            {entityName}
          </button>
        ) : (
          <div className="listen-memory-info__entity-placeholder" />
        )}
      </div>
      <div className="listen-memory-info__center">
        <p className="listen-memory-info__title">{title}</p>
        <p className="listen-memory-info__date">{formatDate(date)}</p>
      </div>
      <div className="listen-memory-info__year-wrapper">
        <button
          className="listen-memory-info__year"
          onClick={onYearClick}
        >
          {year}
        </button>
      </div>
    </div>
  )
}

// ============================================
// Progress Bar Component
// ============================================

interface ProgressBarProps {
  currentTime: number
  duration: number
  observations: Observation[]
  onSeek: (time: number) => void
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  observations,
  onSeek,
}) => {
  const progressRef = useRef<HTMLDivElement>(null)
  const imgBar = "http://localhost:3845/assets/3ee11a2a1d85996b4ea7991243b7768e46176ef0.svg"

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return

    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = clickX / rect.width
    const newTime = percent * duration
    onSeek(newTime)
  }

  return (
    <div className="listen-progress-container">
      <div className="listen-progress-bar-wrapper" ref={progressRef} onClick={handleClick}>
        <div className="listen-progress-bar">
          {/* Figma bar image */}
          <div className="listen-progress-bar-image">
            <img alt="" src={imgBar} className="listen-progress-bar-img" />
          </div>
          {/* Observation highlights overlay */}
          <div className="listen-progress-observations">
            {observations.map((obs) => {
              const leftPercent = (obs.startTime / duration) * 100
              const widthPercent = ((obs.endTime - obs.startTime) / duration) * 100
              return (
                <div
                  key={obs.id}
                  className="listen-progress-observation"
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                  }}
                />
              )
            })}
          </div>
          {/* Progress indicator (filled portion) */}
          <div
            className="listen-progress-indicator"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
      <div className="listen-progress-times">
        <p className="listen-progress-time-start">{formatTime(currentTime)}</p>
        <p className="listen-progress-time-end">{formatTime(duration)}</p>
      </div>
    </div>
  )
}

// ============================================
// Audio Controls Component
// ============================================

interface AudioControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onPrevious: () => void
  onNext: () => void
  onShuffle: () => void
  onLike: () => void
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  onShuffle,
  onLike,
}) => {
  // Figma image assets - using local fallback for shuffle, Figma URLs for others
  const imgShuffle = "/icons/shuffle.svg" // Local fallback since Figma Desktop may not be running
  const imgLike = "http://localhost:3845/assets/449cc0f9e7966f26a84b9ce2f0e616c8216a2282.svg"
  const imgComponent = "http://localhost:3845/assets/8bf07ecc9ab15cec5fbc3956b3dd7a8fffac9d4b.svg"
  const imgPreviousButton = "http://localhost:3845/assets/3f76741806f4d5c041d4dfd724d0d94c9d2c3f02.svg"
  const imgNextButton = "http://localhost:3845/assets/88ae6eadc92ce45f712d9f1aed0f07a62065c34a.svg"
  const imgPlayButton = "http://localhost:3845/assets/be095b3dd39d4135d081ffd9199e17a22a86f059.svg"

  return (
    <div className="listen-audio-controls">
      <div className="listen-control-wrapper listen-control-wrapper--shuffle">
        <div className="listen-control-icon-wrapper listen-control-icon-wrapper--shuffle">
          <button className="listen-control-btn listen-control-btn--shuffle" onClick={onShuffle}>
            <img src={imgShuffle} alt="Shuffle" className="listen-control-icon" />
          </button>
        </div>
      </div>
      <div className="listen-control-icon-wrapper listen-control-icon-wrapper--prev">
        <button className="listen-control-btn listen-control-btn--prev" onClick={onPrevious}>
          <img src={imgPreviousButton} alt="Previous" className="listen-control-icon" />
        </button>
      </div>
      <div className="listen-control-wrapper listen-control-wrapper--play-pause">
        <div className="listen-control-icon-wrapper listen-control-icon-wrapper--play-pause">
          <button className="listen-control-btn listen-control-btn--play-pause" onClick={onPlayPause}>
            <img 
              src={isPlaying ? imgComponent : imgPlayButton} 
              alt={isPlaying ? "Pause" : "Play"} 
              className="listen-control-icon" 
            />
          </button>
        </div>
      </div>
      <div className="listen-control-icon-wrapper listen-control-icon-wrapper--next">
        <button className="listen-control-btn listen-control-btn--next" onClick={onNext}>
          <img src={imgNextButton} alt="Next" className="listen-control-icon" />
        </button>
      </div>
      <div className="listen-control-wrapper listen-control-wrapper--like">
        <div className="listen-control-icon-wrapper listen-control-icon-wrapper--like">
          <button className="listen-control-btn listen-control-btn--like" onClick={onLike}>
            <img src={imgLike} alt="Like" className="listen-control-icon" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Main Listen Component
// ============================================

const Listen: React.FC = () => {
  const { recordingId } = useParams<{ recordingId: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  const [recording, setRecording] = useState<Recording | null>(null)
  const [isFadingIn, setIsFadingIn] = useState(false)
  const [transcriptLines, setTranscriptLines] = useState<TranscriptLine[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentEntity, setCurrentEntity] = useState<string | null>(null)
  const [_currentObservation, setCurrentObservation] = useState<Observation | null>(null)

  const audioElRef = useRef<HTMLAudioElement | null>(null)
  const pageContainerRef = useRef<HTMLDivElement | null>(null)

  // Ensure audio element exists (pattern from people/store.tsx)
  const ensureAudio = useCallback(() => {
    if (!audioElRef.current) {
      audioElRef.current = new Audio()
    }
    return audioElRef.current
  }, [])

  // Set up audio event listeners (pattern from people/store.tsx)
  useEffect(() => {
    const a = ensureAudio()
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onEnded = () => setIsPlaying(false)
    const onTimeUpdate = () => {
      if (a.currentTime !== undefined) {
        setCurrentTime(a.currentTime)
        
        // Update current observation
        if (recording) {
          const obs = recording.observations.find(
            o => a.currentTime >= o.startTime && a.currentTime <= o.endTime
          )
          setCurrentObservation(obs || null)

          // Update current entity
          const entity = recording.entities.find(e =>
            e.mentions.some(m => a.currentTime >= m.startTime && a.currentTime <= m.endTime)
          )
          setCurrentEntity(entity?.name || null)
        }
      }
    }
    const onLoadedMetadata = () => {
      if (a.duration !== undefined && !isNaN(a.duration)) {
        setDuration(a.duration)
      }
    }

    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    a.addEventListener('ended', onEnded)
    a.addEventListener('timeupdate', onTimeUpdate)
    a.addEventListener('loadedmetadata', onLoadedMetadata)

    return () => {
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      a.removeEventListener('ended', onEnded)
      a.removeEventListener('timeupdate', onTimeUpdate)
      a.removeEventListener('loadedmetadata', onLoadedMetadata)
    }
  }, [ensureAudio, recording])

  // Load recording data
  useEffect(() => {
    if (!recordingId) return

    // Mock data - replace with API call
    const mockRecording = generateMockRecording(recordingId)
    setRecording(mockRecording)

    // Parse transcript
    const lines = parseTranscript(mockRecording.transcript, mockRecording.duration)
    setTranscriptLines(lines)
    setDuration(mockRecording.duration)

    // Set audio source (pattern from BuildSwipeExperience.tsx)
    const a = ensureAudio()
    if (a.src !== mockRecording.audioUrl) {
      a.src = mockRecording.audioUrl
      a.load() // Explicitly load the new source
    }
    
    // Try to load metadata
    const loadMetadata = () => {
      if (a.duration && !isNaN(a.duration) && a.duration > 0) {
        setDuration(a.duration)
      }
    }
    
    if (a.readyState >= 1) {
      loadMetadata()
    } else {
      a.addEventListener('loadedmetadata', loadMetadata, { once: true })
    }
  }, [recordingId, ensureAudio])

  // Control handlers (pattern from BuildSwipeExperience.tsx)
  const handlePlayPause = useCallback(() => {
    const a = ensureAudio()
    if (!a.src) {
      // Set source if not set
      if (recording) {
        a.src = recording.audioUrl
      }
    }
    
    if (a.paused) {
      const playPromise = a.play()
      if (playPromise && typeof (playPromise as any).catch === 'function') {
        (playPromise as Promise<void>).catch((err) => {
          console.warn('Audio play failed:', err)
          // autoplay blocked; user can press play again
        })
      }
    } else {
      a.pause()
    }
  }, [ensureAudio, recording])

  const handleSeek = useCallback((time: number) => {
    const a = ensureAudio()
    try {
      a.currentTime = time
      setCurrentTime(time)
    } catch {
      // ignore seek errors
    }
  }, [ensureAudio])

  const handlePrevious = useCallback(() => {
    if (!recording) return

    // Find previous observation
    const sortedObs = [...recording.observations].sort((a, b) => a.startTime - b.startTime)
    const prevObs = sortedObs
      .reverse()
      .find(obs => obs.endTime < currentTime)

    if (prevObs) {
      handleSeek(prevObs.startTime)
    } else if (sortedObs.length > 0) {
      // If no previous, go to first
      handleSeek(sortedObs[0].startTime)
    }
  }, [recording, currentTime, handleSeek])

  const handleNext = useCallback(() => {
    if (!recording) return

    // Find next observation
    const sortedObs = [...recording.observations].sort((a, b) => a.startTime - b.startTime)
    const nextObs = sortedObs.find(obs => obs.startTime > currentTime)

    if (nextObs) {
      handleSeek(nextObs.startTime)
    } else if (sortedObs.length > 0) {
      // If no next, loop to first
      handleSeek(sortedObs[0].startTime)
    }
  }, [recording, currentTime, handleSeek])

  const handleShuffle = useCallback(() => {
    // TODO: Implement shuffle to random observation outside session
    // For now, just shuffle within current recording
    if (!recording || recording.observations.length === 0) return

    const randomObs = recording.observations[
      Math.floor(Math.random() * recording.observations.length)
    ]
    handleSeek(randomObs.startTime)
  }, [recording, handleSeek])

  const handleLike = useCallback(() => {
    // TODO: Implement like functionality
    console.log('Like clicked')
  }, [])

  const handleEntityClick = useCallback(() => {
    if (!currentEntity || !recording) return
    // Navigate to /remember with person filter
    navigate(`/remember?person=${currentEntity}`)
  }, [currentEntity, navigate])

  const handleYearClick = useCallback(() => {
    if (!recording) return
    // Navigate to /remember with creator + year
    navigate(`/remember?creator=${recording.creatorId}&year=${recording.year}`)
  }, [recording, navigate])

  // Handle fade-in transition when coming from remember page
  useEffect(() => {
    const fromRemember = (location.state as any)?.fromRemember
    if (fromRemember && recording) {
      // Start fade-in after 0.5s delay (matching remember fade-out)
      const timer = setTimeout(() => {
        setIsFadingIn(true)
      }, 500)
      return () => clearTimeout(timer)
    } else if (recording) {
      // If not from remember, fade in immediately
      setIsFadingIn(true)
    }
  }, [recording, location.state])

  // Force layout recalculation on mount to prevent button clipping issues
  useEffect(() => {
    if (!recording) return
    
    // Use requestAnimationFrame to ensure layout is calculated after render
    const timer = requestAnimationFrame(() => {
      // Force a reflow to ensure buttons are properly laid out
      // This helps browsers that calculate layout before images/assets load
      if (pageContainerRef.current) {
        void pageContainerRef.current.offsetHeight
      }
    })
    return () => cancelAnimationFrame(timer)
  }, [recording])

  if (!recording) {
    return <div>Loading...</div>
  }

  return (
    <>
      <img
        className="listen-background"
        src="/stock/ember_purple.png"
        alt=""
        aria-hidden="true"
      />
      <div className={`listen-page ${isFadingIn ? 'listen-page--fading-in' : 'listen-page--hidden'}`} ref={pageContainerRef}>
        <Header />

        <CreatorName name={recording.creatorName} />

        <main className="listen-main">
          <TranscriptScroll
            lines={transcriptLines}
            currentTime={currentTime}
            isPlaying={isPlaying}
          />

          <AlbumCover imageUrl={recording.imageUrl} />

          <div className="listen-memory-info-wrapper">
            <MemoryInfo
              entityName={currentEntity}
              title={recording.title}
              date={recording.date}
              year={recording.year}
              onEntityClick={handleEntityClick}
              onYearClick={handleYearClick}
            />
          </div>

          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            observations={recording.observations}
            onSeek={handleSeek}
          />

          <AudioControls
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onShuffle={handleShuffle}
            onLike={handleLike}
          />
        </main>

        <Footer />
      </div>
    </>
  )
}

export default Listen

