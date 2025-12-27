export interface Memory {
  id: string
  imageUrl: string
  creatorId: string
  creatorName: string
  date: Date
  title: string
  topic: string
  durationSec: number
  recordingId?: string
}

export interface Creator {
  id: string
  name: string
}

export const creators: Creator[] = [
  { id: 'dad', name: 'Dad' },
  { id: 'mom', name: 'Mom' },
  { id: 'me', name: 'Me' },
]

const hash32 = (seed: string) => {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// Simple deterministic PRNG (0..1)
const mulberry32 = (seed: number) => {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function generateSampleMemories(): Memory[] {
  const memories: Memory[] = []
  const years = [2025, 2024, 2023, 2022, 2021, 2020]
  // Topic = broader bucket/category. Title = specific memory within the topic.
  const topics = ['Home', 'Food', 'Family', 'School', 'Work', 'Places', 'Turning Points']
  const titles = [
    'The House Where I Grew Up',
    'My Favorite Recipe Growing Up',
    'Sunday Mornings In The Kitchen',
    'The Day We Moved',
    'A Lesson I Learned Too Late',
    'The Photo I Still Think About',
    'The First Job That Changed Everything',
    'A Person Who Shaped Me',
    'The Place I Miss Most',
  ]

  creators.forEach((creator) => {
    years.forEach((year) => {
      const rng = mulberry32(hash32(`${creator.id}:${year}`))
      const count = 2 + Math.floor(rng() * 3) // 2..4
      for (let i = 0; i < count; i++) {
        const month = Math.floor(rng() * 12)
        const day = 1 + Math.floor(rng() * 28)
        const topic = topics[(year + month + i) % topics.length]
        const title = titles[(year + month + i * 3) % titles.length]
        const durationSec = 45 + Math.floor(rng() * 195) // 0:45–3:59
        memories.push({
          id: `${creator.id}-${year}-${i}`,
          imageUrl: `/placeholder-memory.jpg`,
          creatorId: creator.id,
          creatorName: creator.name,
          date: new Date(year, month, day),
          title,
          topic,
          durationSec,
          recordingId: `recording-${creator.id}-${year}-${i}`,
        })
      }
    })
  })

  return memories
}



