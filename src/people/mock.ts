import type { Person } from './types'

const nowPlusDays = (d: number) => {
  const x = new Date()
  x.setDate(x.getDate() + d)
  x.setSeconds(0, 0)
  return x.toISOString()
}

export const PEOPLE_MOCK: Person[] = [
  {
    id: 'p-mom',
    name: 'Mom',
    relationship: 'Mother',
    avatarArtPackId: 'pack-1',
    accent: 'lime',
    cadenceDays: 7,
    nextCallAt: nowPlusDays(2),
    language: 'English',
    lastRecordedAt: nowPlusDays(-6),
    hasNewSnippets: true,
    topicsCovered: [
      { id: 'tc-1', label: 'Childhood home', coveredAt: nowPlusDays(-18), snippetCount: 6 },
      { id: 'tc-2', label: 'First job', coveredAt: nowPlusDays(-9), snippetCount: 4 },
    ],
    topicsNext: [
      {
        id: 'tn-1',
        label: 'Love & relationships',
        scheduledAt: nowPlusDays(2),
        questionsPreview: ['Who shaped how you love?', 'What did you learn from a heartbreak?'],
      },
      {
        id: 'tn-2',
        label: 'Hobbies',
        scheduledAt: nowPlusDays(9),
        questionsPreview: ['What did you make with your hands?', 'When did play become serious?'],
      },
    ],
    themes: [
      { key: 'home', label: 'Home', count: 12, intensity: 0.8 },
      { key: 'work', label: 'Work', count: 9, intensity: 0.55 },
      { key: 'love', label: 'Love', count: 7, intensity: 0.62 },
      { key: 'loss', label: 'Loss', count: 4, intensity: 0.3 },
    ],
    emotions: [
      { key: 'nostalgia', label: 'Nostalgia', count: 11, intensity: 0.78 },
      { key: 'gratitude', label: 'Gratitude', count: 8, intensity: 0.66 },
      { key: 'pride', label: 'Pride', count: 6, intensity: 0.58 },
      { key: 'regret', label: 'Regret', count: 3, intensity: 0.34 },
    ],
    snippets: [
      {
        id: 's-mom-1',
        personId: 'p-mom',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        summary: 'A tiny ritual: late-night tea, a notebook, and one sentence.',
        themes: ['Ritual', 'Quiet', 'Growing up'],
        emotions: ['Nostalgia'],
        durationSec: 32,
        createdAt: nowPlusDays(-6),
        transcriptExcerpt: '…late-night tea… a notebook… one sentence…',
        replayCount: 14,
      },
      {
        id: 's-mom-2',
        personId: 'p-mom',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        summary: '“I didn’t know it then, but that street taught me how to leave.”',
        themes: ['Leaving', 'Home', 'Confidence'],
        emotions: ['Pride', 'Nostalgia'],
        durationSec: 44,
        createdAt: nowPlusDays(-10),
        replayCount: 9,
      },
    ],
  },
  {
    id: 'p-dad',
    name: 'Dad',
    relationship: 'Father',
    avatarArtPackId: 'pack-2',
    accent: 'cyan',
    cadenceDays: 10,
    nextCallAt: nowPlusDays(5),
    language: 'English',
    lastRecordedAt: nowPlusDays(-14),
    hasNewSnippets: false,
    topicsCovered: [{ id: 'tc-3', label: 'Work & identity', coveredAt: nowPlusDays(-14), snippetCount: 5 }],
    topicsNext: [
      {
        id: 'tn-3',
        label: 'Lessons & things to learn',
        scheduledAt: nowPlusDays(5),
        questionsPreview: ['What did you learn the hard way?', 'What advice do you ignore and why?'],
      },
    ],
    themes: [
      { key: 'work', label: 'Work', count: 10, intensity: 0.7 },
      { key: 'risk', label: 'Risk', count: 6, intensity: 0.5 },
      { key: 'family', label: 'Family', count: 5, intensity: 0.42 },
    ],
    emotions: [
      { key: 'focus', label: 'Focus', count: 7, intensity: 0.56 },
      { key: 'joy', label: 'Joy', count: 4, intensity: 0.44 },
      { key: 'regret', label: 'Regret', count: 2, intensity: 0.26 },
    ],
    snippets: [
      {
        id: 's-dad-1',
        personId: 'p-dad',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        summary: 'A job he hated… but it gave him the map.',
        themes: ['Work', 'Maps', 'Luck'],
        emotions: ['Focus'],
        durationSec: 28,
        createdAt: nowPlusDays(-14),
        replayCount: 4,
      },
    ],
  },
  {
    id: 'p-hank',
    name: 'Hank',
    relationship: 'Family friend',
    avatarArtPackId: 'pack-3',
    accent: 'pink',
    cadenceDays: 14,
    nextCallAt: nowPlusDays(12),
    language: 'English',
    lastRecordedAt: nowPlusDays(-20),
    hasNewSnippets: true,
    topicsCovered: [{ id: 'tc-4', label: 'Goals', coveredAt: nowPlusDays(-20), snippetCount: 3 }],
    topicsNext: [
      {
        id: 'tn-4',
        label: 'Love & relationships',
        scheduledAt: nowPlusDays(12),
        questionsPreview: ['Who did you become around them?', 'What did you refuse to say?'],
      },
    ],
    themes: [
      { key: 'goals', label: 'Goals', count: 7, intensity: 0.62 },
      { key: 'time', label: 'Time', count: 5, intensity: 0.48 },
    ],
    emotions: [
      { key: 'nostalgia', label: 'Nostalgia', count: 5, intensity: 0.58 },
      { key: 'gratitude', label: 'Gratitude', count: 4, intensity: 0.5 },
    ],
    snippets: [
      {
        id: 's-hank-1',
        personId: 'p-hank',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        summary: 'A friend’s dare that turned into a decade.',
        themes: ['Friendship', 'Risk', 'Time'],
        emotions: ['Nostalgia'],
        durationSec: 55,
        createdAt: nowPlusDays(-20),
        replayCount: 19,
      },
    ],
  },
]


