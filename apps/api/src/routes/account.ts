import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { user, verification, trips, templates } from '../db/schema.js';
import { requireSession } from '../middleware/session.js';
import type { AppVariables } from '../types.js';

const router = new Hono<{ Variables: AppVariables }>();

router.use('/*', requireSession);

router.delete('/', async (c) => {
  const userId = c.get('userId');

  const [currentUser] = await db.select().from(user).where(eq(user.id, userId));
  if (!currentUser) return c.json({ error: 'Not found' }, 404);

  // verification has no FK cascade — delete by email identifier
  await db.delete(verification).where(eq(verification.identifier, currentUser.email));

  // trips + templates + session + account all cascade from user
  await db.delete(trips).where(eq(trips.userId, userId));
  await db.delete(templates).where(eq(templates.userId, userId));
  await db.delete(user).where(eq(user.id, userId));

  return c.json({ ok: true });
});

export { router as accountRouter };
