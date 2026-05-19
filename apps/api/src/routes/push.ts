import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../db/index.js';
import { pushSubscriptions } from '../db/schema.js';
import { requireSession } from '../middleware/session.js';
import type { AppVariables } from '../types.js';

const router = new Hono<{ Variables: AppVariables }>();

router.use('/*', requireSession);

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
});

router.post('/subscribe', zValidator('json', subscribeSchema), async (c) => {
  const userId = c.get('userId');
  const { endpoint, keys } = c.req.valid('json');

  await db
    .insert(pushSubscriptions)
    .values({ id: randomUUID(), userId, endpoint, p256dh: keys.p256dh, auth: keys.auth, createdAt: new Date() })
    .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { userId, p256dh: keys.p256dh, auth: keys.auth } });

  return c.json({ ok: true });
});

router.delete('/subscribe', zValidator('json', z.object({ endpoint: z.string() })), async (c) => {
  const userId = c.get('userId');
  const { endpoint } = c.req.valid('json');

  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.userId, userId)));

  return c.json({ ok: true });
});

export { router as pushRouter };
