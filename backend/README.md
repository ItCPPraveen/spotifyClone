# YouTube Music Clone - Backend API (NestJS)

Production-grade REST API for music discovery and management with smart caching, Google OAuth2, and multi-source search.

## 🚀 Features

- ✅ **OAuth2 Authentication** - Secure Google login & token refresh
- ✅ **Multi-Source Search** - YouTube API, Spotify API, MongoDB Cache
- ✅ **Smart Caching** - 24-hour TTL with automatic expiration
- ✅ **Playlist Import** - Batch import from YouTube/Spotify URLs
- ✅ **Queue Management** - Real-time queue synchronization
- ✅ **Sleep Timer** - Auto-pause with configurable durations
- ✅ **Rate Limiting** - 100 requests/minute per IP
- ✅ **Error Handling** - Graceful handling of API rate limits

## 📦 Tech Stack

- **Framework**: NestJS 10.x
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis (optional)
- **Authentication**: JWT + OAuth2
- **Validation**: class-validator
- **API Clients**: Axios for external APIs

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Developer credentials (OAuth + YouTube Data API)

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Fill in your credentials
nano .env

# Run in development
npm run start:dev

# Build for production
npm run build
npm run start:prod
```

## 📋 Environment Variables

```env
# Database
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/spotify-clone

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/auth/callback

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key_here

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:4200

# Optional: Redis for advanced caching
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cache TTL in seconds (default: 24 hours)
CACHE_TTL=86400
```

## 🏗️ Project Structure

```
src/
├── modules/
│   ├── auth/              # Authentication & OAuth2
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── schemas/
│   │       └── user.schema.ts
│   ├── songs/             # Song search & caching
│   │   ├── songs.controller.ts
│   │   ├── songs.service.ts
│   │   ├── songs.module.ts
│   │   └── schemas/
│   │       └── song.schema.ts
│   ├── playlists/         # Playlist management & import
│   │   ├── playlists.controller.ts
│   │   ├── playlists.service.ts
│   │   ├── playlists.module.ts
│   │   └── schemas/
│   │       └── playlist.schema.ts
│   └── queue/             # Queue & sleep timer
│       ├── queue.controller.ts
│       ├── queue.service.ts
│       ├── queue.module.ts
│       └── schemas/
│           └── queue.schema.ts
├── services/              # Cross-cutting services
│   ├── spotify.service.ts     # Spotify API client
│   ├── deezer.service.ts      # Deezer API client
│   └── search-map.service.ts  # Multi-source search orchestration
├── common/                # Shared utilities
│   ├── filters/
│   ├── guards/
│   └── interceptors/
├── app.module.ts          # Root module
├── app.controller.ts
├── app.service.ts
└── main.ts
```

## 🔌 API Endpoints

### Authentication

```bash
# Get Spotify login URL
GET /api/auth/login

# Handle OAuth callback
POST /api/auth/callback
Body: { code: "authorization_code" }

# Get current user profile (Protected)
GET /api/auth/profile
Headers: Authorization: Bearer <token>

# Refresh JWT token (Protected)
POST /api/auth/refresh
Headers: Authorization: Bearer <token>
```

### Songs

```bash
# Search songs across all sources
GET /api/songs/search?q=adele&limit=20

# Get recently cached songs
GET /api/songs/recent?limit=50

# Get song details by ID
GET /api/songs/:id

# Get cache statistics
GET /api/songs/cache/stats
```

### Playlists

```bash
# Get all user playlists (Protected)
GET /api/playlists
Headers: Authorization: Bearer <token>

# Create new playlist (Protected)
POST /api/playlists
Headers: Authorization: Bearer <token>
Body: { name: "My Playlist", description: "..." }

# Get playlist details
GET /api/playlists/:id

# Import playlist from URL (Protected)
POST /api/playlists/import
Headers: Authorization: Bearer <token>
Body: { playlist_url: "https://open.spotify.com/playlist/..." }

# Add song to playlist (Protected)
POST /api/playlists/:playlistId/songs/:songId

# Remove song from playlist (Protected)
DELETE /api/playlists/:playlistId/songs/:songId

# Delete playlist (Protected)
DELETE /api/playlists/:id
```

### Queue

```bash
# Get current queue (Protected)
GET /api/queue
Headers: Authorization: Bearer <token>

# Add song to queue (Protected)
POST /api/queue/add/:songId

# Remove song from queue (Protected)
DELETE /api/queue/remove/:songId

# Clear entire queue (Protected)
DELETE /api/queue/clear

# Set sleep timer (Protected)
POST /api/queue/sleep-timer
Body: { duration_minutes: 30 }

# Get sleep timer status (Protected)
GET /api/queue/sleep-timer
```

## 🔐 Authentication Flow

```
1. Frontend requests /api/auth/login
2. Backend returns Spotify OAuth URL
3. User authenticates with Spotify
4. Spotify redirects to /api/auth/callback with code
5. Backend exchanges code for Spotify access token
6. Backend creates JWT token
7. Frontend stores JWT in localStorage
8. JWT included in Authorization header for protected routes
```

## 🗄️ Database Indexing

For optimal performance, MongoDB automatically creates these indexes:

```javascript
// Songs
db.songs.createIndex({ title: 1, artist: 1 })
db.songs.createIndex({ spotify_id: 1 })
db.songs.createIndex({ deezer_id: 1 })
db.songs.createIndex({ cache_expires_at: 1 })

// Playlists
db.playlists.createIndex({ owner: 1 })
db.playlists.createIndex({ name: 1 })
db.playlists.createIndex({ is_imported: 1 })

// Queues
db.queues.createIndex({ user_id: 1 })
db.queues.createIndex({ is_active: 1 })

// Users
db.users.createIndex({ spotify_id: 1 })
db.users.createIndex({ email: 1 })
```

## 📊 Search Flow

```
User Query → Backend
  ↓
1. Check MongoDB for matching songs with valid cache
  ├─ If found & fresh → Return (source: mongodb_cache)
  └─ If not found or expired → Continue
  
2. Search Spotify API
  ├─ Transform results
  ├─ Save to MongoDB (24h TTL)
  └─ Add to results
  
3. If insufficient results, search Deezer API
  ├─ Transform results
  ├─ Save to MongoDB (24h TTL)
  └─ Add to results
  
4. Deduplicate by (title, artist) combination
  ↓
Return results with sources metadata
```

## 🎯 Error Handling

### HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limited
- `500 Internal Server Error` - Server error

### Spotify Rate Limiting (429)

```typescript
// Automatic handling:
// 1. Catch 429 error
// 2. Extract retry-after header
// 3. Return user-friendly message
// 4. Client can retry after delay
// 5. No data loss
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# Specific test file
npm run test -- auth.service
```

## 📈 Performance Tips

1. **Database Indexing** - Already optimized in schema definitions
2. **Query Limits** - API enforces max 100 results per request
3. **Caching** - 24-hour TTL prevents redundant API calls
4. **Pagination** - Not yet implemented but recommended
5. **Batch Operations** - Playlist import handles 1000+ songs

## 🐳 Docker Deployment

```bash
# Build image
docker build -t spotify-api .

# Run container
docker run -p 3001:3001 \
  -e MONGODB_URI=... \
  -e SPOTIFY_CLIENT_ID=... \
  spotify-api

# Or with docker-compose
docker-compose up -d
```

## 🔄 Development Workflow

```bash
# Start dev server with hot reload
npm run start:dev

# Watch for file changes
npm run test:watch

# Build for production
npm run build

# Start production server
npm run start:prod
```

## 📚 Dependencies

Key packages and their purposes:

- `@nestjs/core` - NestJS framework
- `@nestjs/mongoose` - MongoDB ODM integration
- `@nestjs/jwt` - JWT authentication
- `@nestjs/config` - Environment configuration
- `axios` - HTTP client for external APIs
- `class-validator` - DTO validation
- `mongoose` - MongoDB driver

## 🚨 Known Limitations

1. **Single User Context** - Current implementation assumes authenticated user
2. **No Pagination** - Returns top 20-100 results only
3. **No Full-Text Search** - Uses regex, scales to ~100k documents
4. **Redis Optional** - In-memory cache not yet fully integrated
5. **Rate Limits** - Spotify 429 errors not cached or queued

## ✅ Future Enhancements

- [ ] Implement Redis caching layer
- [ ] Add GraphQL endpoint alongside REST
- [ ] Full-text MongoDB search indexes
- [ ] Pagination with cursor support
- [ ] WebSocket for real-time updates
- [ ] Song recommendation engine
- [ ] User social features (follow, collaborate)
- [ ] Advanced analytics & usage tracking

---

**Documentation Last Updated:** March 12, 2026
