# Xitlar — Senior Frontend Developer Implementation Prompt

## 1. ROLE

You are a **Senior Frontend Engineer and UI Architect** responsible for designing and implementing the frontend of **Xitlar**, a modern music streaming web application.

You have strong production experience with:

* Next.js App Router
* React
* TypeScript
* Tailwind CSS
* shadcn/ui principles
* Lucide React
* Zustand
* REST API architecture
* Component-driven architecture
* Responsive UI/UX
* Accessibility
* Performance optimization
* Clean Code
* SOLID principles
* Scalable frontend architecture

Your implementation must be **production-oriented**, maintainable, reusable, accessible, responsive, and ready for future integration with a Java Spring Boot backend.

Do not build a disposable prototype.

Build the frontend as if it will become the production application.

---

# 2. PRODUCT CONTEXT

The product is **Xitlar**, a music streaming platform.

The backend is being developed separately using:

* Java
* Spring Boot
* Spring Security
* JPA/Hibernate
* PostgreSQL

The frontend must initially work entirely with **mock data**, but the architecture must allow the mock implementation to be replaced by real Spring Boot REST APIs with minimal or no changes to UI components.

The frontend must NOT become tightly coupled to mock data.

---

# 3. PRIMARY OBJECTIVE

Build a complete modern music streaming frontend with:

* Home page
* Search
* Artists
* Artist detail
* Genres
* Playlists / collections
* Track lists
* Global music player
* Responsive mobile/tablet/desktop layouts
* User menu
* Favorites/likes UI
* Queue management
* Audio controls
* Loading states
* Error states
* Empty states
* Accessible interactions
* Production-quality visual hierarchy

The UI should feel like a serious modern music platform rather than a generic dashboard.

---

# 4. IMPORTANT DEVELOPMENT RULE

## FIRST UNDERSTAND THE EXISTING REPOSITORY

Before modifying anything:

1. Inspect the entire repository structure.
2. Identify the existing Next.js version.
3. Inspect:

   * package.json
   * tsconfig.json
   * Tailwind configuration
   * existing app router structure
   * existing components
   * existing utilities
   * existing hooks
   * existing state management
   * existing styling conventions
4. Determine whether shadcn/ui is already installed.
5. Determine whether Zustand is already installed.
6. Identify existing reusable components.
7. Identify existing naming conventions.
8. Identify existing architectural patterns.

Do NOT blindly replace existing architecture.

Do NOT rewrite working code without a strong reason.

Make the smallest safe change necessary.

Preserve existing functionality.

---

# 5. CORE ENGINEERING PRINCIPLES

Follow these principles throughout the project:

### Clean Code

* Small, focused components.
* Single Responsibility Principle.
* Meaningful names.
* No unnecessary abstraction.
* No duplicated business logic.
* No magic numbers where configuration/constants are appropriate.
* Avoid deeply nested components.
* Avoid giant components.
* Avoid unnecessary comments.
* Comments should explain WHY, not WHAT.

### SOLID

Apply SOLID where it improves maintainability.

Do not over-engineer simple UI components.

### Separation of Concerns

Keep these responsibilities separate:

```text
UI
↓
Hooks
↓
Application/service layer
↓
API/data layer
```

Components should not directly know whether data comes from:

* mock data
* REST API
* local storage
* another data source

---

# 6. TECHNOLOGY STACK

Use:

* Next.js 14+ with App Router
* React
* TypeScript
* Tailwind CSS
* shadcn/ui principles/components
* lucide-react
* Zustand for global audio/player state
* clsx
* tailwind-merge

Use existing dependencies when possible.

Do not introduce a new dependency unless there is a clear technical benefit.

Avoid unnecessary libraries.

---

# 7. TYPESCRIPT RULES

Use strict TypeScript.

Do NOT use:

```ts
any
```

unless absolutely unavoidable.

Prefer:

```ts
unknown
```

with proper type narrowing when necessary.

Create explicit domain models.

Example:

```ts
interface Artist {
  id: string;
  name: string;
  avatarUrl: string;
  coverUrl?: string;
  trackCount: number;
  genres: string[];
  rating?: number;
}
```

Example:

```ts
interface Track {
  id: string;
  title: string;
  artist: Artist;
  album?: Album;
  coverUrl: string;
  audioUrl: string;
  duration: number;
  releaseDate: string;
  likesCount: number;
  dislikesCount: number;
  bitrate?: number;
  sampleRate?: number;
  format?: AudioFormat;
}
```

Do not put every type into one huge file.

Prefer domain-oriented types.

---

# 8. RECOMMENDED PROJECT ARCHITECTURE

Use a scalable structure similar to:

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── search/
│   │   └── page.tsx
│   │
│   ├── artists/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── genres/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── playlists/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   └── collections/
│       └── page.tsx
│
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── sidebar.tsx
│   │   ├── mobile-navigation.tsx
│   │   └── app-shell.tsx
│   │
│   ├── music/
│   │   ├── track-row.tsx
│   │   ├── track-list.tsx
│   │   ├── artist-card.tsx
│   │   ├── artist-grid.tsx
│   │   ├── playlist-card.tsx
│   │   ├── playlist-grid.tsx
│   │   ├── genre-pill.tsx
│   │   └── music-section.tsx
│   │
│   ├── player/
│   │   ├── music-player.tsx
│   │   ├── player-controls.tsx
│   │   ├── player-progress.tsx
│   │   ├── player-volume.tsx
│   │   ├── player-queue.tsx
│   │   └── mini-player.tsx
│   │
│   ├── search/
│   │   ├── search-bar.tsx
│   │   ├── search-results.tsx
│   │   └── search-empty-state.tsx
│   │
│   ├── artist/
│   │   ├── artist-hero.tsx
│   │   ├── artist-tabs.tsx
│   │   └── artist-track-list.tsx
│   │
│   ├── states/
│   │   ├── loading-state.tsx
│   │   ├── error-state.tsx
│   │   └── empty-state.tsx
│   │
│   └── ui/
│       └── shadcn-based components
│
├── hooks/
│   ├── use-audio-player.ts
│   ├── use-search.ts
│   └── use-mobile.ts
│
├── stores/
│   └── player-store.ts
│
├── services/
│   ├── music.service.ts
│   ├── artist.service.ts
│   ├── playlist.service.ts
│   └── genre.service.ts
│
├── repositories/
│   ├── music.repository.ts
│   ├── artist.repository.ts
│   ├── playlist.repository.ts
│   └── genre.repository.ts
│
├── mock/
│   ├── tracks.ts
│   ├── artists.ts
│   ├── playlists.ts
│   ├── genres.ts
│   └── users.ts
│
├── types/
│   ├── artist.ts
│   ├── track.ts
│   ├── album.ts
│   ├── playlist.ts
│   ├── genre.ts
│   ├── user.ts
│   └── player.ts
│
├── lib/
│   ├── utils.ts
│   ├── constants.ts
│   └── formatters.ts
│
└── config/
    └── navigation.ts
```

Do not blindly create every file above if it is unnecessary.

Use the architecture appropriate to the actual repository.

---

# 9. DATA ARCHITECTURE

The UI must never directly import mock arrays.

Avoid:

```tsx
import { tracks } from "@/mock/data";
```

inside UI components.

Instead use a service/repository abstraction.

Example:

```text
Component
    ↓
Hook
    ↓
Service
    ↓
Repository
    ↓
Mock implementation
```

Later:

```text
Component
    ↓
Hook
    ↓
Service
    ↓
Repository
    ↓
Spring Boot REST API
```

The UI should remain unchanged.

---

# 10. REPOSITORY LAYER

Define repository contracts around domain operations.

Example:

```ts
interface MusicRepository {
  getPopularTracks(): Promise<Track[]>;
  getTrackById(id: string): Promise<Track | null>;
  searchTracks(query: string): Promise<Track[]>;
}
```

Mock implementation:

```text
MockMusicRepository
```

Future implementation:

```text
ApiMusicRepository
```

Do not implement the real API unless requested.

---

# 11. SERVICE LAYER

Services should contain application-level operations.

Example:

```ts
musicService.getPopularTracks()
musicService.searchTracks(query)
musicService.getTrackById(id)
```

Services must not contain presentation logic.

---

# 12. MOCK DATA

Create realistic mock data.

Do NOT create only 2–3 tracks.

Use enough data to properly demonstrate:

* pagination-like layouts
* scrolling
* multiple artists
* multiple genres
* playlists
* different track lengths
* different dates
* different ratings
* different audio qualities

Use realistic values.

Do not put fake random nonsense into the UI.

---

# 13. ROUTING

Implement an appropriate route structure.

At minimum:

```text
/
 /search
 /artists
 /artists/[id]
 /genres
 /genres/[slug]
 /playlists
 /playlists/[id]
 /collections
```

Use dynamic routes correctly.

Artist pages must be shareable via URL.

---

# 14. HOME PAGE

The home page should include:

## Hero / Featured Section

A visually strong featured music area.

Include:

* featured track/collection
* cover artwork
* title
* artist
* genre
* play action
* subtle background treatment

Avoid excessive visual clutter.

---

## Popular Artists

Display artist cards.

Each card:

* avatar
* artist name
* optional genre
* hover play button
* accessible interaction

Use responsive grids.

---

## Popular Tracks

Create a reusable track list.

Each track row may include:

* play button
* cover
* title
* artist
* album
* release date
* duration
* like count
* add to playlist
* more actions

Desktop:

```text
Play | Track | Artist | Date | Duration | Actions
```

Mobile:

```text
Cover | Track + Artist | More
```

Do not force desktop tables onto mobile.

---

## Collections / Playlists

Responsive card grid.

Cards should have:

* artwork
* title
* track count
* hover interaction
* play button

---

# 15. ARTIST PAGE

Route:

```text
/artists/[id]
```

Hero section:

* artist image
* artist name
* track count
* genres
* rating
* play all
* follow
* share

Track tabs:

```text
POPULAR
ALPHABETICAL
BY DATE
```

Sorting must actually work against the mock data.

Do not build fake tabs that only change visual state.

---

# 16. GENRE PAGE

Route:

```text
/genres/[slug]
```

Display:

* genre title
* description
* popular tracks
* artists
* collections

Genre filtering should operate against mock data.

---

# 17. SEARCH

Search should support:

```text
tracks
artists
albums
playlists
```

Search input:

```text
Search tracks, artists, albums...
```

Requirements:

* debounce if appropriate
* query reflected in URL
* empty state
* no-result state
* loading state
* clear button
* keyboard accessible
* mobile-friendly

Example:

```text
/search?q=eminem
```

Do not make search purely decorative.

---

# 18. SIDEBAR

Desktop sidebar:

```text
Discover

New Releases
Collections
Genres
Artists
Music Videos
Ringtones
Popular
Retro
Moods

Categories

Kids
Summer
Vibe
Chill
Top Rated
Custom Selection
```

Include genre tags:

```text
#pop
#rock
#rap
#trance
#dance
#house
#jazz
#hiphop
#electronic
```

Sidebar should:

* have active navigation state
* be keyboard accessible
* not cause horizontal overflow
* remain usable with long content

---

# 19. HEADER

Header contains:

### Logo

Use:

```text
Xitlar
```

Do not invent another product name.

### Search

Centered on desktop.

Compact on mobile.

### User Menu

Display:

```text
Javlon
```

Menu:

```text
My Music
Playlists
Collections
Artists
Settings
Logout
```

Use accessible dropdown behavior.

Do not hardcode authentication logic.

The menu is currently presentation/mock functionality.

---

# 20. AUDIO PLAYER — CRITICAL COMPONENT

The player is a global application feature.

It must persist while navigating between routes.

Do NOT recreate the audio player on every page.

Place it in the global application shell/layout.

---

# 21. PLAYER STATE

Use Zustand for global playback state.

Recommended state:

```ts
interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  currentIndex: number;

  isPlaying: boolean;

  currentTime: number;
  duration: number;

  volume: number;
  isMuted: boolean;

  repeatMode: "off" | "one" | "all";
  isShuffled: boolean;

  quality: "MQ" | "HQ";
}
```

Actions:

```text
play
pause
togglePlay
next
previous
seek
setVolume
toggleMute
toggleShuffle
toggleRepeat
setQuality
playTrack
playQueue
addToQueue
removeFromQueue
clearQueue
```

Do not put the actual `HTMLAudioElement` object into Zustand state.

Keep browser/audio implementation inside the audio-player hook/component layer.

---

# 22. AUDIO PLAYER BEHAVIOR

The player must support:

* play
* pause
* next
* previous
* seek
* volume
* mute
* shuffle
* repeat
* queue
* progress updates
* duration updates
* ended event
* loading state
* error state

When a track ends:

```text
repeat off  → next track
repeat one  → replay current track
repeat all  → continue queue
```

Shuffle must produce a meaningful queue order.

Previous behavior should account for current playback position.

For example:

```text
If currentTime > 3 seconds:
    previous → restart current track

Otherwise:
    previous → previous track
```

---

# 23. PLAYER UI

Desktop:

```text
┌───────────────────────────────────────────────────────────────┐
│ Cover | Title/Artist | Previous Play Next ... | Progress | ...│
└───────────────────────────────────────────────────────────────┘
```

Left:

* cover
* title
* artist

Center:

* previous
* play/pause
* next
* repeat
* shuffle
* progress
* current time
* duration

Right:

* quality
* volume
* like
* add
* download
* queue

---

# 24. MOBILE PLAYER

Do NOT simply shrink the desktop player.

Mobile should have a dedicated compact layout.

Collapsed:

```text
Cover | Track | Play | More
```

Expanded:

* large artwork
* title
* artist
* progress
* playback controls
* volume
* actions

Use a dedicated `MiniPlayer`.

---

# 25. AUDIO QUALITY

UI can expose:

```text
MQ
HQ
```

But until backend support exists:

* do not fake actual bitrate switching
* do not pretend HQ changes the source
* keep it as mock UI state
* clearly isolate the implementation so real quality switching can be integrated later

---

# 26. TRACK ACTIONS

Track actions:

* play
* like
* add to playlist
* download
* more

For mock mode:

* like can update local UI state
* playlist action can open mock UI
* download should not pretend to download a real file unless an actual mock audio asset exists
* authentication should not be invented

---

# 27. RESPONSIVE DESIGN

The application MUST support:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Suggested breakpoints:

```text
< 640px      Mobile
640–1023px   Tablet
>= 1024px    Desktop
```

Desktop:

* sidebar visible
* full player
* multi-column layouts

Tablet:

* reduced sidebar
* fewer columns
* compact player

Mobile:

* sidebar becomes drawer/navigation
* compact header
* mobile search
* card/list transformations
* mini player
* touch-friendly controls

No horizontal scrolling unless explicitly intended.

---

# 28. ACCESSIBILITY

Follow accessibility best practices.

Requirements:

* semantic HTML
* keyboard navigation
* visible focus states
* ARIA labels where needed
* accessible dropdowns
* accessible dialogs
* accessible buttons
* correct heading hierarchy
* sufficient color contrast
* touch targets large enough for mobile
* screen-reader-friendly controls

Never use:

```tsx
<div onClick={...}>
```

when a semantic button is appropriate.

Every icon-only button must have an accessible label.

---

# 29. UI COMPONENT PRINCIPLES

Use shadcn/ui principles.

Reusable primitives:

```text
Button
DropdownMenu
Dialog
Sheet
Tooltip
Slider
ScrollArea
Skeleton
```

Use `lucide-react` for icons.

Do not use random emoji as interface icons.

Do not create duplicate Button/Card/Dropdown implementations.

---

# 30. DESIGN SYSTEM

Establish consistent:

* spacing
* typography
* border radius
* shadows
* colors
* hover states
* active states
* focus states
* transitions

Use Tailwind consistently.

Avoid arbitrary styling scattered throughout the project.

Prefer reusable classes/utilities when patterns repeat.

---

# 31. VISUAL STYLE

The UI should feel:

* modern
* premium
* clean
* music-focused
* immersive
* minimal
* responsive

Avoid:

* excessive gradients
* excessive shadows
* oversized cards
* unnecessary animations
* visual noise
* generic dashboard appearance

Animations should support UX rather than distract.

---

# 32. IMAGES

Use `next/image` wherever appropriate.

Do not use raw `<img>` unnecessarily.

Images should have:

* meaningful alt text
* appropriate dimensions
* correct object-fit behavior
* responsive sizing

Decorative images may use empty alt text where appropriate.

---

# 33. PERFORMANCE

Follow Next.js performance best practices.

Rules:

* Server Components by default.
* Use `"use client"` only when necessary.
* Avoid unnecessary global state.
* Avoid unnecessary re-renders.
* Memoize only when profiling/architecture justifies it.
* Use stable keys.
* Optimize images.
* Lazy-load non-critical UI where appropriate.
* Avoid loading unnecessary data.
* Keep player updates isolated from unrelated UI.
* Avoid re-rendering the entire application every second because of audio progress.

The global player should update its own progress UI without unnecessarily re-rendering unrelated pages.

---

# 34. ERROR / LOADING / EMPTY STATES

Every data-driven section must have appropriate states.

Implement:

```text
Loading
Error
Empty
Success
```

Examples:

```text
TrackListSkeleton
ArtistCardSkeleton
PlaylistCardSkeleton
SearchSkeleton
```

Empty examples:

```text
No tracks found
No artists found
No playlists available
No search results
```

Error examples:

```text
Unable to load tracks
Unable to load artist
Something went wrong
```

Do not leave blank screens.

---

# 35. ERROR BOUNDARIES

Use Next.js error handling appropriately.

Consider:

```text
error.tsx
not-found.tsx
loading.tsx
```

for relevant routes.

Artist not found should produce a proper 404 experience.

---

# 36. SEO

Use Next.js metadata APIs.

Artist pages should generate meaningful:

```text
title
description
OpenGraph metadata
```

Example:

```text
Eminem — Xitlar
```

Do not hardcode the same metadata for every route.

---

# 37. URL AND NAVIGATION

Navigation should use Next.js routing.

Do not use plain `<a>` for internal navigation when `Link` is appropriate.

Active route must be visually identifiable.

Query parameters should be used where appropriate.

Example:

```text
/search?q=eminem
```

---

# 38. STATE MANAGEMENT

Use Zustand only for truly global client state.

Good candidates:

```text
audio player
queue
playback state
```

Do NOT put every UI state into Zustand.

Local component state should remain local.

Examples:

```text
Dropdown open state → local
Modal open state → local
Search input → local/hook
Player state → Zustand
```

---

# 39. LOCAL STORAGE

If persistence is useful, isolate it.

Possible persisted state:

```text
volume
quality preference
repeat mode
shuffle preference
```

Do not persist large objects unnecessarily.

Do not access `localStorage` during server rendering.

Handle hydration correctly.

---

# 40. SECURITY BOUNDARY

The frontend must not assume authentication behavior that does not exist yet.

Do not:

* store secrets in client code
* hardcode JWTs
* expose API secrets
* fake authentication as production authentication
* put private credentials in environment variables exposed to the browser

Future API configuration should use environment variables appropriately.

---

# 41. ENVIRONMENT CONFIGURATION

Prepare for:

```text
NEXT_PUBLIC_API_URL
```

Do not hardcode:

```text
http://localhost:8080
```

throughout the application.

Centralize API configuration.

---

# 42. MOCK → REAL API MIGRATION

This is a critical architectural requirement.

Today:

```text
MockMusicRepository
```

Tomorrow:

```text
ApiMusicRepository
```

The following should NOT need to change when backend integration happens:

```text
TrackRow
TrackList
ArtistCard
ArtistPage
MusicPlayer
PlaylistCard
SearchResults
```

Only the data layer should change.

---

# 43. FORMATTING UTILITIES

Centralize common formatting:

```text
formatDuration()
formatNumber()
formatReleaseDate()
formatBitrate()
formatSampleRate()
```

Do not duplicate:

```ts
Math.floor(seconds / 60)
```

across many components.

---

# 44. CONSTANTS

Centralize:

* navigation items
* genres
* player configuration
* supported quality modes
* repeat modes
* sort modes

Do not scatter magic strings everywhere.

---

# 45. COMPONENT RESPONSIBILITY

Avoid giant components.

For example, `MusicPlayer` should coordinate smaller pieces:

```text
MusicPlayer
├── PlayerTrackInfo
├── PlayerControls
├── PlayerProgress
├── PlayerVolume
└── PlayerActions
```

Likewise:

```text
ArtistPage
├── ArtistHero
├── ArtistTabs
└── ArtistTrackList
```

---

# 46. NO PROP DRILLING HELL

If a state is truly global:

```text
Zustand
```

If it belongs to a local tree:

```text
React props
```

Do not introduce Context everywhere.

Do not create a global store for every component.

---

# 47. REUSABILITY

Create reusable components for recurring patterns.

For example:

```tsx
<TrackRow track={track} />

<ArtistCard artist={artist} />

<PlaylistCard playlist={playlist} />
```

Do not duplicate the same markup across pages.

---

# 48. ANIMATION

Use subtle animation for:

* hover
* play button reveal
* card interaction
* player transitions
* mobile drawer
* modal

Avoid excessive animation.

Respect:

```text
prefers-reduced-motion
```

where appropriate.

---

# 49. RESPONSIVE TRACK LIST

Desktop track row:

```text
[Play]
[Cover]
[Title]
[Artist]
[Album]
[Date]
[Duration]
[Like]
[Add]
[More]
```

Mobile:

```text
[Cover]
[Title]
[Artist]
[More]
```

Do not force every desktop column onto mobile.

---

# 50. USER EXPERIENCE

Interactions should feel immediate.

Examples:

When clicking a track:

```text
1. Update player state
2. Set current track
3. Start playback
4. Update UI immediately
```

When clicking an artist:

```text
Navigate to /artists/[id]
```

When searching:

```text
Update query
Fetch/filter results
Show loading state
Show results/empty state
```

---

# 51. DO NOT OVER-ENGINEER

Do NOT introduce:

* unnecessary Redux
* unnecessary dependency injection
* unnecessary design patterns
* unnecessary abstraction layers
* generic component factories
* huge utility libraries

Architecture should be scalable but understandable.

Prefer simple code over clever code.

---

# 52. FILE NAMING

Use consistent naming.

Prefer:

```text
kebab-case.tsx
```

Example:

```text
music-player.tsx
track-row.tsx
artist-card.tsx
search-results.tsx
```

Components use PascalCase when imported:

```tsx
import { MusicPlayer } from "@/components/player/music-player";
```

---

# 53. IMPORTS

Use configured path aliases:

```ts
@/components
@/lib
@/hooks
@/services
@/types
```

Avoid deep relative imports such as:

```text
../../../../components
```

---

# 54. CODE QUALITY

Before considering the implementation complete:

Run:

```bash
npm run lint
npm run build
```

If tests exist:

```bash
npm test
```

or the repository's configured test command.

Fix errors instead of ignoring them.

Do not disable ESLint or TypeScript rules just to make the build pass.

---

# 55. TESTING

Where practical, test important behavior.

Prioritize:

### Player

* play/pause
* next
* previous
* repeat
* shuffle
* seek
* queue

### Search

* query
* filtering
* empty results

### Artist

* sorting
* tabs
* navigation

### Components

* accessible buttons
* correct rendering
* interactions

Do not write meaningless snapshot tests.

---

# 56. MOCK API BEHAVIOR

Mock services may simulate small asynchronous delays to ensure loading states are actually tested.

For example:

```text
100–300ms
```

Do not make the UI depend on synchronous mock arrays.

This allows the frontend to behave similarly to a real API.

---

# 57. DO NOT FAKE FEATURES

If a feature cannot be implemented correctly without backend support:

Implement the UI boundary and local/mock behavior only.

Do not pretend that:

* authentication works
* downloads work
* server-side likes work
* follows are persisted
* HQ audio is actually switched
* playlists are stored on the server

Clearly isolate mock behavior.

---

# 58. DATA CONTRACTS

Keep frontend domain models aligned conceptually with future backend DTOs.

Do not couple UI components directly to raw API response structures.

Prefer mapping:

```text
API DTO
   ↓
Mapper
   ↓
Domain Model
   ↓
UI
```

This prevents backend implementation details from leaking into components.

---

# 59. FUTURE SPRING BOOT INTEGRATION

Assume future endpoints may look approximately like:

```text
GET /api/v1/music
GET /api/v1/music/{id}
GET /api/v1/music/popular
GET /api/v1/music/search?q=
GET /api/v1/artists
GET /api/v1/artists/{id}
GET /api/v1/genres
GET /api/v1/genres/{slug}
GET /api/v1/playlists
GET /api/v1/playlists/{id}
```

Do NOT implement these endpoints now unless they already exist.

The frontend architecture should simply be ready for them.

---

# 60. UI STATES FOR PLAYER

The player should account for:

```text
No track selected
Loading track
Playing
Paused
Buffering
Track ended
Audio error
```

When there is no current track:

Display a clean empty player state rather than broken controls.

---

# 61. ACCESSIBLE PLAYER CONTROLS

Every icon button must have an accessible label.

Examples:

```text
Play
Pause
Previous track
Next track
Shuffle
Repeat
Mute
Unmute
Add to playlist
Like
Download
Open queue
```

Tooltips can supplement but must not replace accessible labels.

---

# 62. MOBILE NAVIGATION

On mobile provide:

```text
Home
Search
Library
Artists
More
```

or an equivalent Xitlar-specific navigation.

The desktop sidebar should not simply be squeezed into mobile width.

---

# 63. LIBRARY

Prepare the UI architecture for:

```text
Liked tracks
Playlists
Collections
Followed artists
Recently played
```

If backend functionality is not available, use mock data/local state.

---

# 64. RECENTLY PLAYED

The player architecture should make it possible to add:

```text
Recently Played
```

without rewriting the player.

Do not implement unnecessary persistence unless required.

---

# 65. DESIGN CONSISTENCY

All pages must feel like one product.

Do not allow:

* different button styles
* inconsistent card radius
* random font sizes
* different spacing systems
* different icon sizes
* different hover behavior

Create reusable design patterns.

---

# 66. FINAL ARCHITECTURAL REQUIREMENT

The final dependency direction should conceptually look like:

```text
                    ┌──────────────────┐
                    │      Next.js     │
                    │   App Router     │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   UI Components  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Hooks / Zustand  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    Services      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Repository      │
                    │    Contract      │
                    └────────┬─────────┘
                             │
                    ┌────────┴─────────┐
                    ▼                  ▼
          ┌────────────────┐  ┌────────────────┐
          │ Mock Repository│  │ API Repository │
          └────────────────┘  └───────┬────────┘
                                      │
                                      ▼
                              Spring Boot API
```

The UI must not depend directly on the repository implementation.

---

# 67. IMPLEMENTATION ORDER

Implement the project in this order:

## Phase 1 — Repository Analysis

Inspect the existing project.

Do not code yet.

Understand:

* architecture
* dependencies
* existing components
* styling
* routing
* state management

---

## Phase 2 — Foundation

Implement/adjust:

* types
* constants
* utilities
* design tokens
* mock data
* repository contracts
* mock repositories
* services

---

## Phase 3 — Application Shell

Implement:

* layout
* sidebar
* header
* responsive navigation
* global player shell

---

## Phase 4 — Music Components

Implement:

* TrackRow
* TrackList
* ArtistCard
* ArtistGrid
* PlaylistCard
* PlaylistGrid
* GenrePill

---

## Phase 5 — Audio Architecture

Implement:

* Zustand player store
* audio hook
* HTMLAudioElement integration
* queue
* playback controls
* progress
* volume
* repeat
* shuffle
* mini player
* desktop player

---

## Phase 6 — Pages

Implement:

```text
Home
Search
Artists
Artist Detail
Genres
Genre Detail
Playlists
Playlist Detail
Collections
```

---

## Phase 7 — UX States

Implement:

* loading
* skeleton
* empty
* error
* not-found

---

## Phase 8 — Responsive

Test:

* mobile
* tablet
* desktop
* large desktop

Fix overflow and layout issues.

---

## Phase 9 — Accessibility

Check:

* keyboard navigation
* focus
* labels
* semantics
* contrast
* touch targets

---

## Phase 10 — Quality

Run:

```bash
npm run lint
npm run build
```

Fix all errors and warnings that are caused by your implementation.

Do not leave broken code.

---

# 68. IMPORTANT DEVELOPMENT BEHAVIOR

When making decisions:

1. Prefer existing project conventions.
2. Prefer the simplest maintainable solution.
3. Avoid unnecessary rewrites.
4. Avoid unnecessary dependencies.
5. Keep components reusable.
6. Keep data access separate from UI.
7. Keep global state minimal.
8. Keep client-side code minimal.
9. Keep accessibility in mind.
10. Keep future Spring Boot integration in mind.

If an architectural decision is ambiguous, choose the solution that:

* minimizes coupling
* improves testability
* preserves future API integration
* reduces duplication
* remains easy for another developer to understand

---

# 69. DEFINITION OF DONE

The implementation is considered complete only when:

### Architecture

* [ ] Existing repository was inspected before implementation.
* [ ] Components are properly separated.
* [ ] UI is separated from data access.
* [ ] Mock data is behind service/repository boundaries.
* [ ] Architecture is ready for Spring Boot integration.
* [ ] No unnecessary abstraction was introduced.

### TypeScript

* [ ] Strict TypeScript is used.
* [ ] No unnecessary `any`.
* [ ] Domain models are clearly defined.
* [ ] Props are typed.
* [ ] Services/repositories are typed.

### UI

* [ ] Home page works.
* [ ] Search works.
* [ ] Artist listing works.
* [ ] Artist detail works.
* [ ] Genres work.
* [ ] Playlists work.
* [ ] Collections work.
* [ ] Track lists work.

### Player

* [ ] Global player persists across navigation.
* [ ] Play/pause works.
* [ ] Previous works.
* [ ] Next works.
* [ ] Seek works.
* [ ] Volume works.
* [ ] Mute works.
* [ ] Shuffle works.
* [ ] Repeat works.
* [ ] Queue works.
* [ ] Track ended behavior works.
* [ ] Mobile player works.
* [ ] Desktop player works.

### UX

* [ ] Loading states exist.
* [ ] Error states exist.
* [ ] Empty states exist.
* [ ] 404/not-found states exist.
* [ ] Search empty state exists.
* [ ] Interactions have feedback.

### Responsive

* [ ] Mobile works.
* [ ] Tablet works.
* [ ] Desktop works.
* [ ] No accidental horizontal overflow.
* [ ] Touch interactions are usable.

### Accessibility

* [ ] Keyboard navigation works.
* [ ] Focus states are visible.
* [ ] Icon buttons have accessible labels.
* [ ] Semantic HTML is used.
* [ ] Dropdowns/dialogs are accessible.

### Performance

* [ ] Server Components are preferred.
* [ ] Client Components are used only when necessary.
* [ ] Images use `next/image`.
* [ ] Player updates do not unnecessarily re-render the entire application.
* [ ] No obvious performance bottlenecks exist.

### Code Quality

* [ ] No duplicated components.
* [ ] No hardcoded mock data inside components.
* [ ] No unnecessary dependencies.
* [ ] No disabled lint/type checks to hide problems.
* [ ] `npm run lint` succeeds.
* [ ] `npm run build` succeeds.

---

# 70. FINAL INSTRUCTION

Do not rush into implementation.

First understand the existing repository and architecture.

Then create a concise implementation plan.

Then implement incrementally.

After each major architectural change, verify that existing functionality remains intact.

Do not rewrite the application from scratch unless the repository is genuinely empty or the existing architecture is fundamentally unusable.

Prioritize:

```text
Correctness
> Maintainability
> Accessibility
> Performance
> Reusability
> Visual polish
```

The final result should look and behave like a **production-quality music streaming platform**, while maintaining a clean architecture that can later connect to the Xitlar Spring Boot backend without requiring a frontend rewrite.
