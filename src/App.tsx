import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Accounts from './pages/Accounts'
import Remember from './pages/Remember'
import Talk from './pages/Talk'
import VideoLanding from './pages/VideoLanding'
import Play from './pages/Play'
import Topics from './pages/Topics'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/accounts" element={<Accounts />} />
        {/* Back-compat routes */}
        <Route path="/share" element={<Navigate to="/topics" replace />} />
        <Route path="/share/contacts" element={<Navigate to="/accounts" replace />} />
        <Route path="/account" element={<Navigate to="/accounts" replace />} />
        <Route path="/remember" element={<Remember />} />
        <Route path="/talk" element={<Talk />} />
        <Route path="/play/:recordingId" element={<Play />} />
        <Route path="/video-landing" element={<VideoLanding />} />
      </Routes>
    </Router>
  )
}

export default App

