# CampApp

An offline-first camping gear planner. Create trips, build packing checklists, and generate smart gear lists from guided templates — all from your phone without a network connection.

## Features

### Trips
- Create a trip with a name, date, and optional notes
- Apply any template to pre-fill the packing list
- Check items off as you pack
- Progress bar shows how much is packed
- Add custom items per trip in any category
- Remove items you don't need
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
| 3 | What's already in your vehicle? | Multi-select — only shown for car / van / car-tent |
| 4 | What will you cook on? | Single select — only shown when stove or freeze-dried is selected and no vehicle stove |
| 5 | Any planned activities? | Multi-select |
| 6 | How long is the trip? | Single select |
| 7 | Who's coming? | Steppers for adults / kids / pets |
| 8 | What season? | Single select |

After answering, the wizard shows a generated gear list that can be edited (remove items) before saving.

**Supported sleeping setups:** Tent, In the car, Car/roof tent, Van/campervan

**Supported eating styles:** Camp stove, Campfire cooking, BBQ/grilling, Cold food & snacks, Freeze-dried meals, Restaurants & cafés

**Supported activities:** Hiking, Swimming, Cycling, Climbing, Fishing, Paddling, Trail running, Photography, Yoga, Stargazing, Surfing

**Seasons:** Summer, Spring/Autumn, Winter

**What vehicle equipment suppresses:** Fridge → no cooler; Stove → no stove/fuel question; Inverter → no power bank; Chairs & table → no folding furniture

### Offline / PWA
- Installable as a native-like app on iOS and Android
- Works fully offline — all data is stored in `localStorage`
- Service worker auto-updates via Workbox

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 |
| Language | TypeScript 6 (strict) |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| PWA | vite-plugin-pwa + Workbox |
| Persistence | `localStorage` via custom hook |
| Routing | Manual state machine (no router library) |

## Project structure

```
src/
├── App.tsx                    # Root component; page state machine + bottom nav
├── pages/
│   ├── Home.tsx               # Trip list + new-trip form
│   ├── TripDetail.tsx         # Packing checklist for a single trip
│   └── Templates.tsx          # Template list + wizard entry point
├── components/
│   ├── checklist/
│   │   ├── AddItemForm.tsx    # Inline form to add a custom item to a trip
│   │   ├── CategoryGroup.tsx  # Collapsible category section in checklist
│   │   └── ChecklistItem.tsx  # Single item row with checkbox and delete
│   ├── templates/
│   │   ├── TemplateCard.tsx   # Template list item (use / delete actions)
│   │   └── TemplateCreator.tsx# Multi-step wizard component
│   ├── trips/
│   │   ├── TripCard.tsx       # Trip list item with progress bar
│   │   └── TripForm.tsx       # Create-trip form (name, date, template, notes)
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       └── ProgressBar.tsx
├── data/
│   ├── categories.ts          # GearCategory definitions with labels and emojis
│   ├── defaultTemplates.ts    # 4 hardcoded built-in templates
│   └── templateGenerator.ts  # Wizard answer types + gear generation logic
├── hooks/
│   ├── useLocalStorage.ts     # Generic typed localStorage hook
│   ├── useTemplates.ts        # CRUD for custom templates
│   └── useTrips.ts            # CRUD for trips + item-level operations
├── types/
│   └── index.ts               # GearItem, GearCategory, Template, Trip
└── utils/
    ├── date.ts                # Date formatting helpers
    ├── id.ts                  # UUID generation
    └── storage.ts             # Raw localStorage read/write helpers
```

## Data model

```ts
interface GearItem {
  id: string;
  name: string;
  category: GearCategory;  // 'shelter' | 'sleeping' | 'cooking' | 'clothing' | 'tools' | 'first-aid' | 'other'
  quantity: number;
  packed: boolean;          // only on trip items, not template items
}

interface Template {
  id: string;
  name: string;
  description?: string;
  items: Omit<GearItem, 'packed'>[];
  isDefault: boolean;        // true → built-in, cannot be deleted
}

interface Trip {
  id: string;
  name: string;
  date: string;              // ISO date string
  templateId?: string;
  items: GearItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

Data is stored in two `localStorage` keys:
- `camp-trips` — array of `Trip`
- `camp-templates` — array of custom `Template` (built-ins are hardcoded, never persisted)

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build     # TypeScript check + Vite production build → dist/
npm run preview   # Serve the production build locally
npm run lint      # ESLint
```

## Conventions

- Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.)
- Named exports only — no default exports from components
- Functional components with hooks; no class components
- No routing library — page state is a `useState<Page>` in `App.tsx`
- No state management library — hooks + prop-drilling only
- Comments only when the *why* is non-obvious
