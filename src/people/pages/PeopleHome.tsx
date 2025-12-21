import { useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { artPackFor } from '../artPacks'
import { usePeople } from '../store'

type SortKey = 'next_call' | 'recent' | 'themes' | 'new_snippets'

const formatDue = (iso: string) => {
  const d = new Date(iso)
  const now = new Date()
  const diffDays = Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (!Number.isFinite(diffDays)) return '—'
  if (diffDays <= 0) return 'Due now'
  if (diffDays === 1) return 'Due tomorrow'
  return `Due in ${diffDays}d`
}

export default function PeopleHome() {
  const reduced = useReducedMotion()
  const { people } = usePeople()
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortKey>('next_call')

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const filtered = needle
      ? people.filter((p) => p.name.toLowerCase().includes(needle) || (p.relationship ?? '').toLowerCase().includes(needle))
      : people.slice()

    const scoreThemes = (p: any) => (Array.isArray(p.themes) ? p.themes.reduce((a: number, t: any) => a + (t.count ?? 0), 0) : 0)
    const scoreRecent = (p: any) => (p.lastRecordedAt ? new Date(p.lastRecordedAt).getTime() : 0)
    const scoreNext = (p: any) => (p.nextCallAt ? new Date(p.nextCallAt).getTime() : Number.POSITIVE_INFINITY)

    filtered.sort((a, b) => {
      if (sort === 'new_snippets') return Number(Boolean(b.hasNewSnippets)) - Number(Boolean(a.hasNewSnippets))
      if (sort === 'themes') return scoreThemes(b) - scoreThemes(a)
      if (sort === 'recent') return scoreRecent(b) - scoreRecent(a)
      return scoreNext(a) - scoreNext(b)
    })
    return filtered
  }, [people, q, sort])

  return (
    <motion.div
      className="peopleStage"
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? undefined : { opacity: 1 }}
      exit={reduced ? undefined : { opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <header className="peopleTop">
        <div className="peopleTitle">People</div>
        <div className="peopleSub">A gallery wall of voices</div>
        <div className="peopleSearchRow">
          <div className="peopleSearchTape">
            <input
              className="peopleSearchInput"
              placeholder="Search (tape strip)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search people"
            />
          </div>
          <select className="peopleSort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort people">
            <option value="next_call">Next due</option>
            <option value="recent">Most recent</option>
            <option value="themes">Most themes</option>
            <option value="new_snippets">New snippets</option>
          </select>
        </div>
      </header>

      <main className="peopleWall" aria-label="People gallery">
        {list.map((p, idx) => {
          const pack = artPackFor(p.avatarArtPackId)
          const variant = idx % 7 === 0 ? 'wide' : idx % 5 === 0 ? 'tall' : 'normal'
          return (
            <Link
              key={p.id}
              to={`/people/${p.id}`}
              className={[
                'personTile',
                variant === 'tall' ? 'personTile--tall' : '',
                variant === 'wide' ? 'personTile--wide' : '',
                `accent-${p.accent}`,
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`Open ${p.name}`}
            >
              <div className="personTile-bg" aria-hidden="true" />
              <div className="personTile-photo" style={{ backgroundImage: `url(${pack.hero})` }} aria-hidden="true" />
              <div className="personTile-chip" style={{ backgroundImage: `url(${pack.chips[0]})` }} aria-hidden="true" />
              <div className="personTile-body">
                <div className="personTile-name">{p.name}</div>
                <div className="personTile-meta">
                  {p.relationship && <span className="labelTag">{p.relationship}</span>}
                  <span className="labelTag">{formatDue(p.nextCallAt)}</span>
                  <span className="labelTag">Every {p.cadenceDays}d</span>
                  <span className="labelTag">{p.language}</span>
                  {p.hasNewSnippets && <span className="stampNew">New snippets</span>}
                </div>
              </div>
            </Link>
          )
        })}
      </main>
    </motion.div>
  )
}


