import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { usePeople } from '../store'

const isoToLocalInput = (iso: string) => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const localInputToIso = (v: string) => {
  const d = new Date(v)
  return d.toISOString()
}

export default function PersonSchedule() {
  const reduced = useReducedMotion()
  const nav = useNavigate()
  const { personId } = useParams()
  const { people, updatePerson } = usePeople()
  const person = useMemo(() => people.find((p) => p.id === personId) ?? null, [people, personId])

  const [cadence, setCadence] = useState(person?.cadenceDays ?? 7)
  const [nextCall, setNextCall] = useState(person ? isoToLocalInput(person.nextCallAt) : '')
  const [lang, setLang] = useState(person?.language ?? 'English')

  const preview = useMemo(() => {
    if (!person) return []
    const start = new Date(localInputToIso(nextCall || person.nextCallAt))
    const out: string[] = []
    for (let i = 0; i < 3; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i * Math.max(1, cadence))
      out.push(d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }))
    }
    return out
  }, [cadence, nextCall, person])

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
        <div className="peopleSub">Scheduler / cadence editor</div>
      </header>

      <main className="snipStage">
        <section className="snipFilters">
          <div className="snipFilterTitle">Cadence</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="stickerBtn" type="button" onClick={() => setCadence((c) => Math.max(1, c - 1))}>
              −
            </button>
            <span className="labelTag">Every {cadence} days</span>
            <button className="stickerBtn" type="button" onClick={() => setCadence((c) => Math.min(60, c + 1))}>
              +
            </button>
          </div>

          <div className="snipFilterTitle" style={{ marginTop: 16 }}>
            Next call
          </div>
          <input className="peopleSort" type="datetime-local" value={nextCall} onChange={(e) => setNextCall(e.target.value)} />

          <div className="snipFilterTitle" style={{ marginTop: 16 }}>
            Language
          </div>
          <select className="peopleSort" value={lang} onChange={(e) => setLang(e.target.value)}>
            {['English', 'Spanish', 'Korean', 'Japanese', 'Portuguese'].map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <div className="snipFilterTitle" style={{ marginTop: 16 }}>
            Call plan (next 3)
          </div>
          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
            {preview.map((p) => (
              <div key={p} className="labelTag">
                {p}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="stickerBtn"
              type="button"
              onClick={() => {
                updatePerson(person.id, {
                  cadenceDays: cadence,
                  nextCallAt: localInputToIso(nextCall),
                  language: lang,
                })
                nav(`/people/${person.id}`)
              }}
            >
              Save
            </button>
            <button className="stickerBtn stickerBtn--ghost" type="button" onClick={() => nav(`/people/${person.id}`)}>
              Cancel
            </button>
          </div>
        </section>
      </main>
    </motion.div>
  )
}


