import React from 'react'
import './Footer.css'

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <span className="footer-copyright">Copyright 2025 Ember Studios, Inc.</span>
      <div className="footer-links">
        <a href="#" className="footer-link">Privacy</a>
        <a href="#" className="footer-link">Terms</a>
      </div>
    </footer>
  )
}

export default Footer

