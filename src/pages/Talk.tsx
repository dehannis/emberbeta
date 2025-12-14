import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './Talk.css'

const colorSchemes = [
  { name: 'blue', primary: '140, 200, 255', secondary: '100, 180, 255' }, // Light blue (default)
  { name: 'orange', primary: '255, 180, 120', secondary: '255, 150, 100' }, // Warm orange
  { name: 'green', primary: '150, 220, 150', secondary: '120, 200, 120' }, // Warm green
  { name: 'red', primary: '255, 140, 140', secondary: '255, 120, 120' }, // Warm red
  { name: 'yellow', primary: '255, 220, 140', secondary: '255, 200, 120' }, // Warm yellow
  { name: 'purple', primary: '220, 180, 255', secondary: '200, 160, 255' }, // Warm purple
  { name: 'white', primary: '255, 255, 255', secondary: '240, 240, 240' }, // White
  { name: 'klein', primary: '0, 47, 167', secondary: '0, 35, 150' }, // Yves Klein Blue
]

const Talk: React.FC = () => {
  const navigate = useNavigate()
  const [isEntering, setIsEntering] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  
  // Initialize color index from localStorage or default to 0
  const getInitialColorIndex = () => {
    const savedColorIndex = localStorage.getItem('emberTalkOrbColor')
    if (savedColorIndex !== null) {
      const index = parseInt(savedColorIndex, 10)
      if (index >= 0 && index < colorSchemes.length) {
        return index
      }
    }
    return 0
  }
  
  const [colorIndex, setColorIndex] = useState(getInitialColorIndex)
  const isInitialMount = useRef(true)

  const currentColor = colorSchemes[colorIndex]
  const [showExitOverlay, setShowExitOverlay] = useState(false)

  // Check if coming from verification and set to light blue
  useEffect(() => {
    const fromVerification = sessionStorage.getItem('emberFromVerification')
    if (fromVerification === 'true') {
      sessionStorage.removeItem('emberFromVerification')
      setColorIndex(0) // Light blue
      localStorage.setItem('emberTalkOrbColor', '0') // Also save it
    }
  }, [])

  // Save color index to localStorage whenever it changes (but not on initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    localStorage.setItem('emberTalkOrbColor', colorIndex.toString())
  }, [colorIndex])

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsEntering(false)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }

  const handleEndCall = () => {
    setShowExitOverlay(true)
  }

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowExitOverlay(true)
  }

  const handlePhoneClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowExitOverlay(true)
  }

  const handleSaveAndNext = () => {
    // Save logic here
    navigate('/build')
  }

  const handleDeleteAndRerecord = () => {
    // Delete logic here
    navigate('/')
  }

  const handleCancel = () => {
    setShowExitOverlay(false)
  }

  const handleOrbClick = () => {
    setColorIndex((prev) => (prev + 1) % colorSchemes.length)
  }

  return (
    <div className={`talk-container ${isEntering ? 'entering' : 'active'}`}>
      {/* Custom Header with intercepted clicks */}
      <header className="header">
        <span className="home-icon" onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
          ○
        </span>
      </header>

      {/* Circle */}
      <div className="circle-wrapper">
        <div 
          className={`circle ${isMuted ? 'muted' : ''}`}
          onClick={handleOrbClick}
          style={{
            cursor: 'pointer',
            '--color-primary': currentColor.primary,
            '--color-secondary': currentColor.secondary,
          } as React.CSSProperties}
        />
      </div>

      {/* Controls */}
      <div className="talk-controls">
        <button 
          className={`control-btn ${isMuted ? 'active' : ''}`} 
          onClick={handleMuteToggle}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>
        
        <button 
          className="control-btn end-btn" 
          onClick={handleEndCall}
          aria-label="End call"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
        </button>
      </div>

      {/* Exit Overlay */}
      {showExitOverlay && (
        <div className="exit-overlay" onClick={handleCancel}>
          <div className="exit-overlay-content" onClick={(e) => e.stopPropagation()}>
            <div className="exit-overlay-buttons">
              <button 
                className="exit-btn save-btn" 
                onClick={handleSaveAndNext}
              >
                Save & Next
              </button>
              <button 
                className="exit-btn delete-btn" 
                onClick={handleDeleteAndRerecord}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Talk
