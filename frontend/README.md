# Spotify Clone - Frontend Configuration

This frontend is built with **Angular** and **NgRx** state management.

## Key Features

- 🎵 **Smart Song Search** - Search across Spotify, Deezer, and local cache
- 🎯 **Gesture-Based Queue** - Swipe right on song cards to queue
- 📋 **Playlist Import** - Import Spotify/Deezer playlists effortlessly
- ⏱️ **Sleep Timer** - Set automatic playback stop timers
- 🔄 **Real-time Sync** - Queue updates reflected across components

## Technologies

- Angular 17+ with standalone components
- NgRx for centralized state management
- HammerJS for gesture detection
- Tailwind CSS for styling
- RxJS for reactive programming

## Getting Started

### Install Dependencies
\`\`\`bash
npm install
\`\`\`

### Development Server
\`\`\`bash
ng serve
# Navigate to http://localhost:4200/
\`\`\`

### Build for Production
\`\`\`bash
ng build --configuration production
\`\`\`

## Project Structure

```
src/
├── app/
│   ├── modules/              # Feature modules
│   │   ├── home/
│   │   ├── player/
│   │   └── import/
│   ├── services/             # HTTP & Business logic services
│   ├── store/                # NgRx state management
│   │   ├── auth/
│   │   ├── songs/
│   │   ├── queue/
│   │   └── playlists/
│   ├── directives/           # Custom directives (SwipeDirective)
│   └── app.module.ts
├── environments/             # Environment configs
└── styles.scss               # Global styles
```

## Store Architecture

All state is managed through NgRx with separate feature stores:

- **Auth**: Login state, user profile, tokens
- **Songs**: Search results, song data
- **Queue**: Current playback queue, sleep timer
- **Playlists**: User playlists, import status

## Environment Variables

Update `environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api'
};
```
