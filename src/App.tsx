import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Share from './pages/Share'
import Account from './pages/Account'
import Build from './pages/Build'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/share" element={<Share />} />
        <Route path="/account" element={<Account />} />
        <Route path="/build" element={<Build />} />
      </Routes>
    </Router>
  )
}

export default App

