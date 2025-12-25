import React from 'react'
import Header from '../components/Header'
import Options from '../components/Options'
import Footer from '../components/Footer'

const Landing: React.FC = () => {
  return (
    <>
      <video
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
