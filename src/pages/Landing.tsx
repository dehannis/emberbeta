import React, { useRef, useEffect } from 'react'
import Header from '../components/Header'
import Options from '../components/Options'
import Footer from '../components/Footer'

const Landing: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Set playback rate after video metadata loads
      const setPlaybackRate = () => {
        video.playbackRate = 0.8
      }
      
      // Ensure video plays
      const ensurePlay = async () => {
        try {
          await video.play()
        } catch (error) {
          console.warn('Video autoplay failed:', error)
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
          ensurePlay()
        }, { once: true })
      }
      
      // Also try to play on canplay event
      video.addEventListener('canplay', ensurePlay, { once: true })
      
      return () => {
        video.removeEventListener('loadedmetadata', setPlaybackRate)
        video.removeEventListener('canplay', ensurePlay)
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
