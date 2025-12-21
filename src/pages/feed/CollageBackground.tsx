import React, { useMemo } from 'react'

function hashStringToInt(input: string) {
  // Simple deterministic hash (good enough for visual variety).
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function n01(seed: number, salt: number) {
  // Deterministic pseudo-random [0,1)
  const x = Math.imul(seed ^ salt, 1103515245) + 12345
  return ((x >>> 0) % 10000) / 10000
}

type Accent = 'lime' | 'pink' | 'cyan' | 'cream'

const accentToHue: Record<Accent, number> = {
  lime: 96,
  pink: 320,
  cyan: 190,
  cream: 38,
}

export default function CollageBackground(props: {
  variantKey: string
  accent?: Accent
  calm?: boolean
}) {
  const seed = useMemo(() => hashStringToInt(props.variantKey), [props.variantKey])
  const accentHue = accentToHue[props.accent ?? 'cyan']

  const vars = useMemo(() => {
    const driftX = Math.round((n01(seed, 1) - 0.5) * 18)
    const driftY = Math.round((n01(seed, 2) - 0.5) * 18)
    const rot = (n01(seed, 3) - 0.5) * 3.2
    const heroRot = (n01(seed, 4) - 0.5) * 5.0
    const heroX = Math.round(n01(seed, 5) * 72)
    const heroY = Math.round(n01(seed, 6) * 62)
    const chipX = Math.round(n01(seed, 7) * 78)
    const chipY = Math.round(n01(seed, 8) * 78)

    const hueA = (accentHue + Math.round((n01(seed, 9) - 0.5) * 42) + 360) % 360
    const hueB = (accentHue + 120 + Math.round((n01(seed, 10) - 0.5) * 56) + 360) % 360
    const hueC = (accentHue + 220 + Math.round((n01(seed, 11) - 0.5) * 60) + 360) % 360

    return {
      '--bg-drift-x': `${driftX}px`,
      '--bg-drift-y': `${driftY}px`,
      '--bg-rot': `${rot}deg`,
      '--bg-hue-a': `${hueA}deg`,
      '--bg-hue-b': `${hueB}deg`,
      '--bg-hue-c': `${hueC}deg`,
      '--hero-rot': `${heroRot}deg`,
      '--hero-x': `${heroX}%`,
      '--hero-y': `${heroY}%`,
      '--chip-x': `${chipX}%`,
      '--chip-y': `${chipY}%`,
    } as React.CSSProperties
  }, [accentHue, seed])

  const className = `feed-collage ${props.calm ? 'feed-collage--calm' : ''}`

  return <div className={className} style={vars} aria-hidden="true" />
}


