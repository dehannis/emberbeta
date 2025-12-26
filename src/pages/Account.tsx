import React, { useEffect, useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import './Account.css'

interface AccountData {
  name: string
  birthYear: string
  language: string
  voice: string
}

type TopicMode = 'house' | 'meal' | 'custom'

interface NextCallSettings {
  everyDays: number
  time: string
  timeZone: string
  topicMode: TopicMode
  prompt: string
}

const Account: React.FC = () => {
  const navigate = useNavigate()
  const defaultFormData: AccountData = {
    name: '',
    birthYear: '',
    language: 'English',
    voice: 'female',
  }

  const [formData, setFormData] = useState<AccountData>(defaultFormData)
  const [initialFormData, setInitialFormData] = useState<AccountData>(defaultFormData)

  const NEXT_CALL_KEY = 'emberAccountNextCallV1'

  const TIME_ZONES = [
    { value: 'America/Los_Angeles', label: 'PT', short: 'PT' },
    { value: 'America/New_York', label: 'ET', short: 'ET' },
    { value: 'Europe/London', label: 'UK', short: 'UK' },
    { value: 'Asia/Seoul', label: 'KST', short: 'KST' },
    { value: 'Asia/Tokyo', label: 'JST', short: 'JST' },
    { value: 'America/Mexico_City', label: 'MXT', short: 'MXT' },
    { value: 'America/Sao_Paulo', label: 'BRT', short: 'BRT' },
  ] as const

  const tzShort = (tz: string) => TIME_ZONES.find((t) => t.value === tz)?.short ?? tz

  const defaultTopicNotes = (mode: TopicMode) => {
    if (mode === 'meal') {
      return (
        `Topic: My Favorite Home Cooked Meal\n` +
        `This is a powerful topic because food is memory—smell, texture, and ritual can bring an entire chapter of life back instantly.\n\n` +
        `Ember will ask:\n` +
        `- What is the meal, and who made it most often?\n` +
        `- Where were you when you ate it—what did the room look and sound like?\n` +
        `- What did it mean in your family (comfort, celebration, survival, love)?\n` +
        `- Tell a specific moment: one day you remember vividly, and why.\n` +
        `- If someone you love tasted it today, what would you want them to understand about you?`
      )
    }
    // Default to house
    return (
      `Topic: The House Where I Grew Up\n` +
      `This is a powerful topic because places hold the blueprint of who we became—our first routines, relationships, fears, and joys.\n\n` +
      `Ember will ask:\n` +
      `- Describe arriving home—what you saw first, and what you felt.\n` +
      `- Walk room by room: what happened in the kitchen, living room, and your bedroom?\n` +
      `- Who lived there with you, and what were they like in that season?\n` +
      `- What was a small detail you can still picture (a sound, a smell, a corner)?\n` +
      `- Share one story from that house that shaped you—and what you carry forward today.`
    )
  }

  const defaultNextCall: NextCallSettings = {
    everyDays: 1,
    time: '18:00',
    timeZone: 'America/Los_Angeles',
    topicMode: 'house',
    prompt: defaultTopicNotes('house'),
  }

  const [nextCall, setNextCall] = useState<NextCallSettings>(defaultNextCall)
  const [initialNextCall, setInitialNextCall] = useState<NextCallSettings>(defaultNextCall)
  const [daysDraft, setDaysDraft] = useState<string>(String(defaultNextCall.everyDays))

  const autoResizeTextarea = (el: HTMLTextAreaElement | null) => {
    if (!el) return
    el.style.height = '0px'
    el.style.height = `${el.scrollHeight}px`
  }

  const formatNextScheduled = (everyDays: number, hhmm: string) => {
    const d = Number.isFinite(everyDays) ? Math.max(0, Math.min(99, Math.floor(everyDays))) : 1
    const [hh, mm] = (hhmm || '18:00').split(':')
    const base = new Date()
    base.setDate(base.getDate() + d)
    base.setHours(Number(hh) || 18, Number(mm) || 0, 0, 0)
    return base.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
  }

  const commitDaysDraft = () => {
    const digits = (daysDraft || '').replace(/\D/g, '').slice(0, 2)
    const n = digits === '' ? 1 : Math.max(0, Math.min(99, Number(digits)))
    setDaysDraft(String(n))
    setNextCall((prev) => ({ ...prev, everyDays: n }))
  }

  useEffect(() => {
    const savedData = localStorage.getItem('emberAccountData')
    if (savedData) {
      const parsed: any = JSON.parse(savedData)
      const cleaned: AccountData = {
        name: typeof parsed?.name === 'string' ? parsed.name : '',
        birthYear: typeof parsed?.birthYear === 'string' ? parsed.birthYear : '',
        language: typeof parsed?.language === 'string' ? parsed.language : 'English',
        voice: typeof parsed?.voice === 'string' ? parsed.voice : 'female',
      }
      setFormData(cleaned)
      setInitialFormData(cleaned)
    }

    try {
      const raw = localStorage.getItem(NEXT_CALL_KEY)
      const parsed: any = raw ? JSON.parse(raw) : null
      if (!parsed) return

      const cleaned: NextCallSettings = {
        everyDays: Number.isFinite(parsed?.everyDays) ? Math.max(0, Math.min(99, Math.floor(parsed.everyDays))) : 1,
        time: typeof parsed?.time === 'string' ? parsed.time : '18:00',
        timeZone: typeof parsed?.timeZone === 'string' ? parsed.timeZone : 'America/Los_Angeles',
        topicMode:
          parsed?.topicMode === 'custom'
            ? 'custom'
            : parsed?.topicMode === 'meal'
              ? 'meal'
              : 'house', // migrate old "biography" -> "house"
        prompt:
          typeof parsed?.prompt === 'string' && parsed.prompt.trim()
            ? parsed.prompt
            : defaultTopicNotes(
                parsed?.topicMode === 'meal' ? 'meal' : parsed?.topicMode === 'custom' ? 'custom' : 'house',
              ),
      }

      setNextCall(cleaned)
      setInitialNextCall(cleaned)
      setDaysDraft(String(cleaned.everyDays ?? 1))
    } catch {
      // ignore
    }
  }, [])

  // Keep preset prompts stable (unless user is customizing).
  useEffect(() => {
    if (nextCall.topicMode === 'custom') return
    setNextCall((prev) => ({ ...prev, prompt: defaultTopicNotes(nextCall.topicMode) }))
  }, [nextCall.topicMode])

  useLayoutEffect(() => {
    document
      .querySelectorAll<HTMLTextAreaElement>('textarea.account-nextcall-notes')
      .forEach((el) => autoResizeTextarea(el))
  }, [nextCall.prompt, nextCall.topicMode])

  useEffect(() => {
    // Mobile: line-wrapping changes with viewport width/keyboard/orientation,
    // so recompute textarea height even when the text hasn't changed.
    const resizeAll = () => {
      document
        .querySelectorAll<HTMLTextAreaElement>('textarea.account-nextcall-notes')
        .forEach((el) => autoResizeTextarea(el))
    }

    const onResize = () => {
      requestAnimationFrame(() => resizeAll())
      setTimeout(resizeAll, 0)
    }

    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    window.visualViewport?.addEventListener('resize', onResize)

    onResize()

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
    }
  }, [])

  const hasChanges =
    JSON.stringify(formData) !== JSON.stringify(initialFormData) ||
    JSON.stringify(nextCall) !== JSON.stringify(initialNextCall)

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
    localStorage.setItem(NEXT_CALL_KEY, JSON.stringify(nextCall))
    setInitialFormData(formData)
    setInitialNextCall(nextCall)
    console.log('Saved account data:', formData)
  }

  return (
    <div className="container account-page">
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
                  Ember Voice
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
            <h2 className="section-title">NEXT CALL</h2>
            <div className="section-box">
              <div className="account-nextcall">
                <div className="account-nextcall-row">
                  <div className="account-nextcall-label">Every</div>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="form-input account-nextcall-days"
                    value={daysDraft}
                    onChange={(e) => setDaysDraft(e.target.value.replace(/\D/g, '').slice(0, 2))}
                    onBlur={commitDaysDraft}
                  />
                  <div className="account-nextcall-label">days at</div>
                  <div className="select-wrapper account-nextcall-time">
                    <select
                      className="form-select"
                      value={nextCall.time}
                      onChange={(e) => setNextCall((p) => ({ ...p, time: e.target.value }))}
                    >
                      {[
                        ['00:00', '12:00 AM'],
                        ['06:00', '6:00 AM'],
                        ['08:00', '8:00 AM'],
                        ['09:00', '9:00 AM'],
                        ['10:00', '10:00 AM'],
                        ['12:00', '12:00 PM'],
                        ['15:00', '3:00 PM'],
                        ['17:00', '5:00 PM'],
                        ['18:00', '6:00 PM'],
                        ['19:00', '7:00 PM'],
                        ['20:00', '8:00 PM'],
                        ['21:00', '9:00 PM'],
                      ].map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="select-wrapper account-nextcall-tz">
                    <select
                      className="form-select"
                      value={nextCall.timeZone}
                      onChange={(e) => setNextCall((p) => ({ ...p, timeZone: e.target.value }))}
                    >
                      {TIME_ZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="account-nextcall-sub">
                  Next call scheduled on{' '}
                  <strong>
                    {formatNextScheduled(nextCall.everyDays, nextCall.time)} ({tzShort(nextCall.timeZone)})
                  </strong>
                  .
                </div>

                <div className="account-nextcall-topic">
                  <div className="account-nextcall-topic-header">
                    <div className="form-label">TOPIC OF NEXT CALL</div>
                  </div>
                  <div className="select-wrapper">
                    <select
                      className="form-select"
                      value={nextCall.topicMode}
                      onChange={(e) => {
                        const mode = e.target.value as TopicMode
                        if (mode === 'house' || mode === 'meal') {
                          setNextCall((p) => ({
                            ...p,
                            topicMode: mode,
                            prompt: defaultTopicNotes(mode),
                          }))
                        } else {
                          setNextCall((p) => ({ ...p, topicMode: 'custom' }))
                        }
                      }}
                    >
                      <option value="house">The House Where I Grew Up</option>
                      <option value="meal">My Favorite Home Cooked Meal</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  <textarea
                    className="form-input account-nextcall-notes ember-scroll"
                    value={nextCall.prompt}
                    readOnly={nextCall.topicMode !== 'custom'}
                    onChange={(e) => {
                      autoResizeTextarea(e.currentTarget)
                      setNextCall((p) => ({ ...p, prompt: e.target.value }))
                    }}
                    placeholder={
                      nextCall.topicMode === 'custom'
                        ? 'Example: Tell me about the first country you traveled to'
                        : 'Topic notes…'
                    }
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </section>

          {hasChanges && (
            <section className="account-save-bottom">
              <button type="button" onClick={handleSave} className="save-button">
                Save
              </button>
            </section>
          )}

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

