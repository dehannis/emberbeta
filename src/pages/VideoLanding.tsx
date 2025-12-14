import React, { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './VideoLanding.css'

const VideoLanding: React.FC = () => {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)

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

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.trim()) {
      setShowVerification(true)
      // In production, this would trigger sending the verification code
    }
  }

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (verificationCode.trim()) {
      // In production, this would verify the code
      // For now, navigate to home page
      navigate('/')
    }
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Only numbers
    if (value.length <= 10) {
      setPhoneNumber(value)
    }
  }

  const handleVerificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // Only numbers
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
      <video
        ref={videoRef}
        className="landing-video"
        autoPlay
        muted
        playsInline
      >
        <source src="/landing-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {videoEnded && (
        <div className="auth-overlay">
          <div className="auth-content">
            {!showVerification ? (
              <form onSubmit={handlePhoneSubmit} className="auth-form">
                <p className="auth-disclosure">
                  Ember is currently invitation only. If you have an account, please add your phone number to enter. Otherwise, please add your phone number to join the wait list.
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
    </div>
  )
}

export default VideoLanding
