import { useState, useCallback } from 'react';
import type { z } from 'zod';
import { storageParse, storageSet } from '../utils/storage';

export function useLocalStorage<T>(key: string, schema: z.ZodType<T>, initial: T) {
  const [value, setValue] = useState<T>(() => storageParse(key, schema, initial));

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        storageSet(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return [value, set] as const;
}
