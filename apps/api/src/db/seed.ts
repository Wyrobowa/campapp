import 'dotenv/config';
import { db } from './index.js';
import { templates } from './schema.js';

const DEFAULT_TEMPLATES = [
  {
    id: 'default-weekend-tent',
    name: 'Weekend tent camping',
    description: 'Classic weekend tent camping for 1-2 people.',
    items: [
      { id: 'd1-1', name: 'Tent', category: 'shelter', quantity: 1 },
      { id: 'd1-2', name: 'Spare tent pegs', category: 'shelter', quantity: 6 },
      { id: 'd1-3', name: 'Sleeping bag', category: 'sleeping', quantity: 1 },
      { id: 'd1-4', name: 'Self-inflating sleeping mat', category: 'sleeping', quantity: 1 },
      { id: 'd1-5', name: 'Pillow', category: 'sleeping', quantity: 1 },
      { id: 'd1-6', name: 'Gas stove', category: 'cooking', quantity: 1 },
      { id: 'd1-7', name: 'Gas canister', category: 'cooking', quantity: 2 },
      { id: 'd1-8', name: 'Pot', category: 'cooking', quantity: 1 },
      { id: 'd1-9', name: 'Mug', category: 'cooking', quantity: 1 },
      { id: 'd1-10', name: 'Cutlery', category: 'cooking', quantity: 1 },
      { id: 'd1-11', name: 'Rain jacket', category: 'clothing', quantity: 1 },
      { id: 'd1-12', name: 'Fleece', category: 'clothing', quantity: 1 },
      { id: 'd1-13', name: 'Socks', category: 'clothing', quantity: 3 },
      { id: 'd1-14', name: 'Headlamp', category: 'tools', quantity: 1 },
      { id: 'd1-15', name: 'Pocket knife', category: 'tools', quantity: 1 },
      { id: 'd1-16', name: 'First aid kit', category: 'first-aid', quantity: 1 },
      { id: 'd1-17', name: 'Sunscreen', category: 'first-aid', quantity: 1 },
    ],
  },
  {
    id: 'default-light-hiking',
    name: 'Light hiking',
    description: 'Minimalist gear for multi-day trekking.',
    items: [
      { id: 'd2-1', name: 'Ultralight tent', category: 'shelter', quantity: 1 },
      { id: 'd2-2', name: 'Down sleeping bag', category: 'sleeping', quantity: 1 },
      { id: 'd2-3', name: 'Foam sleeping mat', category: 'sleeping', quantity: 1 },
      { id: 'd2-4', name: 'Alcohol stove', category: 'cooking', quantity: 1 },
      { id: 'd2-5', name: 'Titanium mug', category: 'cooking', quantity: 1 },
      { id: 'd2-6', name: 'Trekking poles', category: 'tools', quantity: 2 },
      { id: 'd2-7', name: 'Power bank', category: 'tools', quantity: 1 },
      { id: 'd2-8', name: 'Map + compass', category: 'tools', quantity: 1 },
      { id: 'd2-9', name: 'Hardshell jacket', category: 'clothing', quantity: 1 },
      { id: 'd2-10', name: 'Hiking boots', category: 'clothing', quantity: 1 },
      { id: 'd2-11', name: 'Mini first aid kit', category: 'first-aid', quantity: 1 },
      { id: 'd2-12', name: 'Emergency blanket', category: 'first-aid', quantity: 1 },
    ],
  },
  {
    id: 'default-winter-bivouac',
    name: 'Winter bivouac',
    description: 'Gear for overnight camping in winter conditions.',
    items: [
      { id: 'd3-1', name: '4-season tent', category: 'shelter', quantity: 1 },
      { id: 'd3-2', name: 'Winter sleeping bag (-20°C)', category: 'sleeping', quantity: 1 },
      { id: 'd3-3', name: 'Insulating mat', category: 'sleeping', quantity: 1 },
      { id: 'd3-4', name: 'Mat underlay', category: 'sleeping', quantity: 1 },
      { id: 'd3-5', name: 'Cold-weather stove', category: 'cooking', quantity: 1 },
      { id: 'd3-6', name: 'Winter gas canister', category: 'cooking', quantity: 3 },
      { id: 'd3-7', name: 'Thermos', category: 'cooking', quantity: 1 },
      { id: 'd3-8', name: 'Down jacket', category: 'clothing', quantity: 1 },
      { id: 'd3-9', name: 'Ski pants', category: 'clothing', quantity: 1 },
      { id: 'd3-10', name: 'Gloves', category: 'clothing', quantity: 2 },
      { id: 'd3-11', name: 'Balaclava', category: 'clothing', quantity: 1 },
      { id: 'd3-12', name: 'Crampons / microspikes', category: 'tools', quantity: 1 },
      { id: 'd3-13', name: 'Snow shovel', category: 'tools', quantity: 1 },
      { id: 'd3-14', name: 'Emergency blanket', category: 'first-aid', quantity: 2 },
      { id: 'd3-15', name: 'Chemical hand warmers', category: 'other', quantity: 4 },
    ],
  },
  {
    id: 'default-car-camping',
    name: 'Car camping',
    description: 'Comfortable camping by the car — no weight limits.',
    items: [
      { id: 'd4-1', name: 'Family tent', category: 'shelter', quantity: 1 },
      { id: 'd4-2', name: 'Tent awning', category: 'shelter', quantity: 1 },
      { id: 'd4-3', name: 'Sleeping bag', category: 'sleeping', quantity: 2 },
      { id: 'd4-4', name: 'Inflatable mattress', category: 'sleeping', quantity: 1 },
      { id: 'd4-5', name: 'Electric pump', category: 'sleeping', quantity: 1 },
      { id: 'd4-6', name: '2-burner camping stove', category: 'cooking', quantity: 1 },
      { id: 'd4-7', name: 'Camping cooler', category: 'cooking', quantity: 1 },
      { id: 'd4-8', name: 'Cookware set', category: 'cooking', quantity: 1 },
      { id: 'd4-9', name: 'Folding table', category: 'other', quantity: 1 },
      { id: 'd4-10', name: 'Camping chairs', category: 'other', quantity: 2 },
      { id: 'd4-11', name: 'LED lantern', category: 'tools', quantity: 1 },
      { id: 'd4-12', name: 'Extension cord / power station', category: 'tools', quantity: 1 },
      { id: 'd4-13', name: 'First aid kit', category: 'first-aid', quantity: 1 },
      { id: 'd4-14', name: 'Insect repellent', category: 'first-aid', quantity: 1 },
    ],
  },
] as const;

const rows = DEFAULT_TEMPLATES.map((t) => ({
  id: t.id,
  userId: null,
  name: t.name,
  description: t.description,
  items: t.items,
  isDefault: true,
}));

await db.insert(templates).values(rows).onConflictDoNothing();
console.log(`Seeded ${rows.length} default templates.`);
process.exit(0);
