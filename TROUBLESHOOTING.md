# 🐛 Troubleshooting Guide

Solutions for common issues and errors.

## Connection Issues

### MongoDB Connection Failed

```
Error: connect ECONNREFUSED
```

**Solutions:**
1. Verify connection string in `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/spotify-clone
   ```
2. Check MongoDB Atlas:
   - Cluster must be running (not paused)
   - Your IP must be whitelisted
   - User credentials are correct
3. Test connection:
   ```bash
   mongosh "your-connection-string"
   ```

### Cannot Connect to Spotify API

```
Error: 401 Unauthorized
```

**Solutions:**
1. Verify credentials in `.env`:
   ```
   SPOTIFY_CLIENT_ID=correct_id
   SPOTIFY_CLIENT_SECRET=correct_secret
   ```
2. Check base64 encoding is done correctly by library
3. Ensure API requests include Authorization header

### CORS Error

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**
1. Verify backend is running (http://localhost:3001)
2. Check `.env` CORS_ORIGIN matches frontend URL:
   ```
   CORS_ORIGIN=http://localhost:4200
   ```
3. Verify `app.enableCors()` in `backend/src/main.ts`
4. Clear browser cache and cookies

## Authentication Issues

### "Spotify OAuth Failed"

```
Error: Failed to authenticate with Spotify
```

**Solutions:**
1. Verify redirect URI in Spotify Dashboard matches exactly:
   ```
   http://localhost:3001/auth/spotify/callback
   ```
2. Check Client ID and Secret are from the correct app
3. Ensure scopes include necessary permissions:
   - `user-read-private`
   - `user-read-email`
   - `playlist-read-public`
   - `playlist-read-private`

### "Invalid Token" Error

```
Error: Invalid or expired token
```

**Solutions:**
1. Check JWT_SECRET is set and consistent
2. Token may be expired (default 24h)
3. Clear localStorage and re-login:
   ```javascript
   localStorage.clear()
   location.reload()
   ```

### Stuck on Login Page

**Solutions:**
1. Check if Spotify OAuth window opened (may be blocked)
2. Check browser console for errors (F12)
3. Verify backend running: `curl http://localhost:3001/health`
4. Clear cookies: Settings → Privacy → Clear Browsing Data

## Port Issues

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solutions:**

**Mac/Linux:**
```bash
# Find process
lsof -i :3001

# Kill process
kill -9 <PID>
```

**Windows:**
```bash
# Find process
netstat -ano | findstr :3001

# Kill process
taskkill /PID <PID> /F
```

**Or change port in `.env`:**
```env
PORT=3002
```

## Dependency Issues

### "npm ERR! peer dep missing"

**Solution:**
```bash
npm install --save-optional missing-dependency
```

### "Module Not Found"

**Solutions:**
1. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
2. Check import paths are correct
3. Verify TypeScript path mappings in `tsconfig.json`

## Search & Cache Issues

### Search Returns Empty Results

**Solutions:**
1. Try searching for popular artist (e.g., "Adele")
2. Check Spotify Client credentials
3. Look for rate limit errors (Spotify 429)
4. Verify MongoDB is storing songs:
   ```bash
   # Connect to MongoDB
   mongosh "your-connection-string"
   # Check collection
   db.songs.find().limit(5)
   ```

### Duplicate Songs in Results

**Solution:**
This is normal behavior. Search deduplicates by (title, artist) combination.

### Slow Search

**Solutions:**
1. Create MongoDB indexes (should be automatic):
   ```bash
   db.songs.createIndex({ title: 1, artist: 1 })
   db.songs.createIndex({ spotify_id: 1 })
   ```
2. Reduce search limit in API call
3. Clear expired cache:
   ```bash
   db.songs.deleteMany({ cache_expires_at: { $lt: new Date() } })
   ```

## Frontend Issues

### "Cannot find module '@app/...'"

**Solution:**
Check TypeScript path mappings in `frontend/tsconfig.json`:
```json
"paths": {
  "@app/*": ["src/app/*"],
  "@services/*": ["src/app/services/*"]
}
```

### Styles Not Loading

**Solutions:**
1. Check Tailwind CSS is imported in styles.scss
2. Rebuild Frontend:
   ```bash
   ng build --force
   ```
3. Clear browser cache: `Ctrl+Shift+Delete`

### NgRx Store Empty

**Solutions:**
1. Verify effects are dispatching actions
2. Check selectors in component:
   ```typescript
   songs$ = this.store.select(songsSelectors.selectSongs);
   ```
3. Use NgRx DevTools to inspect state:
   - Install Chrome extension
   - Check Redux tab in DevTools

## Browser Console Errors

### "Cannot read property 'subscribe' of undefined"

**Solution:**
Observable not initialized. Check if service returned Observable:
```typescript
// Good
searchSongs(query): Observable<any> {
  return this.http.get(...);
}

// Bad
searchSongs(query) {
  this.http.get(...);
}
```

### "HttpClientModule not provided"

**Solution:**
Add HttpClientModule to app.module.ts imports:
```typescript
imports: [
  HttpClientModule,
  // other imports
]
```

## Docker Issues

### Container Won't Start

**Solution:**
Check logs:
```bash
docker logs spotify-api
docker logs spotify-web
docker logs spotify-mongo
```

### Can't Access Services

**Solutions:**
1. Ensure containers are running:
   ```bash
   docker ps
   ```
2. Check port mappings:
   ```bash
   docker ps --format "table {{.Names}}\t{{.Ports}}"
   ```
3. Restart all:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Performance Issues

### Application is Slow

**Solutions:**
1. Check MongoDB query performance:
   ```bash
   db.songs.explain("executionStats").find({})
   ```
2. Create missing indexes
3. Reduce search limit
4. Clear old cache data

### High Memory Usage

**Solution:**
Restart all services:
```bash
docker-compose restart
# or
npm run start:dev  # Fresh start to clear cache
```

## Testing Issues

### Tests Fail But Code Works

**Solutions:**
1. Mock external services properly
2. Ensure test setup matches actual setup
3. Run tests with verbose output:
   ```bash
   npm run test -- --verbose
   ```

### Coverage Not Accurate

**Solution:**
Clear coverage data and regenerate:
```bash
rm -rf coverage
npm run test:cov
```

## Still Having Issues?

1. **Check the logs** - Most errors are in terminal output
2. **Read error messages carefully** - They usually point to the solution
3. **Restart services** - Often fixes temporary issues
4. **Clear cache** - Browser, npm, MongoDB
5. **Check configurations** - Typos in .env are common

---

**Last updated:** March 12, 2026
