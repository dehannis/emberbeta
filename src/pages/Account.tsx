import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import './Account.css'

interface AccountData {
  name: string
  birthYear: string
  language: string
  voice: string
  accountType: string
}

const Account: React.FC = () => {
  const navigate = useNavigate()
  
  const defaultFormData: AccountData = {
    name: '',
    birthYear: '',
    language: 'English',
    voice: 'female',
    accountType: 'ember',
  }

  // Load saved data from localStorage on mount
  const loadSavedData = (): AccountData => {
    const saved = localStorage.getItem('emberAccountData')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return defaultFormData
      }
    }
    return defaultFormData
  }

  const savedData = loadSavedData()
  const [formData, setFormData] = useState<AccountData>(savedData)
  const [initialFormData, setInitialFormData] = useState<AccountData>(savedData)

  const [contacts, setContacts] = useState([
    { id: 1, name: 'John Doe', phone: '+1-555-123-4567' },
    { id: 2, name: 'Jane Smith', phone: '+1-555-987-6543' },
  ])

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('emberAccountData', JSON.stringify(formData))
    // Update initial form data to hide the save button
    setInitialFormData(formData)
    console.log('Saved account data:', formData)
  }


  return (
    <div className="container">
      <Header />
      <main className="main-content account-content">
        <div className="account-container">
          <div className="account-header">
            <h1 className="account-title">Account</h1>
            {hasChanges && (
              <button
                type="button"
                onClick={handleSave}
                className="save-button"
              >
                Save
              </button>
            )}
          </div>

          {/* Personal Information Section */}
          <section className="account-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                value="+1-781-915-9663"
                className="form-input form-input-disabled"
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Name"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Birth Year</label>
              <input
                type="text"
                name="birthYear"
                value={formData.birthYear}
                onChange={handleChange}
                placeholder="Enter Birth Year"
                className="form-input"
              />
            </div>
          </section>

          {/* Voice Settings Section */}
          <section className="account-section">
            <h2 className="section-title">Voice Settings</h2>
            <div className="form-group">
              <label htmlFor="account-language" className="form-label">
                Language
              </label>
              <div className="select-wrapper">
                <select
                  id="account-language"
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
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="account-voice" className="form-label">
                Voice
              </label>
              <div className="select-wrapper">
                <select
                  id="account-voice"
                  name="voice"
                  value={formData.voice}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </div>
          </section>

          {/* Account Type Section */}
          <section className="account-section">
            <h2 className="section-title">Account Type</h2>
            <div className="account-type-options">
              <button
                type="button"
                className={`account-type-btn ${formData.accountType === 'ember' ? 'active' : ''}`}
                onClick={() => setFormData((prev) => ({ ...prev, accountType: 'ember' }))}
              >
                Ember (Free)
              </button>
              <button
                type="button"
                className="account-type-btn disabled"
                disabled
              >
                Campfire <span className="coming-soon-text">Coming Soon</span>
              </button>
              <button
                type="button"
                className="account-type-btn disabled"
                disabled
              >
                Bonfire <span className="coming-soon-text">Coming Soon</span>
              </button>
            </div>
          </section>

          {/* Contacts Section */}
          <section className="account-section">
            <h2 className="section-title">Contacts</h2>
            <div className="contacts-list">
              {contacts.map((contact) => (
                <div key={contact.id} className="contact-item">
                  <div className="contact-info">
                    <span className="contact-name">{contact.name}</span>
                    <span className="contact-phone">{contact.phone}</span>
                  </div>
                </div>
              ))}
              <div className="contact-item add-contact-item" onClick={() => navigate('/share')}>
                <div className="contact-info">
                  <span className="contact-name add-contact-name">Add New</span>
                </div>
              </div>
            </div>
          </section>

          {/* Sign Out Button */}
          <div className="sign-out-section">
            <button
              type="button"
              onClick={() => {
                // Add sign out logic here
                console.log('Sign out clicked')
              }}
              className="sign-out-button"
            >
              Sign Out
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Account

