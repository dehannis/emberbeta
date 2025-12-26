import type { Recording } from './types'

const AUDIO = {
  // demo-only public MP3s
  s1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  s2: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  s3: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  s4: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
} as const

export const SAMPLE_RECORDINGS: Recording[] = [
  {
    recordingId: 'rec-1',
    speakerId: 'mom',
    speakerName: 'Mom',
    relationship: 'mother',
    topic: 'The home where I grew up',
    dateLabel: 'Recorded last week',
    durationSec: 18 * 60 + 12,
    coverArtSet: { accent: 'lime', heroKind: 'photoFragment' },
    fullAudioUrl: AUDIO.s2,
    snippets: [
      {
        snippetId: 'rec-1-sn-1',
        startTimeSec: 38,
        endTimeSec: 58,
        audioUrl: AUDIO.s1,
        summary: '“I didn’t know it then, but that street taught me how to leave.”',
        themes: ['Leaving', 'Home', 'Confidence'],
        transcriptExcerpt: '…I didn’t know it then, but that street taught me how to leave…',
      },
      {
        snippetId: 'rec-1-sn-2',
        startTimeSec: 112,
        endTimeSec: 132,
        audioUrl: AUDIO.s3,
        summary: 'A tiny ritual: late-night tea, a notebook, and one sentence.',
        themes: ['Ritual', 'Quiet', 'Growing up'],
        transcriptExcerpt: '…late-night tea… a notebook… one sentence…',
      },
      {
        snippetId: 'rec-1-sn-3',
        startTimeSec: 208,
        endTimeSec: 232,
        audioUrl: AUDIO.s4,
        summary: 'The moment she realized she could ask for more.',
        themes: ['Agency', 'Work', 'Turning point'],
        transcriptExcerpt: '…that’s when I realized I could ask for more…',
      },
    ],
  },
  {
    recordingId: 'rec-2',
    speakerId: 'dad',
    speakerName: 'Dad',
    relationship: 'father',
    topic: 'A job I hated (that gave me the map)',
    dateLabel: 'Recorded in April',
    durationSec: 22 * 60 + 5,
    coverArtSet: { accent: 'pink', heroKind: 'gradient' },
    fullAudioUrl: AUDIO.s1,
    snippets: [
      {
        snippetId: 'rec-2-sn-1',
        startTimeSec: 16,
        endTimeSec: 34,
        audioUrl: AUDIO.s2,
        summary: 'A job he hated… but it gave him the map.',
        themes: ['Work', 'Maps', 'Luck'],
      },
      {
        snippetId: 'rec-2-sn-2',
        startTimeSec: 64,
        endTimeSec: 80,
        audioUrl: AUDIO.s3,
        summary: 'A friend’s dare that turned into a decade.',
        themes: ['Friendship', 'Risk', 'Time'],
      },
    ],
  },
]


