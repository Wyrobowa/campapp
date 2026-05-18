# CampApp

A camping gear planner. Create trips, build packing checklists, and generate smart gear lists from a guided template wizard. Data syncs across devices via a REST API backed by a Neon PostgreSQL database.

## Architecture

npm workspaces monorepo with two apps:

| App | Path | Description |
|-----|------|-------------|
| Web | `apps/web` | React 19 PWA (Vite + TanStack Router + TanStack Query) |
| API | `apps/api` | Hono REST API (Node.js + Drizzle ORM + Neon + better-auth) |

## Features

### Trips
- Create a trip with name, date, optional notes, and a starting template
- Check items off as you pack — progress bar shows how much is packed
- Add custom items per trip in any category
- Remove items you don't need
- Inline edit trip name and date
- Save a trip's list back as a reusable template

### Templates
- 4 built-in templates: Weekend tent camping, Light hiking, Winter bivouac, Car camping
- Create custom templates via the guided wizard or by saving from a trip
- Delete custom templates (built-ins are protected)

### Template creator wizard
A multi-step questionnaire that generates a tailored gear list. Questions adapt based on previous answers:

| Step | Question | Type |
|------|----------|------|
| 1 | Where will you sleep? | Single select |
| 2 | How will you eat? | Multi-select |
| 3 | What's already in your vehicle? | Multi-select — only shown for car/van/car-tent |
| 4 | What will you cook on? | Single select — only shown when relevant |
| 5 | Any planned activities? | Multi-select |
| 6 | How long is the trip? | Single select |
| 7 | Who's coming? | Steppers for adults / kids / pets |
| 8 | What season? | Single select |

### Auth
- Email + password sign up / sign in
- Session-based authentication via better-auth
- All data is scoped to the authenticated user

## Tech stack

### Web (`apps/web`)

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Language | TypeScript 6 (strict) |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Routing | TanStack Router |
| Server state | TanStack Query |
| Auth client | better-auth/react |
| PWA | vite-plugin-pwa + Workbox |

### API (`apps/api`)

| Layer | Choice |
|-------|--------|
| Framework | Hono + @hono/node-server |
| Language | TypeScript 6 (strict) |
| ORM | Drizzle ORM |
| Database | Neon (PostgreSQL) |
| Auth | better-auth |
| Validation | Zod |
| Runtime | Node.js via tsx |

## Project structure

```
campapp/
├── apps/
│   ├── web/                        # React PWA
│   │   └── src/
│   │       ├── components/
│   │       │   ├── checklist/      # AddItemForm, CategoryGroup, ChecklistItem
│   │       │   ├── layout/         # RootLayout, NavBar
│   │       │   ├── templates/      # TemplateCard, TemplateCreator wizard
│   │       │   ├── trips/          # TripCard, TripForm
│   │       │   └── ui/             # Button, Input, ProgressBar, ErrorBoundary
│   │       ├── data/
│   │       │   ├── categories.ts   # GearCategory definitions
│   │       │   └── templateGenerator.ts  # Wizard logic + gear generation
│   │       ├── hooks/
│   │       │   ├── useTrips.ts     # TanStack Query hooks for trips
│   │       │   ├── useTemplates.ts # TanStack Query hooks for templates
│   │       │   └── useEditableTrip.ts
│   │       ├── lib/
│   │       │   ├── api.ts          # Typed fetch wrapper for the REST API
│   │       │   └── auth-client.ts  # better-auth browser client
│   │       ├── pages/
│   │       │   ├── Home.tsx        # Trip list + new-trip form
│   │       │   ├── Login.tsx       # Sign in / sign up
│   │       │   ├── Templates.tsx   # Template list + wizard entry
│   │       │   └── TripDetail.tsx  # Packing checklist for a single trip
│   │       ├── schemas/            # Zod schemas + inferred types
│   │       └── router.tsx          # TanStack Router route tree
│   │
│   └── api/                        # Hono REST API
│       └── src/
│           ├── db/
│           │   ├── index.ts        # Drizzle client (Neon pool)
│           │   ├── schema.ts       # Auth + app tables
│           │   └── seed.ts         # Default templates seed script
│           ├── middleware/
│           │   └── session.ts      # Auth guard middleware
│           ├── routes/
│           │   ├── trips.ts        # GET/POST/PUT/DELETE /api/trips
│           │   └── templates.ts    # GET/POST/PUT/DELETE /api/templates
│           ├── auth.ts             # better-auth server config
│           ├── index.ts            # App entry point + CORS
│           └── types.ts            # Hono context variable types
│
├── package.json                    # Workspace root + shared scripts
└── package-lock.json
```

## Data model

```ts
type GearCategory = 'shelter' | 'sleeping' | 'cooking' | 'clothing' | 'tools' | 'first-aid' | 'other';

interface GearItem {
  id: string;
  name: string;
  category: GearCategory;
  quantity: number;
  packed: boolean;         // only on trip items, always false on template items
}

interface Template {
  id: string;
  userId: string | null;   // null = built-in default
  name: string;
  description?: string;
  items: Omit<GearItem, 'packed'>[];
  isDefault: boolean;
}

interface Trip {
  id: string;
  userId: string;
  name: string;
  date: string;            // YYYY-MM-DD
  templateId?: string;
  items: GearItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

## Getting started

### Prerequisites
- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
# apps/api/.env
DATABASE_URL=postgresql://...?sslmode=require
BETTER_AUTH_SECRET=<random 32+ char string>
BETTER_AUTH_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
PORT=3000

# apps/web/.env
VITE_API_URL=http://localhost:3000
```

### 3. Push schema to database

```bash
cd apps/api && npm run db:push
```

### 4. Seed default templates

```bash
cd apps/api && npm run db:seed
```

### 5. Run both servers

```bash
npm run dev        # web → http://localhost:5173  api → http://localhost:3000
```

## Scripts

### Root

| Command | Description |
|---------|-------------|
| `npm run dev` | Start web + api concurrently |
| `npm run dev:web` | Web only |
| `npm run dev:api` | API only |
| `npm run build` | Build both apps |
| `npm run test` | Run web tests |
| `npm run lint` | Lint web app |

### API (`apps/api`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API with tsx watch |
| `npm run build` | Compile TypeScript |
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migration files |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed default templates |
| `npm run db:studio` | Open Drizzle Studio |

## Deployment

### API → Railway

1. Create a new Railway project and connect the GitHub repo.
2. Leave the root directory as the repo root — `railway.json` defines the build and start commands.
3. Add environment variables in Railway settings (same as `apps/api/.env`).
4. After first deploy, run the seed script once:
   ```bash
   railway run node apps/api/dist/db/seed.js
   ```

### Web → Vercel

1. Import the GitHub repo in Vercel.
2. Set **Root Directory** to `apps/web`.
3. Vercel auto-detects Vite; `vercel.json` adds the SPA rewrite so deep links work.
4. Add `VITE_API_URL` pointing to your Railway API URL in Vercel's environment settings.

## Conventions

- **Conventional Commits** — `feat:`, `fix:`, `refactor:`, `chore:`, etc.
- **Named exports** — no default exports from components or hooks
- **Comments only when the _why_ is non-obvious** — not the what
- **TanStack Query** for all server state — no local caching layer
- **Zod** for validation at API boundaries; TypeScript types inferred from schemas
