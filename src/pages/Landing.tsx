import React from 'react'
import Header from '../components/Header'
import Options from '../components/Options'
import Footer from '../components/Footer'

const Landing: React.FC = () => {
  return (
    <div className="container landing-container">
      <video
        className="landing-video"
        autoPlay
        loop
        muted
        playsInline
        src="/ember_orange_blue_animated.mp4"
      />
      <Header />
      <main className="main-content landing-main">
        <Options />
      </main>
      <Footer />
    </div>
  )
}

export default Landing
