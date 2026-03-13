FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Use npm install instead of npm ci since no package-lock.json in repo
RUN npm install

COPY . .

RUN npm run build:prod

# ── Production image (nginx) ──────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist/spotify-clone /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
