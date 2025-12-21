import React from 'react'
import { useNavigate } from 'react-router-dom'
import BuildSwipeExperience from './feed/BuildSwipeExperience'
import './Feed.css'

const Feed: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="feed-shell">
      <button className="feed-home-btn" type="button" onClick={() => navigate('/')}>
        ○
      </button>
      <BuildSwipeExperience />
    </div>
  )
}

export default Feed


