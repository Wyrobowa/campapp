/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ url }: { url: URL }) =>
    url.pathname.startsWith('/api/trips') || url.pathname.startsWith('/api/templates'),
  new NetworkFirst({
    cacheName: 'campapp-api',
    networkTimeoutSeconds: 5,
  })
);

self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() as { title: string; body: string; tripId?: string } | undefined;
  if (!data) return;
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { tripId: data.tripId },
    })
  );
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const tripId = (event.notification.data as { tripId?: string }).tripId;
  const url = tripId ? `/trips/${tripId}` : '/';
  event.waitUntil(clients.openWindow(url));
});
