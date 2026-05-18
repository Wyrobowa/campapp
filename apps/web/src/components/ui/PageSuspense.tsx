import { Suspense } from 'react';
import type { ReactNode } from 'react';

export function PageSuspense({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
