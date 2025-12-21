export interface Snippet {
  snippetId: string
  startTimeSec: number
  endTimeSec: number
  audioUrl: string
  transcriptExcerpt?: string
  summary: string
  themes: string[]
  emotionTag?: string
  media?: { kind: 'image'; src: string; alt?: string }[]
}

export interface Recording {
  recordingId: string
  speakerId: string
  speakerName: string
  relationship?: string
  dateLabel?: string
  durationSec: number
  coverArtSet?: {
    accent: 'lime' | 'pink' | 'cyan' | 'cream'
    heroKind: 'photoFragment' | 'gradient'
  }
  snippets: Snippet[]
  fullAudioUrl: string
}

export type FeedTopState =
  | 'LOADING_FEED'
  | 'RECORDING_STACK_ACTIVE'
  | 'END_OF_FEED_REQUESTS'
  | 'END_OF_FEED_TOPICS'
  | 'END_OF_FEED_REST'
  | 'END_OF_FEED_ACTIONS'
  | 'REQUEST_STORY'
  | 'PHOTO_TRIGGER'

export type RecordingInnerState =
  | { kind: 'SNIPPET_PAGE_ACTIVE'; index: number }
  | { kind: 'FULL_RECORDING_ACTIVE' }


