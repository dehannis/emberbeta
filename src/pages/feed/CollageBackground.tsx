import React, { useMemo } from 'react'

type Accent = 'lime' | 'pink' | 'cyan' | 'cream'

function hash32(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function pick01(seed: number, idx: number) {
  // Deterministic pseudo-random in [0, 1)
  const x = Math.imul(seed ^ (idx * 2654435761), 2246822519) >>> 0
  return (x % 10000) / 10000
}

function accentHue(accent?: Accent) {
  if (accent === 'lime') return 104
  if (accent === 'pink') return 322
  if (accent === 'cream') return 42
  return 190 // cyan default
}

export default function CollageBackground(props: { variantKey: string; accent?: Accent; calm?: boolean }) {
  const style = useMemo(() => {
    const seed = hash32(props.variantKey)
    const base = accentHue(props.accent)
    const jitter = (x: number) => (x - 0.5) * 56 // +/- 28deg

    const h1 = (base + jitter(pick01(seed, 1)) + 360) % 360
    const h2 = (base + 118 + jitter(pick01(seed, 2)) + 360) % 360
    const h3 = (base + 238 + jitter(pick01(seed, 3)) + 360) % 360

    const heroX = 18 + pick01(seed, 4) * 64
    const heroY = 16 + pick01(seed, 5) * 64
    const chipX = 14 + pick01(seed, 6) * 72
    const chipY = 18 + pick01(seed, 7) * 70

    const driftX = Math.round((pick01(seed, 8) - 0.5) * 10) // +/- 5px
    const driftY = Math.round((pick01(seed, 9) - 0.5) * 10)
    const rot = (pick01(seed, 10) - 0.5) * (props.calm ? 1.0 : 2.4) // small degrees

    return {
      // CSS vars used by feed.css
      ['--bg-hue-a' as any]: `${h1}deg`,
      ['--bg-hue-b' as any]: `${h2}deg`,
      ['--bg-hue-c' as any]: `${h3}deg`,
      ['--hero-x' as any]: `${heroX.toFixed(1)}%`,
      ['--hero-y' as any]: `${heroY.toFixed(1)}%`,
      ['--chip-x' as any]: `${chipX.toFixed(1)}%`,
      ['--chip-y' as any]: `${chipY.toFixed(1)}%`,
      ['--bg-drift-x' as any]: `${driftX}px`,
      ['--bg-drift-y' as any]: `${driftY}px`,
      ['--bg-rot' as any]: `${rot.toFixed(2)}deg`,
    } as React.CSSProperties
  }, [props.accent, props.calm, props.variantKey])

  return (
    <div
      className={[
        'feed-collage',
        props.accent ? `feed-collage--${props.accent}` : 'feed-collage--cyan',
        props.calm ? 'feed-collage--calm' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      aria-hidden="true"
    />
  )
}


