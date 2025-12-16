import React, { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './VideoLanding.css'

const VideoLanding: React.FC = () => {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const postVerificationVideoRef = useRef<HTMLVideoElement>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [showPostVerificationVideo, setShowPostVerificationVideo] = useState(false)
  const [showFade, setShowFade] = useState(false)
  const [showConnecting, setShowConnecting] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  // Initial landing video
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.play().catch((error) => {
      console.log('Video autoplay prevented:', error)
    })

    const handleEnded = () => {
      setVideoEnded(true)
    }

    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Post-verification video is preloaded via keeping the element in the DOM + preload="auto".

  // Post-verification video event handlers
  useEffect(() => {
    if (!showPostVerificationVideo) return

    const video = postVerificationVideoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime) {
        const timeRemaining = video.duration - video.currentTime
        // Start fade 0.5 seconds before video ends
        if (timeRemaining <= 0.5 && !showFade) {
          setShowFade(true)
        }
      }
    }

    const handleEnded = () => {
      // Set flag to indicate coming from verification (for Talk page orb color)
      sessionStorage.setItem('emberFromVerification', 'true')
      
      // Show connecting screen and start typewriter effect
      setShowConnecting(true)
      
      const fullText = 'CONNECTING TO EMBER...'
      let currentIndex = 0
      
      // Typewriter effect with varying speed for natural feel
      const typeNextChar = () => {
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex + 1))
          currentIndex++
          
          // Vary timing for natural typing feel
          const char = fullText[currentIndex - 1]
          let delay = 45 + Math.random() * 35 // Base 45-80ms
          
          // Slight pause after spaces and before dots
          if (char === ' ') delay = 80 + Math.random() * 40
          if (char === '.') delay = 120 + Math.random() * 40
          
          setTimeout(typeNextChar, delay)
        } else {
          // Text complete - pause to suggest loading, then navigate
          setTimeout(() => {
            setShowCursor(false)
            setTimeout(() => {
              navigate('/talk')
            }, 800)
          }, 1200)
        }
      }
      
      // Start typing after brief pause
      setTimeout(typeNextChar, 250)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [showPostVerificationVideo, navigate, showFade])

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.trim()) {
      setShowVerification(true)
    }
  }

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (verificationCode.trim()) {
      // Start playing post-verification video immediately
      const postVideo = postVerificationVideoRef.current
      if (postVideo) {
        postVideo.play().catch((error) => {
          console.log('Post-verification video autoplay prevented:', error)
        })
      }
      setShowPostVerificationVideo(true)
      setVideoEnded(false)
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 10) {
      setPhoneNumber(value)
    }
  }

  const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 6) {
      setVerificationCode(value)
    }
  }

  const formatPhoneNumber = (value: string) => {
    if (value.length === 0) return ''
    if (value.length <= 3) return `(${value}`
    if (value.length <= 6) return `(${value.slice(0, 3)}) ${value.slice(3)}`
    return `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`
  }

  return (
    <div className="video-landing-container">
      {/* Initial landing video */}
      <video
        ref={videoRef}
        className={`landing-video ${showPostVerificationVideo ? 'hidden' : ''}`}
        autoPlay
        muted
        playsInline
      >
        <source src="/landing-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Post-verification video - always in DOM for preloading */}
      <video
        ref={postVerificationVideoRef}
        className={`landing-video ${showPostVerificationVideo ? '' : 'hidden'}`}
        muted
        playsInline
        preload="auto"
      >
        <source src="/post-verification-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Auth overlay */}
      {videoEnded && !showPostVerificationVideo && (
        <div className="auth-overlay">
          <div className="auth-content">
            {!showVerification ? (
              <form onSubmit={handlePhoneSubmit} className="auth-form">
                <p className="auth-disclosure">
                  Ember is currently invitation only. If you have an account, verify your phone number to enter. Otherwise, add your phone number to join our waitlist.
                </p>
                <label htmlFor="phone" className="auth-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formatPhoneNumber(phoneNumber)}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  className="auth-input"
                  autoFocus
                />
                <button 
                  type="submit" 
                  className="auth-button"
                  disabled={phoneNumber.length < 10}
                >
                  Continue
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerificationSubmit} className="auth-form">
                <label htmlFor="code" className="auth-label">
                  Verification Code
                </label>
                <p className="auth-description">
                  Enter the code sent to {formatPhoneNumber(phoneNumber)}
                </p>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={handleVerificationChange}
                  placeholder="123456"
                  className="auth-input"
                  maxLength={6}
                  autoFocus
                />
                <button 
                  type="submit" 
                  className="auth-button"
                  disabled={verificationCode.length < 6}
                >
                  Verify
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Fade overlay */}
      {showFade && (
        <div className="fade-overlay" />
      )}

      {/* Connecting transition */}
      {showConnecting && (
        <div className="connecting-screen">
          <div className="connecting-content">
            <span className="connecting-text">{displayedText}</span>
            <span className={`cursor ${showCursor ? 'visible' : ''}`}>|</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoLanding
