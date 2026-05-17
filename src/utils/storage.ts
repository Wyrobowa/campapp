import { z } from 'zod';

export function storageParse<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const result = schema.safeParse(JSON.parse(raw) as unknown);
    if (result.success) return result.data;
    if (import.meta.env.DEV) {
      console.warn(
        `[storage] Corrupt data for "${key}" — using fallback.`,
        z.treeifyError(result.error)
      );
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function storageSet(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}
