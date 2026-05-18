export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso));
}

/** Returns a short relative hint for nearby dates, or null for dates > 14 days away. */
export function relativeDate(iso: string): string | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${iso}T00:00:00`);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff > 1 && diff <= 14) return `in ${diff} days`;
  if (diff < -1 && diff >= -14) return `${Math.abs(diff)} days ago`;
  return null;
}
