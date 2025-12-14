import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import './Share.css'

const Share: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    language: 'English',
    voice: 'female',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [invitationsRemaining, setInvitationsRemaining] = useState(5)

  const handleSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault()
    }
    if (!formData.name.trim()) return
    console.log('Form submitted:', formData)
    setIsSubmitted(true)
    setInvitationsRemaining((prev) => Math.max(0, prev - 1))
    // Add form submission logic here
  }

  const handleCopy = async () => {
    const url = 'https://ember.build/4271993'
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the overlay, not on the url-box
    if (e.target === e.currentTarget) {
      setIsSubmitted(false)
    }
  }

  const handleBoxClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Prevent clicks on the box from closing the overlay
    e.stopPropagation()
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const getFirstName = (fullName: string): string => {
    if (!fullName.trim()) return 'them'
    return fullName.trim().split(' ')[0]
  }

  return (
    <div className="container">
      <Header />
      <main className="main-content share-content">
        <div className={`share-form-container ${isSubmitted ? 'faded' : ''}`}>
          <h1 className="share-title">Share</h1>
          <form onSubmit={handleSubmit} className="share-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Who would you like to hear from?"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="language" className="form-label">
                Language
              </label>
              <div className="select-wrapper">
                <select
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Korean">Korean</option>
                  <option value="Japanese">Japanese</option>
                  <option value="Portuguese">Portuguese</option>
                  <option value="French">French</option>
                  <option value="Hindi">Hindi</option>
                </select>
                {formData.language === 'English' && (
                  <span className="select-default-text">(Default)</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="voice" className="form-label">
                Voice
              </label>
              <div className="select-wrapper">
                <select
                  id="voice"
                  name="voice"
                  value={formData.voice}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
                {formData.voice === 'female' && (
                  <span className="select-default-text">(Default)</span>
                )}
              </div>
            </div>
            
            {formData.name.trim() && (
              <div className="submit-section">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="submit-button"
                >
                  Generate Shareable Link
                </button>
              </div>
            )}
          </form>
        </div>
        {isSubmitted && (
          <div className="url-overlay" onClick={handleOverlayClick}>
            <div className="url-box" onClick={handleBoxClick}>
              <div className="url-content" onClick={handleCopy}>
                <span className="url-text">https://ember.build/4271993</span>
                <span className="copy-text">
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </div>
              <p className="url-description">
                Share this link with {getFirstName(formData.name)} to invite them to Ember.<br />
                {invitationsRemaining} invitation{invitationsRemaining !== 1 ? 's' : ''} remaining.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Share

