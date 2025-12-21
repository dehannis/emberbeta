import React from 'react'
import Header from '../components/Header'
import Options from '../components/Options'
import Footer from '../components/Footer'

const Landing: React.FC = () => {
  return (
    <div className="container landing-container">
      <Header />
      <main className="main-content landing-main">
        <Options />
      </main>
      <Footer />
    </div>
  )
}

export default Landing
