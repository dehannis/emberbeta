import React from 'react'
import Header from '../components/Header'
import BuildSwipeExperience from './feed/BuildSwipeExperience'
import './Feed.css'

const Feed: React.FC = () => {
  return (
    <div className="feed-shell">
      <div className="feed-header-overlay">
        <Header hidePhone />
      </div>
      <BuildSwipeExperience />
    </div>
  )
}

export default Feed


