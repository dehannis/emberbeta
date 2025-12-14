import React, { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './VideoLanding.css'

const VideoLanding: React.FC = () => {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.play().catch((error) => {
      console.log('Video autoplay prevented:', error)
    })
  }, [])

  const handleVideoClick = () => {
    navigate('/')
  }

  return (
    <div className="video-landing-container">
      <video
        ref={videoRef}
        className="landing-video"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/landing-video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="video-overlay" onClick={handleVideoClick} />
    </div>
  )
}

export default VideoLanding
