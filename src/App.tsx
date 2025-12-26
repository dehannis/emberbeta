import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Share from './pages/Share'
import Account from './pages/Account'
import Build from './pages/Build'
import Talk from './pages/Talk'
import VideoLanding from './pages/VideoLanding'
import Feed from './pages/Feed'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/share" element={<Share />} />
        <Route path="/account" element={<Account />} />
        <Route path="/build" element={<Build />} />
        <Route path="/talk" element={<Talk />} />
        <Route path="/video-landing" element={<VideoLanding />} />
      </Routes>
    </Router>
  )
}

export default App

