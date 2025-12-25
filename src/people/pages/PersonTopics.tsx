import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { usePeople } from '../store'

export default function PersonTopics() {
  const reduced = useReducedMotion()
  const nav = useNavigate()
  const { personId } = useParams()
  const { people, updatePerson, attachTopicPhoto } = usePeople()
  const person = useMemo(() => people.find((p) => p.id === personId) ?? null, [people, personId])

  const [newTopic, setNewTopic] = useState('')

  if (!person) return null

  return (
    <motion.div
      className="peopleStage"
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: 10 }}
      transition={{ duration: 0.35 }}
    >
      <header className="peopleTop">
        <div className="peopleTitle">{person.name}</div>
        <div className="peopleSub">Topic planner</div>
        <div className="peopleSearchRow">
          <button className="peopleSort" type="button" onClick={() => nav(`/people/${person.id}`)}>
            Back
          </button>
          <button className="peopleSort" type="button" onClick={() => nav('/feed')}>
            Send request → Remember
          </button>
        </div>
      </header>

      <main className="snipStage">
        <section className="snipFilters">
          <div className="snipFilterTitle">Covered</div>
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {person.topicsCovered.map((t) => (
              <div key={t.id} className="stampCard">
                <div className="stampCardTop">
                  <div className="stampCardLabel">{t.label}</div>
                  <div className="stampCardCount">{t.snippetCount ?? 0} snippets</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="snipFilters">
          <div className="snipFilterTitle">Next topics</div>
          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {person.topicsNext.map((t) => (
              <div key={t.id} className="stampCard">
                <div className="stampCardTop">
                  <div className="stampCardLabel">{t.label}</div>
                  <div className="stampCardCount">{t.scheduledAt ? new Date(t.scheduledAt).toLocaleDateString() : ''}</div>
                </div>
                {t.questionsPreview?.length ? (
                  <div style={{ marginTop: 10, opacity: 0.86, lineHeight: 1.5 }}>
                    {t.questionsPreview.slice(0, 3).map((q) => (
                      <div key={q}>• {q}</div>
                    ))}
                  </div>
                ) : null}
                <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                  <label className="labelTag" style={{ width: 'fit-content' }}>
                    Attach photo
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const url = URL.createObjectURL(file)
                        attachTopicPhoto(person.id, t.id, url)
                      }}
                    />
                  </label>
                  {t.attachedPhotoUrl && (
                    <img
                      src={t.attachedPhotoUrl}
                      alt="Attached"
                      style={{ width: '100%', borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)' }}
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="snipFilters">
          <div className="snipFilterTitle">Add custom topic</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input
              className="peopleSearchInput"
              style={{ border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 12px', background: 'rgba(0,0,0,0.28)' }}
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Type a topic…"
              aria-label="New topic"
            />
            <button
              className="stickerBtn"
              type="button"
              onClick={() => {
                const label = newTopic.trim()
                if (!label) return
                updatePerson(person.id, {
                  topicsNext: [{ id: `tn-${Date.now()}`, label }, ...person.topicsNext],
                })
                setNewTopic('')
              }}
            >
              Add
            </button>
          </div>
        </section>
      </main>
    </motion.div>
  )
}


