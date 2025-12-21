import { useMemo } from 'react'

function formatTime(sec: number) {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

export default function MiniScrubBar(props: {
  currentSec: number
  durationSec: number
  onSeek: (nextSec: number) => void
  label?: string
  isDisabled?: boolean
}) {
  const { currentSec, durationSec, onSeek, label, isDisabled } = props

  const safeDuration = useMemo(() => (Number.isFinite(durationSec) && durationSec > 0 ? durationSec : 0), [durationSec])
  const safeCurrent = useMemo(
    () => (Number.isFinite(currentSec) && safeDuration > 0 ? Math.max(0, Math.min(safeDuration, currentSec)) : 0),
    [currentSec, safeDuration],
  )

  return (
    <div className="feed-miniBar" aria-label={label ?? 'Audio scrubber'}>
      <input
        className="feed-miniBar-range"
        type="range"
        min={0}
        max={safeDuration}
        step={0.25}
        value={safeCurrent}
        disabled={isDisabled || safeDuration <= 0}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Seek"
      />
      <div className="feed-miniBar-time" aria-hidden="true">
        {formatTime(safeCurrent)} / {formatTime(safeDuration)}
      </div>
    </div>
  )
}


