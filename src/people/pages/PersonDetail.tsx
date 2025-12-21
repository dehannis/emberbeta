import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { artPackFor } from '../artPacks'
import { usePeople } from '../store'

const fmtDateTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch {
    return iso
  }
}

export default function PersonDetail() {
  const reduced = useReducedMotion()
  const nav = useNavigate()
  const { personId } = useParams()
  const { people } = usePeople()
  const person = useMemo(() => people.find((p) => p.id === personId) ?? null, [people, personId])

  if (!person) {
    return (
      <div className="peopleStage">
        <header className="peopleTop">
          <div className="peopleTitle">Not found</div>
          <div className="peopleSub">This person doesn’t exist.</div>
        </header>
        <main className="peopleWall">
          <button className="stickerBtn" type="button" onClick={() => nav('/people')}>
            Back to People
          </button>
        </main>
      </div>
    )
  }

  const pack = artPackFor(person.avatarArtPackId)

  return (
    <motion.div
      className="peopleStage"
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      exit={reduced ? undefined : { opacity: 0, y: 10 }}
      transition={{ duration: 0.45 }}
    >
      <div className={`personHero accent-${person.accent}`}>
        <div className="personHero-bg" aria-hidden="true" />
        <div className="personHero-photo" style={{ backgroundImage: `url(${pack.hero})` }} aria-hidden="true" />
        <div className="personHero-chipA" style={{ backgroundImage: `url(${pack.chips[0]})` }} aria-hidden="true" />
        <div className="personHero-chipB" style={{ backgroundImage: `url(${pack.chips[1]})` }} aria-hidden="true" />
        <div className="personHero-body">
          <div className="personHero-kicker">Person</div>
          <div className="personHero-name">{person.name}</div>
          <div className="personHero-meta">
            {person.relationship && <span className="labelTag">{person.relationship}</span>}
            <span className="labelTag">Every {person.cadenceDays}d</span>
            <span className="labelTag">{person.language}</span>
            <span className="labelTag">Next: {fmtDateTime(person.nextCallAt)}</span>
          </div>
          <div className="personHero-actions">
            <Link className="stickerBtn" to={`/people/${person.id}/snippets`}>
              Listen
            </Link>
            <Link className="stickerBtn stickerBtn--ghost" to={`/people/${person.id}/schedule`}>
              Cadence
            </Link>
            <Link className="stickerBtn stickerBtn--ghost" to={`/people/${person.id}/topics`}>
              Topics
            </Link>
          </div>
        </div>
      </div>

      <main className="personBody">
        <section className="personSection">
          <div className="personSectionTitle">Topics covered</div>
          <div className="personChips">
            {person.topicsCovered.map((t) => (
              <span key={t.id} className="labelTag">
                {t.label}
              </span>
            ))}
          </div>
        </section>

        <section className="personSection">
          <div className="personSectionTitle">Next topics</div>
          <div className="personChips">
            {person.topicsNext.map((t) => (
              <span key={t.id} className="labelTag">
                {t.label}
              </span>
            ))}
          </div>
        </section>

        <section className="personSection">
          <div className="personSectionTitle">Emotions wall</div>
          <div className="stampWall" role="list" aria-label="Emotions">
            {person.emotions.map((e) => (
              <div key={e.key} className="stampCard" role="listitem">
                <div className="stampCardTop">
                  <div className="stampCardLabel">{e.label}</div>
                  <div className="stampCardCount">{e.count}</div>
                </div>
                <div className="stampBar" aria-hidden="true">
                  <div className="stampBarFill" style={{ width: `${Math.round(((e.intensity ?? 0.5) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="personSection">
          <div className="personSectionTitle">Themes wall</div>
          <div className="stampWall" role="list" aria-label="Themes">
            {person.themes.map((t) => (
              <div key={t.key} className="stampCard" role="listitem">
                <div className="stampCardTop">
                  <div className="stampCardLabel">{t.label}</div>
                  <div className="stampCardCount">{t.count}</div>
                </div>
                <div className="stampBar" aria-hidden="true">
                  <div className="stampBarFill" style={{ width: `${Math.round(((t.intensity ?? 0.5) * 100))}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </motion.div>
  )
}


