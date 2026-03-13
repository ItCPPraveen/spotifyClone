FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Use npm install instead of npm ci since no package-lock.json in repo
RUN npm install

COPY . .

RUN npm run build

# ── Production image ──────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health',(r)=>{if(r.statusCode!==200)throw new Error(r.statusCode)},(e)=>{throw e})"

CMD ["node", "dist/main"]
