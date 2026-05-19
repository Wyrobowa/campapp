import cron from 'node-cron';
import webpush from 'web-push';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { trips, pushSubscriptions } from '../db/schema.js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY ?? '',
  process.env.VAPID_PRIVATE_KEY ?? ''
);

async function sendTripReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);

  const upcomingTrips = await db.select().from(trips).where(eq(trips.date, tomorrowStr));

  for (const trip of upcomingTrips) {
    const subs = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, trip.userId));

    const payload = JSON.stringify({
      title: 'Trip tomorrow!',
      body: `"${trip.name}" is tomorrow. Ready to pack?`,
      tripId: trip.id,
    });

    await Promise.allSettled(
      subs.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
      )
    );
  }
}

export function startTripReminderJob() {
  // Run at 08:00 every day
  cron.schedule('0 8 * * *', () => {
    void sendTripReminders();
  });
}
