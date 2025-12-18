import React, { useEffect, useMemo, useState } from 'react'
import Header from '../components/Header'
import './Share.css'

type TopicMode = 'biography' | 'custom'
type Relationship =
  | 'mother'
  | 'father'
  | 'grandmother'
  | 'grandfather'
  | 'brother'
  | 'sister'
  | 'son'
  | 'daughter'
  | 'cousin'
  | 'friend'
  | 'other'

interface SharingContact {
  id: string
  name: string
  phone: string
  birthYear?: string
  relationship: Relationship
  isAdmin: boolean
  nextCallDate: string
  nextCallTime: string
  nextCallLanguage: string
  nextCallVoice: string
  nextCallTopicMode: TopicMode
  nextCallPrompt: string
}

const CONTACTS_KEY = 'emberContactsV1'

const Share: React.FC = () => {
  const RELATIONSHIP_OPTIONS = useMemo(
    () =>
      [
        { value: 'mother', label: 'Mother' },
        { value: 'father', label: 'Father' },
        { value: 'brother', label: 'Brother' },
        { value: 'sister', label: 'Sister' },
        { value: 'son', label: 'Son' },
        { value: 'daughter', label: 'Daughter' },
        { value: 'grandmother', label: 'Grandmother' },
        { value: 'grandfather', label: 'Grandfather' },
        { value: 'cousin', label: 'Cousin' },
        { value: 'friend', label: 'Friend' },
        { value: 'other', label: 'Other' },
      ] as const,
    [],
  )

  const normalizeRelationship = (raw: unknown): Relationship => {
    if (typeof raw !== 'string') return 'other'
    const v = raw.trim().toLowerCase()
    const ok = new Set<Relationship>([
      'mother',
      'father',
      'grandmother',
      'grandfather',
      'brother',
      'sister',
      'son',
      'daughter',
      'cousin',
      'friend',
      'other',
    ])
    return ok.has(v as Relationship) ? (v as Relationship) : 'other'
  }

  const [contacts, setContacts] = useState<SharingContact[]>([])
  const [form, setForm] = useState<Omit<SharingContact, 'id'>>({
    name: '',
    phone: '',
    birthYear: '',
    relationship: 'mother',
    isAdmin: false,
    nextCallDate: '',
    nextCallTime: '',
    nextCallLanguage: 'English',
    nextCallVoice: 'female',
    nextCallTopicMode: 'biography',
    nextCallPrompt: '',
  })

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONTACTS_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const list = Array.isArray(parsed) ? parsed : null
      if (!list) return

      const cleaned: SharingContact[] = list
        .filter((c: any) => c && typeof c.name === 'string' && typeof c.phone === 'string')
        .map((c: any, idx: number) => ({
          id: typeof c.id === 'string' ? c.id : `c-${idx + 1}`,
          name: c.name,
          phone: c.phone,
          birthYear: typeof c.birthYear === 'string' ? c.birthYear : '',
          relationship: normalizeRelationship(c.relationship),
          isAdmin: typeof c.isAdmin === 'boolean' ? c.isAdmin : false,
          nextCallDate: typeof c.nextCallDate === 'string' ? c.nextCallDate : '',
          nextCallTime: typeof c.nextCallTime === 'string' ? c.nextCallTime : '',
          nextCallLanguage: typeof c.nextCallLanguage === 'string' ? c.nextCallLanguage : 'English',
          nextCallVoice: typeof c.nextCallVoice === 'string' ? c.nextCallVoice : 'female',
          nextCallTopicMode: (c.nextCallTopicMode === 'custom' ? 'custom' : 'biography') as TopicMode,
          nextCallPrompt: typeof c.nextCallPrompt === 'string' ? c.nextCallPrompt : '',
        }))
      setContacts(cleaned)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts))
    } catch {
      // ignore
    }
  }, [contacts])

  const addContact = () => {
    const name = form.name.trim()
    const phone = form.phone.trim()
    if (!name || !phone) return

    const newContact: SharingContact = {
      id: `c-${Date.now()}`,
      ...form,
      name,
      phone,
    }
    setContacts((prev) => [newContact, ...prev])
    setForm((prev) => ({
      ...prev,
      name: '',
      phone: '',
      birthYear: '',
      isAdmin: false,
      nextCallDate: '',
      nextCallTime: '',
      nextCallTopicMode: 'biography',
      nextCallPrompt: '',
    }))
  }

  const removeContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }

  return (
    <div className="container">
      <Header />
      <main className="main-content share-content">
        <div className="share-form-container">
          <div className="share-header">
            <h1 className="share-title">Sharing With</h1>
          </div>

          <form
            className="share-form"
            onSubmit={(e) => {
              e.preventDefault()
              addContact()
            }}
          >
            <div className="form-box">
              <div className="form-group">
                <label className="form-label" htmlFor="share-name">
                  Name
                </label>
                <input
                  id="share-name"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter name"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="share-phone">
                  Phone
                </label>
                <input
                  id="share-phone"
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+1-…"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="share-birthyear">
                  Birth year (optional)
                </label>
                <input
                  id="share-birthyear"
                  className="form-input"
                  value={form.birthYear ?? ''}
                  onChange={(e) => setForm((p) => ({ ...p, birthYear: e.target.value }))}
                  placeholder="YYYY"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="share-relationship">
                  Relationship
                </label>
                <div className="select-wrapper">
                  <select
                    id="share-relationship"
                    className="form-select"
                    value={form.relationship}
                    onChange={(e) => setForm((p) => ({ ...p, relationship: e.target.value as Relationship }))}
                  >
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Admin</label>
                <button
                  type="button"
                  className={`sharing-toggle ${form.isAdmin ? 'on' : ''}`}
                  onClick={() => setForm((p) => ({ ...p, isAdmin: !p.isAdmin }))}
                  aria-pressed={form.isAdmin}
                >
                  <span className="sharing-toggle-knob" />
                </button>
              </div>
            </div>

            <div className="form-box">
              <div className="form-group">
                <label className="form-label">Next Call</label>
                <div className="sharing-schedule-grid">
                  <input
                    type="date"
                    className="sharing-control"
                    value={form.nextCallDate}
                    onChange={(e) => setForm((p) => ({ ...p, nextCallDate: e.target.value }))}
                  />
                  <input
                    type="time"
                    className="sharing-control"
                    value={form.nextCallTime}
                    onChange={(e) => setForm((p) => ({ ...p, nextCallTime: e.target.value }))}
                  />
                  <div className="sharing-select">
                    <select
                      className="sharing-control"
                      value={form.nextCallLanguage}
                      onChange={(e) => setForm((p) => ({ ...p, nextCallLanguage: e.target.value }))}
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
                  <div className="sharing-select">
                    <select
                      className="sharing-control"
                      value={form.nextCallVoice}
                      onChange={(e) => setForm((p) => ({ ...p, nextCallVoice: e.target.value }))}
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                </div>

                <div className="sharing-topic-grid">
                  <div className="sharing-select">
                    <select
                      className="sharing-control"
                      value={form.nextCallTopicMode}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, nextCallTopicMode: e.target.value as TopicMode }))
                      }
                    >
                      <option value="biography">Ember biography</option>
                      <option value="custom">Custom prompt</option>
                    </select>
                  </div>
                  <input
                    className="sharing-control"
                    value={form.nextCallPrompt}
                    onChange={(e) => setForm((p) => ({ ...p, nextCallPrompt: e.target.value }))}
                    placeholder={form.nextCallTopicMode === 'custom' ? 'Enter a prompt…' : 'Optional notes…'}
                    disabled={form.nextCallTopicMode !== 'custom'}
                  />
                </div>
              </div>
            </div>

            <div className="submit-section">
              <button type="submit" className="submit-button" disabled={!form.name.trim() || !form.phone.trim()}>
                Add
              </button>
            </div>
          </form>

          {contacts.length > 0 && (
            <section className="sharing-with-section" style={{ marginTop: '1.25rem' }}>
              <div className="sharing-with-list">
                {contacts.map((c) => (
                  <div key={c.id} className="sharing-with-card">
                    <div className="sharing-card-top">
                      <div className="sharing-card-ident">
                        <div className="sharing-card-name">{c.name}</div>
                        <div className="sharing-card-phone">
                          {c.phone}
                          {c.birthYear ? ` • ${c.birthYear}` : ''}
                        </div>
                      </div>
                      <div className="sharing-card-actions">
                        <button
                          type="button"
                          className="share-add-btn"
                          onClick={() => removeContact(c.id)}
                          aria-label={`Remove ${c.name}`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default Share

