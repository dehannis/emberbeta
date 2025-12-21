import type { Accent } from './types'

export type ArtPack = {
  id: string
  hero: string
  chips: string[]
  texture: 'grain' | 'halftone' | 'paper'
  defaultAccent: Accent
}

export const ART_PACKS: ArtPack[] = [
  { id: 'pack-1', hero: '/stock/1.webp', chips: ['/stock/2.webp', '/stock/3.webp'], texture: 'halftone', defaultAccent: 'lime' },
  { id: 'pack-2', hero: '/stock/4.webp', chips: ['/stock/5.webp', '/stock/6.webp'], texture: 'grain', defaultAccent: 'cyan' },
  { id: 'pack-3', hero: '/stock/2.webp', chips: ['/stock/1.webp', '/stock/6.webp'], texture: 'paper', defaultAccent: 'pink' },
  { id: 'pack-4', hero: '/stock/3.webp', chips: ['/stock/4.webp', '/stock/5.webp'], texture: 'grain', defaultAccent: 'cream' },
]

export function artPackFor(id: string): ArtPack {
  return ART_PACKS.find((p) => p.id === id) ?? ART_PACKS[0]
}


