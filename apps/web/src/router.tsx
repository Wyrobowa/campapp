import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { RootLayout } from './components/layout/RootLayout';
import { PageSuspense } from './components/ui/PageSuspense';
import {
  LazyHome,
  LazyTripDetail,
  LazyTemplates,
  LazyAccount,
  LazyForgotPassword,
  LazyResetPassword,
} from './pages/lazy';

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

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: () => (
    <PageSuspense>
      <LazyAccount />
    </PageSuspense>
  ),
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: () => (
    <PageSuspense>
      <LazyForgotPassword />
    </PageSuspense>
  ),
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: () => (
    <PageSuspense>
      <LazyResetPassword />
    </PageSuspense>
  ),
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  tripRoute,
  templatesRoute,
  accountRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
