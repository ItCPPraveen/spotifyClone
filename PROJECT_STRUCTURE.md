# Project Structure

```
spotify-clone/
├── README.md                               # Main project documentation
├── docker-compose.yml                      # Docker compose for full stack
├── setup.sh                                # Linux/Mac setup script
├── setup.bat                               # Windows setup script
│
├── backend/                                # NestJS API Server
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.base.json
│   ├── nest-cli.json
│   ├── .env.example
│   ├── Dockerfile
│   ├── README.md
│   ├── src/
│   │   ├── main.ts                         # Application entry point
│   │   ├── app.module.ts                   # Root module
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   │
│   │   ├── modules/                        # Feature modules
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.service.spec.ts
│   │   │   │   ├── guards/
│   │   │   │   │   └── jwt-auth.guard.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   └── schemas/
│   │   │   │       └── user.schema.ts
│   │   │   │
│   │   │   ├── songs/
│   │   │   │   ├── songs.module.ts
│   │   │   │   ├── songs.controller.ts
│   │   │   │   ├── songs.service.ts
│   │   │   │   ├── songs.service.spec.ts
│   │   │   │   └── schemas/
│   │   │   │       └── song.schema.ts
│   │   │   │
│   │   │   ├── playlists/
│   │   │   │   ├── playlists.module.ts
│   │   │   │   ├── playlists.controller.ts
│   │   │   │   ├── playlists.service.ts
│   │   │   │   └── schemas/
│   │   │   │       └── playlist.schema.ts
│   │   │   │
│   │   │   └── queue/
│   │   │       ├── queue.module.ts
│   │   │       ├── queue.controller.ts
│   │   │       ├── queue.service.ts
│   │   │       └── schemas/
│   │   │           └── queue.schema.ts
│   │   │
│   │   ├── services/                      # Cross-cutting services
│   │   │   ├── spotify.service.ts
│   │   │   ├── deezer.service.ts
│   │   │   └── search-map.service.ts
│   │   │
│   │   └── common/                        # Shared utilities
│   │       └── (filters, guards, interceptors)
│   │
│   └── dist/                              # Compiled JavaScript (generated)
│
├── frontend/                               # Angular App
│   ├── package.json
│   ├── angular.json
│   ├── tsconfig.json
│   ├── tsconfig.base.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── README.md
│   │
│   ├── src/
│   │   ├── main.ts
│   │   ├── index.html
│   │   │
│   │   ├── app/
│   │   │   ├── app.module.ts              # Root module
│   │   │   ├── app.component.ts           # Root component
│   │   │   │
│   │   │   ├── modules/                   # Feature modules
│   │   │   │   ├── home/
│   │   │   │   │   ├── search.component.ts
│   │   │   │   │   └── search.component.spec.ts
│   │   │   │   │
│   │   │   │   ├── player/
│   │   │   │   │   ├── player.component.ts
│   │   │   │   │   └── song-card.component.ts
│   │   │   │   │
│   │   │   │   └── import/
│   │   │   │       └── playlist-import.component.ts
│   │   │   │
│   │   │   ├── services/                  # HTTP & business logic
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   ├── songs.service.ts
│   │   │   │   ├── queue.service.ts
│   │   │   │   └── playlists.service.ts
│   │   │   │
│   │   │   ├── store/                     # NgRx state management
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.actions.ts
│   │   │   │   │   ├── auth.reducer.ts
│   │   │   │   │   ├── auth.effects.ts
│   │   │   │   │   ├── auth.selectors.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── songs/
│   │   │   │   │   ├── songs.actions.ts
│   │   │   │   │   ├── songs.reducer.ts
│   │   │   │   │   ├── songs.effects.ts
│   │   │   │   │   ├── songs.selectors.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── queue/
│   │   │   │   │   ├── queue.actions.ts
│   │   │   │   │   ├── queue.reducer.ts
│   │   │   │   │   ├── queue.effects.ts
│   │   │   │   │   ├── queue.selectors.ts
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   └── playlists/
│   │   │   │       ├── playlists.actions.ts
│   │   │   │       ├── playlists.reducer.ts
│   │   │   │       ├── playlists.effects.ts
│   │   │   │       ├── playlists.selectors.ts
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   └── directives/                # Custom directives
│   │   │       └── swipe.directive.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── tailwind.scss
│   │   │   └── global.scss
│   │   │
│   │   └── environments/
│   │       ├── environment.ts
│   │       └── environment.prod.ts
│   │
│   └── dist/                              # Compiled Angular (generated)
│
└── .gitignore                             # Git ignore rules
```

## Key Directories

### Backend Structure
- **modules**: Feature-based modules (Auth, Songs, Playlists, Queue)
- **services**: Reusable services (Spotify, Deezer, SearchMap)
- **schemas**: MongoDB/Mongoose data models
- **controllers**: HTTP endpoint handlers
- **services**: Business logic implementation

### Frontend Structure
- **modules**: Feature-based components
- **store**: NgRx state management with Actions/Reducers/Effects/Selectors
- **services**: HTTP clients and business logic
- **directives**: Custom Angular directives (SwipeDirective)
- **styles**: Global and component-specific styles

## File Naming Conventions

- **Services**: `*.service.ts` (e.g., `songs.service.ts`)
- **Components**: `*.component.ts` (e.g., `search.component.ts`)
- **Modules**: `*.module.ts` (e.g., `songs.module.ts`)
- **Directives**: `*.directive.ts` (e.g., `swipe.directive.ts`)
- **Schemas**: `*.schema.ts` (e.g., `song.schema.ts`)
- **Actions**: `*.actions.ts` (e.g., `auth.actions.ts`)
- **Reducers**: `*.reducer.ts` (e.g., `auth.reducer.ts`)
- **Tests**: `*.spec.ts` (e.g., `auth.service.spec.ts`)
