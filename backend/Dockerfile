FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL deps (including devDependencies needed for build)
RUN npm ci

# Copy source
COPY . .

# Build NestJS app
RUN npm run build

# ── Production image ──────────────────────────────────────────
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install only production deps
RUN npm ci --only=production

# Copy compiled output
COPY --from=builder /app/dist ./dist

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/api/health',(r)=>{if(r.statusCode!==200)throw new Error(r.statusCode)},(e)=>{throw e})"

CMD ["node", "dist/main"]
