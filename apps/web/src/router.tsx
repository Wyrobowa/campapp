import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { RootLayout } from './components/layout/RootLayout';
import { PageSuspense } from './components/ui/PageSuspense';
import { LazyHome, LazyTripDetail, LazyTemplates } from './pages/lazy';

const rootRoute = createRootRoute({ component: RootLayout });

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <PageSuspense>
      <LazyHome />
    </PageSuspense>
  ),
});

const tripRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trips/$tripId',
  component: () => (
    <PageSuspense>
      <LazyTripDetail />
    </PageSuspense>
  ),
});

const templatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/templates',
  component: () => (
    <PageSuspense>
      <LazyTemplates />
    </PageSuspense>
  ),
});

const routeTree = rootRoute.addChildren([homeRoute, tripRoute, templatesRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
