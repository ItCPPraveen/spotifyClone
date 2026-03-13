FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files (context is already ./frontend)
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build:prod

# ── Production image (nginx) ──────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist/spotify-clone /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
