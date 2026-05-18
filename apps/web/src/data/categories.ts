import type { GearCategory } from '../types';

export const CATEGORIES: { id: GearCategory; label: string; emoji: string }[] = [
  { id: 'shelter', label: 'Shelter', emoji: '⛺' },
  { id: 'sleeping', label: 'Sleeping', emoji: '🛌' },
  { id: 'cooking', label: 'Cooking', emoji: '🍳' },
  { id: 'clothing', label: 'Clothing', emoji: '👕' },
  { id: 'tools', label: 'Tools', emoji: '🔧' },
  { id: 'first-aid', label: 'First aid', emoji: '🩹' },
  { id: 'other', label: 'Other', emoji: '📦' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  GearCategory,
  (typeof CATEGORIES)[number]
>;
