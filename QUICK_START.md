# 🚀 Quick Start Guide

Get the Spotify Clone application up and running in minutes!

## Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org)
- **MongoDB Atlas Account** - [Free](https://www.mongodb.com/cloud/atlas)
- **Spotify Developer Account** - [Register](https://developer.spotify.com)
- **Git** - For version control

## Step 1: Get Your Credentials

### Spotify Developer Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in (create account if needed)
3. Create a new App
4. Accept terms and create
5. Copy **Client ID** and **Client Secret**
6. Add Redirect URI: `http://localhost:3001/auth/spotify/callback`

### MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get the connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/spotify-clone`)

## Step 2: Clone or Navigate to Project

```bash
cd "d:\Praveen\spotify clone"
```

## Step 3: Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env
# OR on Windows:
# copy .env.example .env

# Edit .env and fill in:
nano .env
```

**Fill in these values:**
```env
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@YOUR_CLUSTER.mongodb.net/spotify-clone
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
JWT_SECRET=your_random_secret_key_here
```

**Install and run:**
```bash
npm install
npm run start:dev
```

✅ Backend running on `http://localhost:3001`

## Step 4: Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm start
```

✅ Frontend running on `http://localhost:4200`

---

## It's Working! 🎉

### First Steps:
1. Open http://localhost:4200 in your browser
2. Click "Login with Spotify"
3. Authorize the application
4. Search for songs, import playlists, and enjoy!

---

## Common Issues & Solutions

### ❌ "Cannot connect to MongoDB"

**Solution:**
- Check your MongoDB connection string is correct
- Whitelist your IP in MongoDB Atlas (Security → Network Access)
- Ensure MongoDB Atlas cluster is running ("Paused" status?)

### ❌ "Spotify authentication fails"

**Solution:**
- Verify Spotify Client ID and Secret are correct
- Check Redirect URI matches exactly: `http://localhost:3001/auth/spotify/callback`
- Clear browser cookies and try again

### ❌ "Port 3001 already in use"

**Solution:**
```bash
# Find process on port 3001
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill process or change port in .env
PORT=3002
```

### ❌ "npm ERR! gyp ERR!"

**Solution:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### ❌ CORS errors in browser console

**Solution:**
- Ensure backend is running on :3001
- Frontend environment.ts has correct API URL
- CORS_ORIGIN in backend .env is `http://localhost:4200`

---

## Using Docker (Optional)

### Quick Start:

```bash
docker-compose up -d
```

This starts:
- MongoDB on port 27017
- Redis on port 6379
- Backend API on port 3001
- Frontend on port 4200

### Stop:
```bash
docker-compose down
```

---

## Development Tips

### Hot Reload
Both backend and frontend have hot reload enabled:
- **Backend**: Changes auto-reload with `npm run start:dev`
- **Frontend**: Changes auto-reload with `ng serve`

### Debug Backend
```bash
# Add to .env
NODE_DEBUG=*
LOG_LEVEL=debug

# Run with debugger
node --inspect-brk dist/main.js
```

### Debug Frontend
Use Chrome DevTools (F12) → Sources tab

### View Store State
Install [NgRx Store DevTools](https://chrome.google.com/webstore/detail/ngrx-store-devtools/glagkhpambucijimnjidpsiphmfdkhgj)

---

## Project Structure

```
spotify-clone/
├── backend/           (NestJS API on :3001)
├── frontend/          (Angular App on :4200)
└── README.md          (Full documentation)
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed breakdown.

---

## Running Tests

### Backend:
```bash
cd backend
npm run test              # One time
npm run test:watch       # Watch mode
npm run test:cov         # Coverage
```

### Frontend:
```bash
cd frontend
ng test                  # One time
ng test --watch        # Watch mode
ng test --code-coverage # Coverage
```

---

## Build for Production

### Backend:
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend:
```bash
cd frontend
ng build --configuration production
```

---

## Useful Commands

```bash
# View API documentation
curl http://localhost:3001/api

# Get health status
curl http://localhost:3001/api/health

# Login URL
curl http://localhost:3001/api/auth/login

# Search songs
curl "http://localhost:3001/api/songs/search?q=adele&limit=20"

# View MongoDB data
mongosh "your-connection-string" --eval "db.songs.find().limit(5)"
```

---

## Getting Help

1. ✅ Check [README.md](README.md) for full documentation
2. ✅ Review [backend/README.md](backend/README.md) for API docs
3. ✅ Review [frontend/README.md](frontend/README.md) for UI docs
4. ✅ Check [Troubleshooting](#common-issues--solutions) section above
5. ✅ Check browser console (F12) for error messages
6. ✅ Check backend logs in terminal

---

## Next Steps

- ✅ Configure Redis for advanced caching
- ✅ Deploy to production (AWS, Heroku, DigitalOcean)
- ✅ Add more test coverage
- ✅ Implement WebSocket for real-time updates
- ✅ Add recommendation engine
- ✅ Deploy with Docker Compose

---

**Need help?** Check the detailed documentation in README.md or the module-specific READMEs!
