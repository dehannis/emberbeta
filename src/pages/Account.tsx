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

  const [formData, setFormData] = useState<AccountData>(defaultFormData)
  const [initialFormData, setInitialFormData] = useState<AccountData>(defaultFormData)

  const [contacts] = useState([
    { id: 1, name: 'Suchan Chae', phone: '+1-555-123-4567' },
    { id: 2, name: 'Hank Lee', phone: '+1-555-987-6543' },
  ])

  useEffect(() => {
    const savedData = localStorage.getItem('emberAccountData')
    if (savedData) {
      const parsedData: AccountData = JSON.parse(savedData)
      setFormData(parsedData)
      setInitialFormData(parsedData)
    }
  }, [])

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
    localStorage.setItem('emberAccountData', JSON.stringify(formData))
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

          <section className="account-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="section-box">
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
            </div>
          </section>

          <section className="account-section">
            <h2 className="section-title">Voice Settings</h2>
            <div className="section-box">
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
            </div>
          </section>

          <section className="account-section">
            <h2 className="section-title">Account Type</h2>
            <div className="section-box">
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
            </div>
          </section>

          <section className="account-section">
            <h2 className="section-title">Contacts</h2>
            <div className="section-box">
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
                    <span className="contact-name add-contact-name">Add</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="sign-out-section">
            <button
              type="button"
              onClick={() => navigate('/video-landing')}
              className="sign-out-button"
            >
              Sign Out
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Account

