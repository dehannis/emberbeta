/**
 * People (front-end only)
 *
 * Architecture:
 * - `src/people/types.ts`: typed entities for People/Topics/Snippets.
 * - `src/people/mock.ts`: curated mock dataset (replace with backend results later).
 * - `src/people/store.tsx`: localStorage-backed state for editable fields + single audio instance.
 * - `src/people/pages/*`: route screens (gallery, person, snippets, schedule, topics).
 *
 * Backend wiring notes:
 * - Replace `PEOPLE_MOCK` with an API fetch + normalize; keep IDs stable.
 * - Persist cadence/nextCall/language/topics via PATCH endpoints instead of localStorage.
 * - Replace snippet audio URLs with signed URLs. Keep `audio` singleton to prevent overlap.
 */
import { Outlet } from 'react-router-dom'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import { PeopleProvider } from './store'
import './people.css'

export default function PeopleLayout() {
  return (
    <PeopleProvider>
      <MotionConfig reducedMotion="user">
        <AnimatePresence mode="wait" initial={false}>
          <Outlet />
        </AnimatePresence>
      </MotionConfig>
    </PeopleProvider>
  )
}


