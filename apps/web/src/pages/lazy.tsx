import { lazy } from 'react';

export const LazyHome = lazy(() => import('./Home').then((m) => ({ default: m.Home })));
export const LazyTripDetail = lazy(() =>
  import('./TripDetail').then((m) => ({ default: m.TripDetail }))
);
export const LazyTemplates = lazy(() =>
  import('./Templates').then((m) => ({ default: m.Templates }))
);
export const LazyAccount = lazy(() => import('./Account').then((m) => ({ default: m.Account })));
