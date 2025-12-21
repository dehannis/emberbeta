import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { artPackFor } from '../artPacks'
import { usePeople } from '../store'

type SortKey = 'recent' | 'replayed' | 'intensity' | 'short' | 'long'

export default function PersonSnippets() {
  const reduced = useReducedMotion()
  const nav = useNavigate()
  const { personId } = useParams()
  const { people, audio } = usePeople()
  const person = useMemo(() => people.find((p) => p.id === personId) ?? null, [people, personId])
  const [sort, setSort] = useState<SortKey>('recent')
  const [emotionSel, setEmotionSel] = useState<string[]>([])
  const [themeSel, setThemeSel] = useState<string[]>([])
  const [sheetSnippetId, setSheetSnippetId] = useState<string | null>(null)

  if (!person) {
    return (
      <div className="peopleStage">
        <header className="peopleTop">
          <div className="peopleTitle">Not found</div>
        </header>
      </div>
    )
  }

  const pack = artPackFor(person.avatarArtPackId)

  const allEmotions = useMemo(
    () => Array.from(new Set(person.snippets.flatMap((s) => s.emotions).filter(Boolean))).slice(0, 12),
    [person.snippets],
  )
  const allThemes = useMemo(
    () => Array.from(new Set(person.snippets.flatMap((s) => s.themes).filter(Boolean))).slice(0, 14),
    [person.snippets],
  )

  const filtered = useMemo(() => {
    const hasAll = (arr: string[], sel: string[]) => sel.every((x) => arr.includes(x))
    let list = person.snippets.slice()
    if (emotionSel.length) list = list.filter((s) => hasAll(s.emotions, emotionSel))
    if (themeSel.length) list = list.filter((s) => hasAll(s.themes, themeSel))

    const scoreIntensity = (s: any) => (s.emotions?.length ?? 0) + (s.themes?.length ?? 0)
    list.sort((a, b) => {
      if (sort === 'replayed') return (b.replayCount ?? 0) - (a.replayCount ?? 0)
      if (sort === 'intensity') return scoreIntensity(b) - scoreIntensity(a)
      if (sort === 'short') return a.durationSec - b.durationSec
      if (sort === 'long') return b.durationSec - a.durationSec
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    return list
  }, [emotionSel, person.snippets, sort, themeSel])

  const toggleChip = (key: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(key) ? list.filter((x) => x !== key) : [...list, key])
  }

  const fmtDur = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`

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
        <div className="peopleSub">Snippet explorer</div>
        <div className="peopleSearchRow">
          <button className="peopleSort" type="button" onClick={() => nav(`/people/${person.id}`)}>
            Back
          </button>
          <select className="peopleSort" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort snippets">
            <option value="recent">Most recent</option>
            <option value="replayed">Most replayed</option>
            <option value="intensity">Highest intensity</option>
            <option value="short">Shortest</option>
            <option value="long">Longest</option>
          </select>
        </div>
      </header>

      <main className="snipStage">
        <section className="snipFilters">
          <div className="snipFilterTitle">Emotions</div>
          <div className="snipChips">
            {allEmotions.map((e) => (
              <button
                key={e}
                className={['snipStamp', emotionSel.includes(e) ? 'snipStamp--on' : ''].filter(Boolean).join(' ')}
                type="button"
                onClick={() => toggleChip(e, emotionSel, setEmotionSel)}
              >
                {e}
              </button>
            ))}
          </div>
          <div className="snipFilterTitle" style={{ marginTop: 14 }}>
            Themes
          </div>
          <div className="snipChips">
            {allThemes.map((t) => (
              <button
                key={t}
                className={['snipTag', themeSel.includes(t) ? 'snipTag--on' : ''].filter(Boolean).join(' ')}
                type="button"
                onClick={() => toggleChip(t, themeSel, setThemeSel)}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        <section className="snipList" aria-label="Snippets list">
          {filtered.map((s, idx) => (
            <article key={s.id} className={`snipPrint accent-${person.accent}`}>
              <div className="snipPrint-bg" aria-hidden="true" />
              <div
                className="snipPrint-photo"
                style={{ backgroundImage: `url(${idx % 2 === 0 ? pack.hero : pack.chips[0]})` }}
                aria-hidden="true"
              />
              <div className="snipPrint-body">
                <div className="snipPrintTop">
                  <div className="snipPrintDur">{fmtDur(s.durationSec)}</div>
                  <button
                    className="snipPrintPlay"
                    type="button"
                    onClick={() => (audio.activeSnippetId === s.id ? audio.toggle() : audio.playSnippet(s))}
                    aria-label={audio.activeSnippetId === s.id && audio.isPlaying ? 'Pause' : 'Play'}
                  >
                    {audio.activeSnippetId === s.id && audio.isPlaying ? '❚❚' : '▶'}
                  </button>
                </div>
                <div className="snipPrintSummary" onClick={() => setSheetSnippetId(s.id)} role="button" tabIndex={0}>
                  {s.summary}
                </div>
                <div className="snipPrintTags">
                  {s.themes.slice(0, 3).map((t) => (
                    <span key={t} className="labelTag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      {sheetSnippetId && (
        <div
          className="listenSheetBackdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Listening sheet"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSheetSnippetId(null)
          }}
        >
          {(() => {
            const s = person.snippets.find((x) => x.id === sheetSnippetId)
            if (!s) return null
            return (
              <div className="listenSheet">
                <div className="listenSheetKicker">Listening</div>
                <div className="listenSheetTitle">{person.name}</div>
                <div className="listenSheetText">{s.transcriptExcerpt ?? s.summary}</div>
                <div className="listenSheetActions">
                  <button className="stickerBtn" type="button" onClick={() => (audio.activeSnippetId === s.id ? audio.toggle() : audio.playSnippet(s))}>
                    {audio.activeSnippetId === s.id && audio.isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button className="stickerBtn stickerBtn--ghost" type="button" onClick={() => setSheetSnippetId(null)}>
                    Close
                  </button>
                </div>
                <div className="listenSheetMeta">
                  <Link to={`/people/${person.id}/topics`} className="labelTag">
                    Request follow-up
                  </Link>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </motion.div>
  )
}


