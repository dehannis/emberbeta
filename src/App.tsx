import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Share from './pages/Share'
import Account from './pages/Account'
import Remember from './pages/Remember'
import Listen from './pages/Listen'
import Talk from './pages/Talk'
import VideoLanding from './pages/VideoLanding'
import Feed from './pages/Feed'
import PeopleLayout from './people/PeopleLayout'
import PeopleHome from './people/pages/PeopleHome'
import PersonDetail from './people/pages/PersonDetail'
import PersonSnippets from './people/pages/PersonSnippets'
import PersonSchedule from './people/pages/PersonSchedule'
import PersonTopics from './people/pages/PersonTopics'

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/people" element={<PeopleLayout />}>
          <Route index element={<PeopleHome />} />
          <Route path=":personId" element={<PersonDetail />} />
          <Route path=":personId/snippets" element={<PersonSnippets />} />
          <Route path=":personId/schedule" element={<PersonSchedule />} />
          <Route path=":personId/topics" element={<PersonTopics />} />
        </Route>
        <Route path="/share" element={<Share />} />
        <Route path="/account" element={<Account />} />
        <Route path="/remember" element={<Remember />} />
        <Route path="/listen/:recordingId" element={<Listen />} />
        <Route path="/talk" element={<Talk />} />
        <Route path="/video-landing" element={<VideoLanding />} />
      </Routes>
    </Router>
  )
}

export default App

