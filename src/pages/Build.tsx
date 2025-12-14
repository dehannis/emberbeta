import React, { useState, useRef, useEffect } from 'react'
import Header from '../components/Header'
import './Build.css'

interface Conversation {
  id: number
  title: string
  date: string
  duration: string
  preview: string
  audioUrl?: string
}

const Build: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const [conversations] = useState<Conversation[]>([
    {
      id: 1,
      title: 'Morning Reflection',
      date: 'March 15, 2024',
      duration: '12:34',
      preview: 'A quiet moment to reflect on the week ahead...',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    {
      id: 2,
      title: 'Family Memories',
      date: 'March 10, 2024',
      duration: '8:21',
      preview: 'Sharing stories about growing up together...',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    },
    {
      id: 3,
      title: 'Gratitude Practice',
      date: 'March 5, 2024',
      duration: '5:47',
      preview: 'Today I am grateful for the simple moments...',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    },
  ])

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

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
  }, [selectedConversation])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.play().catch(console.error)
    } else {
      audio.pause()
    }
  }, [isPlaying, selectedConversation])

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    setIsPlaying(true)
  }

  const handleClosePlayer = () => {
    setIsPlaying(false)
    setSelectedConversation(null)
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

  const formatDate = (dateString: string): string => {
    return dateString
  }

  return (
    <div className="container">
      <Header />
      <main className="main-content build-content">
        <div className="build-container">
          <h1 className="build-title">Build</h1>
          
          {conversations.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No conversations yet</p>
              <p className="empty-state-subtext">Start building your memory timeline</p>
            </div>
          ) : (
            <div className="conversations-timeline">
              {conversations.map((conversation, index) => (
                <div
                  key={conversation.id}
                  className="conversation-item"
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <h3 className="conversation-title">{conversation.title}</h3>
                      <span className="conversation-duration">{conversation.duration}</span>
                    </div>
                    <p className="conversation-date">{formatDate(conversation.date)}</p>
                    <p className="conversation-preview">{conversation.preview}</p>
                  </div>
                  <div className="conversation-indicator">
                    <div className="timeline-dot"></div>
                    {index < conversations.length - 1 && (
                      <div className="timeline-line"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedConversation && (
        <div className="audio-player-overlay" onClick={handleClosePlayer}>
          <div className="audio-player" onClick={(e) => e.stopPropagation()}>
            <div className="player-header">
              <button className="player-close" onClick={handleClosePlayer}>
                ×
              </button>
            </div>
            <div className="player-content">
              <h2 className="player-title">{selectedConversation.title}</h2>
              <p className="player-date">{selectedConversation.date}</p>
            </div>
            <div className="player-controls">
              <button className="play-pause-button" onClick={handlePlayPause}>
                {isPlaying ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5 3 19 12 5 21" />
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
            {selectedConversation.audioUrl && (
              <audio
                ref={audioRef}
                src={selectedConversation.audioUrl}
                preload="metadata"
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Build

