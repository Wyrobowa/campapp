export const CATEGORIES: { id: string; label: string; emoji: string }[] = [
  { id: 'shelter', label: 'Shelter', emoji: '⛺' },
  { id: 'sleeping', label: 'Sleeping', emoji: '🛌' },
  { id: 'cooking', label: 'Cooking', emoji: '🍳' },
  { id: 'clothing', label: 'Clothing', emoji: '👕' },
  { id: 'tools', label: 'Tools', emoji: '🔧' },
  { id: 'first-aid', label: 'First aid', emoji: '🩹' },
  { id: 'other', label: 'Other', emoji: '📦' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  string,
  (typeof CATEGORIES)[number]
>;

export function getCategoryDisplay(id: string): { label: string; emoji: string } {
  return CATEGORY_MAP[id] ?? { label: id, emoji: '📦' };
}
