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
      
      if (video.readyState >= 2) {
        // Video metadata already loaded
        setPlaybackRate()
      } else {
        // Wait for metadata to load
        video.addEventListener('loadedmetadata', setPlaybackRate, { once: true })
      }
      
      return () => {
        video.removeEventListener('loadedmetadata', setPlaybackRate)
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
