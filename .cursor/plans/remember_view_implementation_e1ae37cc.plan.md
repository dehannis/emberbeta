---
name: Remember View Implementation
overview: Implement the Remember View detail screen with video background, karaoke-style transcript overlay, audio playback controls, and memory card display, integrating with the existing 3D carousel timeline.
todos:
  - id: update-memory-interface
    content: Update Memory interface to include videoUrl, audioUrl, transcript, entityName, title, and year fields. Create TranscriptLine interface.
    status: pending
  - id: add-view-state
    content: Add viewMode state ('browse' | 'detail'), selectedMemory state, and audio playback state (isPlaying, currentTime, duration) to Remember component.
    status: pending
    dependencies:
      - update-memory-interface
  - id: video-background
    content: Create VideoBackground component that replaces static image background. Implement auto-play, loop, and responsive sizing similar to Landing.tsx.
    status: pending
    dependencies:
      - add-view-state
  - id: transcript-overlay
    content: Create TranscriptOverlay component with karaoke-style progressive opacity. Calculate opacity based on currentTime and display transcript lines with varying font sizes.
    status: pending
    dependencies:
      - add-view-state
  - id: audio-player
    content: Create AudioPlayer component with progress bar, time display, and control buttons (shuffle, prev, play/pause, next, like). Implement audio element management and event handlers.
    status: pending
    dependencies:
      - add-view-state
  - id: memory-detail-card
    content: Create MemoryDetailCard component displaying image, entity name, title, date, and year. Implement responsive layout (horizontal desktop, stacked mobile).
    status: pending
    dependencies:
      - add-view-state
  - id: integrate-detail-view
    content: Add onClick handler to MemoryCard to open detail view. Add back button and navigation (prev/next) in detail view. Update main component to conditionally render browse vs detail view.
    status: pending
    dependencies:
      - video-background
      - transcript-overlay
      - audio-player
      - memory-detail-card
  - id: detail-view-styles
    content: "Add CSS styles for detail view components: video background, transcript overlay, audio player, memory detail card. Ensure responsive breakpoints match Figma design."
    status: pending
    dependencies:
      - integrate-detail-view
  - id: svg-assets
    content: Extract or create SVG icons for shuffle, play, pause, prev, next, and like buttons. Store in src/assets/icons/ or reference from Figma constants.
    status: pending
    dependencies:
      - audio-player
  - id: responsive-testing
    content: Test and refine responsive design for mobile (402px) and desktop (1440px). Verify touch interactions, font sizes, and layout stacking work correctly.
    status: pending
    dependencies:
      - detail-view-styles
---

# Remember View Detail Screen Implementation

## Overview

The Remember page currently has a 3D revolver carousel for browsing memories. Based on the Figma design, we need to add a **detail view** that shows when a memory is selected. This detail view includes:

- Video background (replacing static image)
- Karaoke-style transcript overlay with progressive opacity
- Full audio playback controls
- Memory card with image, title, date, entity name, and year
- Responsive design for desktop and mobile

## Architecture

The implementation will add a new view state to the existing Remember component:

- **Browse Mode**: Current 3D carousel (default)
- **Detail Mode**: Video + transcript + audio player (when memory card is clicked)

## Implementation Steps

### 1. Update Memory Data Structure

**File**: `src/pages/Remember.tsx`Add fields to the `Memory` interface:

- `videoUrl?: string` - Video background for this memory
- `audioUrl: string` - Audio file for playback
- `transcript: TranscriptLine[]` - Array of transcript lines with timestamps
- `entityName?: string` - Entity mentioned in the memory (e.g., "외삼촌")
- `title: string` - Memory title (e.g., "almost")
- `year: number` - Memory year

Create `TranscriptLine` interface:

```typescript
interface TranscriptLine {
  text: string
  startTime: number // seconds
  endTime: number // seconds
  fontSize?: number // For progressive sizing
}
```



### 2. Add View State Management

**File**: `src/pages/Remember.tsx`Add state:

- `viewMode: 'browse' | 'detail'` - Current view mode
- `selectedMemory: Memory | null` - Currently selected memory for detail view
- `audioRef: RefObject<HTMLAudioElement>` - Audio element reference
- `isPlaying: boolean` - Audio playback state
- `currentTime: number` - Current playback time
- `duration: number` - Total audio duration

### 3. Implement Video Background Component

**File**: `src/pages/Remember.tsx`Create `VideoBackground` component:

- Similar to `Landing.tsx` video implementation
- Auto-play, loop, muted
- Full viewport coverage
- Replace static `remember-background` image
- Use memory's `videoUrl` or fallback to default video

### 4. Implement Karaoke Transcript Overlay

**File**: `src/pages/Remember.tsx`Create `TranscriptOverlay` component:

- Display transcript lines with progressive opacity based on `currentTime`
- Opacity calculation: lines near current playback time have higher opacity
- Font size increases for lines closer to current time
- Support multi-language text (Korean + English mixed)
- Position: centered, above memory card

**Opacity formula**:

- Find transcript line closest to `currentTime`
- Calculate distance from current line
- Apply opacity: `1.0` for current line, decreasing for adjacent lines
- Minimum opacity: `0.3` for far lines

### 5. Implement Audio Playback Controls

**File**: `src/pages/Remember.tsx`Create `AudioPlayer` component with:

- **Progress Bar**: Visual progress indicator (use SVG or div-based)
- **Time Display**: Current time / Total time (format: `MM:SS`)
- **Control Buttons**:
- Shuffle (left side)
- Previous (skip to previous memory)
- Play/Pause (center, larger)
- Next (skip to next memory)
- Like (right side)
- **Event Handlers**:
- `onTimeUpdate` - Update `currentTime` state
- `onLoadedMetadata` - Set `duration`
- `onPlay` / `onPause` - Update `isPlaying`
- Seek functionality on progress bar click

Reference existing audio patterns from:

- `src/pages/feed/BuildSwipeExperience.tsx` (audio element management)
- `src/people/store.tsx` (playback controls)

### 6. Implement Memory Detail Card

**File**: `src/pages/Remember.tsx`Create `MemoryDetailCard` component:

- Display memory image with mask shape (from Figma)
- Show entity name (if present) on left
- Show title and date in center
- Show year on right
- Responsive layout: stack on mobile, horizontal on desktop

### 7. Integrate Detail View with Carousel

**File**: `src/pages/Remember.tsx`Update `MemoryCard` component:

- Add `onClick` handler that sets `viewMode` to `'detail'` and `selectedMemory`
- Add visual indicator for clickable cards

Add navigation:

- Back button in detail view to return to browse mode
- Previous/Next buttons in detail view to navigate between memories

### 8. Update CSS for Detail View

**File**: `src/pages/Remember.css`Add styles for:

- `.remember-detail-view` - Container for detail mode
- `.remember-video-background` - Video element styling
- `.remember-transcript-overlay` - Transcript container
- `.remember-transcript-line` - Individual transcript line with opacity transitions
- `.remember-audio-player` - Audio controls container
- `.remember-memory-detail-card` - Memory card in detail view
- Responsive breakpoints for mobile/desktop differences

### 9. Add SVG Assets

**Files**: Extract from Figma or create:

- Shuffle icon SVG
- Play/Pause icon SVG
- Previous/Next arrow icons
- Like icon SVG
- Progress bar SVG (or use CSS)

Store in `src/assets/` or reference from Figma-generated constants.

### 10. Responsive Design

Ensure detail view works on:

- **Desktop** (1440px): Full layout with all elements visible
- **Mobile** (402px): Stacked layout, adjusted font sizes, touch-friendly controls

Reference existing responsive patterns from `Remember.css`.

## Data Flow

```javascript
User clicks memory card
  ↓
Set viewMode = 'detail', selectedMemory = clicked memory
  ↓
Load video background (if available)
  ↓
Load audio file
  ↓
Initialize transcript with timestamps
  ↓
Start audio playback (optional autoplay)
  ↓
Update transcript opacity based on currentTime
  ↓
User interacts with controls (play/pause/seek/next/prev)
  ↓
Update playback state and transcript display
```



## Key Considerations

1. **Audio Autoplay**: Browsers may block autoplay. Handle gracefully with user gesture requirement (similar to `feed/BuildSwipeExperience.tsx`).
2. **Video Performance**: Use `preload="metadata"` and optimize video files. Consider using poster image as fallback.
3. **Transcript Synchronization**: Use `requestAnimationFrame` or audio `timeupdate` event for smooth transcript updates.
4. **Memory Navigation**: When user clicks Previous/Next, load new memory's video/audio/transcript without leaving detail view.
5. **State Persistence**: Consider saving playback position if user navigates away and returns.
6. **Accessibility**: Add ARIA labels, keyboard navigation, and screen reader support.

## Testing Checklist

- [ ] Video background loads and plays correctly
- [ ] Transcript opacity updates smoothly during playback
- [ ] Audio controls work (play, pause, seek, prev, next)
- [ ] Memory navigation works in detail view
- [ ] Responsive design works on mobile and desktop
- [ ] Back button returns to browse mode
- [ ] Shuffle button selects random memory
- [ ] Like button toggles state (if backend integration needed)
- [ ] Multi-language text renders correctly
- [ ] Performance is smooth (60fps transcript updates)

## Files to Modify

1. `src/pages/Remember.tsx` - Main component logic
2. `src/pages/Remember.css` - Styling for detail view
3. `src/components/Header.tsx` - May need updates if header changes in detail view
4. `src/components/Footer.tsx` - May need updates if footer changes in detail view

## Files to Create (if needed)

1. `src/assets/icons/shuffle.svg` - Shuffle icon
2. `src/assets/icons/play.svg` - Play icon
3. `src/assets/icons/pause.svg` - Pause icon
4. `src/assets/icons/prev.svg` - Previous icon
5. `src/assets/icons/next.svg` - Next icon
6. `src/assets/icons/like.svg` - Like icon

## Dependencies

No new dependencies required. Use existing:

- React hooks (`useState`, `useRef`, `useEffect`, `useCallback`, `useMemo`)
- HTML5 `<video>` and `<audio>` elements