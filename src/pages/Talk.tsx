import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Talk.css'

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking'

const colorSchemes = [
  { name: 'ember', primary: '255, 180, 120', secondary: '255, 140, 80' },
  { name: 'ocean', primary: '140, 200, 255', secondary: '100, 160, 255' },
  { name: 'aurora', primary: '180, 255, 200', secondary: '120, 220, 180' },
  { name: 'lavender', primary: '220, 180, 255', secondary: '180, 140, 255' },
  { name: 'rose', primary: '255, 180, 200', secondary: '255, 140, 170' },
]

const Talk: React.FC = () => {
  const navigate = useNavigate()
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [pulseIntensity, setPulseIntensity] = useState(0)
  const [isEntering, setIsEntering] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [colorIndex, setColorIndex] = useState(0)

  const currentColor = colorSchemes[colorIndex]

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  // Start listening after entrance
  useEffect(() => {
    if (!isEntering) {
      const timer = setTimeout(() => {
        setVoiceState('listening')
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [isEntering])

  // Simulate voice activity
  useEffect(() => {
    if ((voiceState === 'listening' || voiceState === 'speaking') && !isMuted) {
      const interval = setInterval(() => {
        setPulseIntensity(Math.random() * 0.5 + 0.5)
      }, 80)
      return () => clearInterval(interval)
    } else {
      setPulseIntensity(0.3)
    }
  }, [voiceState, isMuted])

  // Demo: cycle through states
  useEffect(() => {
    if (isMuted) return
    
    if (voiceState === 'listening') {
      const timer = setTimeout(() => {
        setVoiceState('processing')
      }, 5000)
      return () => clearTimeout(timer)
    }
    if (voiceState === 'processing') {
      const timer = setTimeout(() => {
        setVoiceState('speaking')
      }, 1500)
      return () => clearTimeout(timer)
    }
    if (voiceState === 'speaking') {
      const timer = setTimeout(() => {
        setVoiceState('listening')
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [voiceState, isMuted])

  const handleHomeClick = () => {
    navigate('/')
  }

  const handleOrbClick = () => {
    setColorIndex((prev) => (prev + 1) % colorSchemes.length)
  }

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleEndCall = () => {
    navigate('/')
  }

  return (
    <div 
      className={`talk-container ${isEntering ? 'entering' : 'active'}`}
      style={{
        '--color-primary': currentColor.primary,
        '--color-secondary': currentColor.secondary,
      } as React.CSSProperties}
    >
      {/* Fast fade entrance */}
      <div className="entrance-overlay" />

      {/* Header */}
      <header className="talk-header">
        <span className="talk-home-icon" onClick={handleHomeClick}>
          ○
        </span>
      </header>

      {/* Main content */}
      <main className="talk-main">
        {/* Orb */}
        <div className="orb-wrapper" onClick={handleOrbClick}>
          <div 
            className={`orb ${isMuted ? 'orb-muted' : `orb-${voiceState}`}`}
            style={{
              '--pulse': pulseIntensity,
            } as React.CSSProperties}
          >
            <div className="orb-glow" />
            <div className="orb-core" />
          </div>
        </div>

        {/* Controls */}
        <div className="talk-controls">
          <button 
            className={`control-button ${isMuted ? 'active' : ''}`} 
            onClick={handleMuteToggle}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                <span>Unmute</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                <span>Mute</span>
              </>
            )}
          </button>
          
          <button 
            className="control-button end-button" 
            onClick={handleEndCall}
            aria-label="End call"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              <line x1="23" y1="1" x2="17" y2="7" />
              <line x1="17" y1="1" x2="23" y2="7" />
            </svg>
            <span>End</span>
          </button>
        </div>
      </main>
    </div>
  )
}

export default Talk
