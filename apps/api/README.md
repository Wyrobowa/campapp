# CampApp API

Hono REST API for CampApp. Handles authentication (better-auth), trips, and templates backed by a Neon PostgreSQL database.

## Endpoints

All routes except `/api/auth/**` require an active session cookie.

### Auth

Managed by better-auth. See [better-auth docs](https://better-auth.com) for the full list of routes.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/sign-up/email` | Register with email + password |
| POST | `/api/auth/sign-in/email` | Sign in with email + password |
| POST | `/api/auth/sign-out` | Sign out (clears session) |
| GET | `/api/auth/session` | Get current session |

### Trips

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/trips` | List all trips for the current user |
| POST | `/api/trips` | Create a trip |
| GET | `/api/trips/:id` | Get a single trip |
| PUT | `/api/trips/:id` | Update a trip |
| DELETE | `/api/trips/:id` | Delete a trip |

### Templates

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/templates` | List user's templates + built-in defaults |
| POST | `/api/templates` | Create a custom template |
| GET | `/api/templates/:id` | Get a single template |
| PUT | `/api/templates/:id` | Update a custom template |
| DELETE | `/api/templates/:id` | Delete a custom template |

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Random secret (32+ chars) for session signing |
| `BETTER_AUTH_URL` | API base URL (e.g. `http://localhost:3000`) |
| `FRONTEND_URL` | Web app origin for CORS (e.g. `http://localhost:5173`) |
| `PORT` | Port to listen on (default: `3000`) |

Copy `.env.example` to `.env` and fill in the values.

## Database

Schema is defined in `src/db/schema.ts` using Drizzle ORM.

### Tables

| Table | Description |
|-------|-------------|
| `user` | Auth — user accounts |
| `session` | Auth — active sessions |
| `account` | Auth — OAuth / credential links |
| `verification` | Auth — email verification tokens |
| `trips` | User trips with JSONB items array |
| `templates` | Templates; `user_id IS NULL` = built-in default |

### Setup

```bash
# Push schema (first time or after schema changes)
npm run db:push

# Seed built-in default templates
npm run db:seed

# Open Drizzle Studio to browse data
npm run db:studio
```

## Development

```bash
npm run dev      # tsx watch with dotenv — http://localhost:3000
npm run build    # tsc compile to dist/
npm run start    # node dist/index.js
```
