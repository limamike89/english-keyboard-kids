# English Keyboard Kids

Educational application for kids learning English through auditory recognition and keyboard input.

## Architecture

```
ekkids/
├── apps/
│   ├── api/          # NestJS 11 backend (PostgreSQL, Prisma 6)
│   └── frontend/     # Vite 6 + React 19 (TanStack Query, Zustand, TailwindCSS)
├── docker-compose.yml
└── .github/workflows/  # CI/CD
```

### Key Design Decisions

| Decision | Choice |
|---|---|
| **Monorepo** | npm workspaces |
| **API** | NestJS 11 + Prisma 6 + PostgreSQL |
| **Auth** | Anonymous sessions (`x-session-token`) + JWT for parents/teachers |
| **Game Logic** | Pure TypeScript engine (FSM-based, Port/Adapter) |
| **Audio** | Web Audio API with multi-phase preloader |
| **State** | TanStack Query (server) + Zustand (client) |
| **Styling** | TailwindCSS v4 |
| **i18n** | Custom engine (en/es/fr/de) |

## Quick Start

```bash
# Install dependencies
npm install

# Start database
docker compose up -d postgres

# Generate Prisma client + run migrations + seed
npm run generate
cd apps/api && npx prisma migrate dev --name init && npx prisma db seed && cd ../..

# Start both apps
npm run dev:api     # http://localhost:4000
npm run dev:frontend # http://localhost:5173
```

## Environment Variables

Copy `apps/api/.env.example` to `apps/api/.env` and configure:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `JWT_SECRET` | — | Secret for JWT tokens (min 16 chars) |
| `CORS_ORIGINS` | `*` | Allowed origins (comma-separated) |
| `RATE_LIMIT_TTL` | `60` | Rate limit window (seconds) |
| `RATE_LIMIT_MAX` | `100` | Max requests per window |

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev:api` | Start API in watch mode |
| `npm run dev:frontend` | Start frontend dev server |
| `npm run build:api` | Build API for production |
| `npm run build:frontend` | Build frontend for production |
| `npm run start:prod` | Start API in production |
| `npm run seed` | Seed the database |
| `npm run migrate` | Deploy Prisma migrations |
| `npm run generate` | Generate Prisma client |
| `npm run lint` | Lint API code |
| `npm run format` | Format all files |

## API Documentation

When running, Swagger docs are available at `/docs`.

### Authentication

- **Students**: Anonymous sessions via `x-session-token` header (auto-created on first visit)
- **Parents/Teachers**: JWT tokens via `Authorization: Bearer <token>` (register at `/api/v1/auth/parent/register`)

## Engines

### Game Engine (`apps/api/src/game-engine/`)

Pure TypeScript FSM-based game engine with 11 states:

- **States**: idle, loading, ready, active, paused, answering, feedback, transitioning, completed, failed, review
- **Scoring**: Points decrease per attempt, streak bonuses
- **Tested**: 99 unit tests

### Multimedia Engine (`apps/frontend/src/multimedia-engine/`)

Web Audio API engine with:

- CacheManager (LRU + frequency)
- 3-phase Preloader (critical, progressive, background)
- SpeechSynthesizer with 4 languages
- React hooks: `useMultimedia`, `useAudio`, `useFeedbackAudio`

### Analytics Engine (`apps/api/src/analytics-engine/`)

- Interaction tracking (`AnalyticsEvent`)
- Student metrics (denormalized `StudentMetric`)
- Per-letter/number difficulty tracking
- Daily activity trends and recommendations
- 13 tests

### AI Engine (`apps/api/src/ai-engine/`)

- **DifficultyAdapter**: Adaptive 0-1 difficulty scale based on accuracy + streak
- **SpacedRepetition**: SM-2 algorithm (easiness factor, interval, next review)
- **ContentSelector**: Question scoring prioritizing due items > weak areas > adaptive
- **LearningPathPlanner**: Personalized lesson sequencing + recommendations
- 17 tests

## Deployment

### Docker

```bash
# Build and run all services
docker compose up --build

# API: http://localhost:4000
# Frontend: http://localhost:3000
```

### CI/CD

GitHub Actions workflows:

- `.github/workflows/ci.yml` — Lint, type-check, test on PR/push
- `.github/workflows/deploy.yml` — Build & push Docker images on `main`

Both workflows require `NODE_VERSION: 20` and the deploy workflow pushes to `ghcr.io`.

## Testing

```bash
# All API tests
cd apps/api && npx jest

# Specific engine
cd apps/api && npx jest --testPathPattern="ai-engine"
cd apps/api && npx jest --testPathPattern="game-engine"
cd apps/api && npx jest --testPathPattern="analytics-engine"
```

Current coverage: **129 tests** (99 game + 13 analytics + 17 AI)

## License

Private — All rights reserved.
