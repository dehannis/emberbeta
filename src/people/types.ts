export type Accent = 'lime' | 'pink' | 'cyan' | 'cream'

export interface ThemeOrEmotion {
  key: string
  label: string
  count: number
  intensity?: number // 0..1
}

export interface PeopleSnippet {
  id: string
  personId: string
  audioUrl: string
  summary: string
  themes: string[]
  emotions: string[]
  durationSec: number
  createdAt: string // ISO
  transcriptExcerpt?: string
  replayCount?: number
}

export interface TopicEntry {
  id: string
  label: string
  scheduledAt?: string // ISO
  questionsPreview?: string[]
  snippetCount?: number
  coveredAt?: string // ISO
  attachedPhotoUrl?: string
}

export interface Person {
  id: string
  name: string
  relationship?: string
  avatarArtPackId: string
  accent: Accent
  cadenceDays: number
  nextCallAt: string // ISO
  language: string
  topicsCovered: TopicEntry[]
  topicsNext: TopicEntry[]
  themes: ThemeOrEmotion[]
  emotions: ThemeOrEmotion[]
  snippets: PeopleSnippet[]
  lastRecordedAt?: string
  hasNewSnippets?: boolean
}


