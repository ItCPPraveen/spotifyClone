# YouTube Music Clone - Full Stack Music Discovery & Management

A comprehensive, production-ready music discovery and management application built with **Angular 17**, **NestJS**, **MongoDB**, and **Redis**.

## 🎯 Project Overview

This application implements a "Database-First" caching strategy with advanced features including:

✅ **Smart Caching** - Multi-source search (YouTube, Spotify, MongoDB)
✅ **Gesture-Based Queueing** - Swipe-to-queue with mobile support
✅ **Playlist Migration** - Import playlists from YouTube/Spotify
✅ **Sleep Timer** - Auto-pause with configurable duration
✅ **OAuth2 Authentication** - Secure Google login
✅ **NgRx State Management** - Reactive, predictable state handling
✅ **Rate Limiting** - Handled API rate limits with retry logic

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Angular Frontend                        │
│  (ngx-hammer, NgRx Store, Tailwind CSS)                 │
└────────────────┬────────────────────────────────────────┘
                 │ REST API
                 │
┌────────────────▼────────────────────────────────────────┐
│                  NestJS Backend                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Auth Module (OAuth2)     │  Songs Module        │  │
│  │  Queue Module             │  Playlists Module    │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──┐    ┌────▼───┐   ┌───▼──┐
│Mongo │    │ Spotify │   │ YouTube
│ DB   │    │ API     │   │ API
└──────┘    └─────────┘   └──────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Deezer Developer credentials
- Redis (optional, for advanced caching)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
# Visit http://localhost:4200
```

---

## 📋 Environment Variables

### Backend (.env)

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/deezer-clone

# Deezer OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:4200
```

### Frontend (environment.ts)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
};
```

---

## 🔌 API Documentation

### Authentication Endpoints

```
GET  /api/auth/login                    → Get Deezer OAuth URL
POST /api/auth/callback                 → Handle OAuth callback
GET  /api/auth/profile                  → Get current user (Protected)
POST /api/auth/refresh                  → Refresh JWT token (Protected)
```

### Songs Endpoints

```
GET  /api/songs/search?q=query&limit=20 → Search across all sources
GET  /api/songs/recent?limit=50         → Get recently cached songs
GET  /api/songs/:id                     → Get song by ID
GET  /api/songs/cache/stats             → Cache statistics
```

### Playlists Endpoints

```
GET  /api/playlists                     → Get user's playlists (Protected)
POST /api/playlists                     → Create playlist (Protected)
GET  /api/playlists/:id                 → Get playlist details
POST /api/playlists/import              → Import from URL (Protected)
POST /api/playlists/:id/songs/:songId   → Add song to playlist (Protected)
DELETE /api/playlists/:id/songs/:songId → Remove song (Protected)
DELETE /api/playlists/:id               → Delete playlist (Protected)
```

### Queue Endpoints

```
GET  /api/queue                         → Get current queue (Protected)
POST /api/queue/add/:songId             → Add to queue (Protected)
DELETE /api/queue/remove/:songId        → Remove from queue (Protected)
DELETE /api/queue/clear                 → Clear queue (Protected)
POST /api/queue/play/:songId            → Play specific song (Protected)
POST /api/queue/sleep-timer             → Set sleep timer (Protected)
GET  /api/queue/sleep-timer             → Get sleep timer status (Protected)
```

---

## 📦 Database Schemas

### Song Schema

```javascript
{
  title: String,              // Required
  artist: String,             // Required
  album: String,
  cover_url: String,
  duration_ms: Number,        // Duration in milliseconds
  youtube_id: String,         // Unique YouTube video ID (primary)
  spotify_id: String,         // Unique Spotify ID (fallback)
  api_source: String,         // 'youtube' | 'spotify' | 'internal'
  preview_url: String,
  popularity: Number,         // 0-100
  isrc: String,               // International Standard Recording Code
  cached_at: Date,            // When added to cache
  cache_expires_at: Date,     // Expiration (24h from cached_at)
  createdAt: Date,
  updatedAt: Date
}
```

### Playlist Schema

```javascript
{
  name: String,               // Required
  owner: String,              // User ID - Required
  songs: [ObjectId],          // References to Song collection
  is_imported: Boolean,       // True if from Spotify/Deezer
  original_url: String,       // Source URL
  source: String,             // 'spotify' | 'deezer' | 'manual'
  description: String,
  image_url: String,
  song_count: Number,         // Total songs
  total_duration_ms: Number,  // Total playlist duration
  createdAt: Date,
  updatedAt: Date
}
```

### Queue Schema

```javascript
{
  user_id: String,            // User ID - Required
  songs: [ObjectId],          // Song IDs in queue
  current_index: Number,      // Current playing index
  current_playing_id: ObjectId, // Current song
  is_active: Boolean,         // Queue is active
  session_expires_at: Date,   // Sleep timer expiry
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 Frontend Components

### SongCardComponent

Reusable card displaying song information with swipe-to-queue gesture.

```typescript
<app-song-card 
  [song]="song"
  (addedToQueue)="onQueueAdd($event)"
  appSwipe
  (swipeRight)="addToQueue($event)"
></app-song-card>
```

### PlayerComponent

Global player component with controls, queue management, and sleep timer.

```typescript
<app-player>
  <!-- Auto-positioned at bottom of screen -->
  <!-- Displays current song and player controls -->
</app-player>
```

### SearchComponent

Main search interface with real-time results from multiple sources.

### PlaylistImportComponent

Dedicated import UI with progress tracking and playlist management.

---

## 🔄 State Management (NgRx)

### Auth Store

```typescript
- Actions: initiateLogin, loginSuccess, logout, refreshToken
- Selectors: selectToken, selectUser, selectIsAuthenticated
- Effects: Spotify OAuth flow, profile fetching
```

### Songs Store

```typescript
- Actions: searchSongs, getSongById, getRecentSongs
- Selectors: selectSongs, selectLoading, selectSources
- Effects: Multi-source search logic
```

### Queue Store

```typescript
- Actions: addToQueue, removeFromQueue, setSleepTimer
- Selectors: selectQueueSongs, selectCurrentSong, selectSleepTimer
- Effects: Queue synchronization
```

### Playlists Store

```typescript
- Actions: importPlaylist, createPlaylist, deletePlaylist
- Selectors: selectPlaylists, selectLoading
- Effects: Playlist import and management
```

---

## 🎯 Key Features Explained

### 1. Database-First Caching

**Flow:**
```
Frontend Query → Backend
  ↓
Check MongoDB
  ├─ Hit → Return cached data
  └─ Miss → Fetch from Spotify/Deezer
  ↓
Transform to internal schema
  ↓
Save to MongoDB (24h TTL)
  ↓
Return to Frontend
```

**Benefits:**
- Reduced API calls to external services
- Faster response times for repeated queries
- Tracks data source (`api_source` field)
- Automatic cache expiration

### 2. Swipe-to-Queue Gesture

**Implementation:**
- Uses HammerJS for gesture detection
- Listen for `swipeRight` on SongCard
- Dispatch `QueueActions.addToQueue()`
- Visual feedback with success toast
- Works on mobile & desktop

### 3. Playlist Import

**Process:**
1. User provides Spotify/Deezer playlist URL
2. Backend extracts playlist ID via regex
3. Fetch all tracks from external API
4. Check if each track exists in MongoDB
5. Fetch and save new tracks
6. Create Playlist document with track IDs
7. Return import summary

**Handles:**
- Rate limiting (Spotify 429)
- Pagination (Spotify playlists > 50 items)
- Duplicate detection
- Both Spotify and Deezer

### 4. Sleep Timer

**Mechanism:**
1. User selects duration (5, 15, 30, 60 mins)
2. Store expiry time in Queue document
3. Frontend tracks countdown
4. When timer hits zero:
   - Pause audio player
   - Clear active session
   - Emit notification

---

## 🔐 Security Features

✅ **OAuth2 Authentication** - Secure Spotify login
✅ **JWT Tokens** - Stateless authentication
✅ **Rate Limiting** - Throttle API requests (100/min)
✅ **CORS Protection** - Configured whitelist
✅ **Password Hashing** - N/A (OAuth2 only)
✅ **Request Validation** - DTO validation
✅ **HTTPS Ready** - Production configuration

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:cov         # Coverage report
```

### Frontend Tests

```bash
cd frontend
ng test                  # Run tests
ng test --watch        # Watch mode
ng test --code-coverage # Coverage report
```

---

## 📈 Performance Optimizations

1. **MongoDB Indexing** - Compound indexes on title+artist
2. **Redis Caching** - Optional 24h search result cache
3. **Pagination** - Limit returned results (max 100)
4. **Gzip Compression** - Enabled on all responses
5. **Code Splitting** - Angular lazy-loaded modules
6. **Change Detection** - OnPush strategy for components

---

## 🐳 Docker Deployment

### Build Images

```bash
# Backend
docker build -f backend/Dockerfile -t spotify-clone-api .

# Frontend
docker build -f frontend/Dockerfile -t spotify-clone-web .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

---

## 🛠️ Development Workflow

### Running Both Services

**Terminal 1 - Backend:**
```bash
cd backend && npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm start
```

### Git Workflow

```bash
git checkout -b feature/new-feature
# Make changes
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create Pull Request
```

---

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Angular Documentation](https://angular.io/docs)
- [NgRx Documentation](https://ngrx.io)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Deezer API](https://developers.deezer.com/api)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Commit with clear messages
6. Push and create a PR

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 👨‍💻 Author

Praveen - Full Stack Developer

---

**Last Updated:** March 12, 2026
