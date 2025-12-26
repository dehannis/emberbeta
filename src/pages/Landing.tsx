import React, { useRef, useEffect } from 'react'
import Header from '../components/Header'
import Options from '../components/Options'
import Footer from '../components/Footer'

const Landing: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const root = document.getElementById('root')
    const video = videoRef.current
    
    if (!video || !root) return
    
    // Set playback rate after video metadata loads
    const setPlaybackRate = () => {
      video.playbackRate = 0.8
    }
    
    // Ensure root is transparent (CSS should handle this, but ensure it as backup)
    const ensureRootTransparent = () => {
      // Only set if not already transparent (don't override CSS)
      if (root.style.backgroundColor && root.style.backgroundColor !== 'transparent') {
        root.style.backgroundColor = 'transparent'
      }
    }
    
    // Ensure video plays
    const ensurePlay = async () => {
      try {
        await video.play()
        ensureRootTransparent()
      } catch (error) {
        console.warn('Video autoplay failed:', error)
        ensureRootTransparent()
      }
    }
    
    if (video.readyState >= 2) {
      // Video metadata already loaded
      setPlaybackRate()
      ensurePlay()
    } else {
      // Wait for metadata to load
      video.addEventListener('loadedmetadata', () => {
        setPlaybackRate()
      }, { once: true })
      
      // Wait for video to be ready to play
      video.addEventListener('canplay', () => {
        ensurePlay()
      }, { once: true })
      
      // Fallback: ensure transparent after a short delay
      const fallbackTimer = setTimeout(() => {
        ensureRootTransparent()
      }, 500)
      
      return () => {
        clearTimeout(fallbackTimer)
        video.removeEventListener('loadedmetadata', setPlaybackRate)
      }
    }
    
    return () => {
      // Restore dark background immediately when component unmounts
      // This prevents white flash when navigating away from landing page
      if (root) {
        root.style.backgroundColor = 'var(--black)'
      }
    }
  }, [])

  return (
    <>
      <video
        ref={videoRef}
        className="landing-video"
        autoPlay
        loop
        muted
        playsInline
        src="/ember_orange_blue_animated.mp4"
      />
      <div className="container landing-container">
        <Header />
        <main className="main-content landing-main">
          <Options />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Landing
