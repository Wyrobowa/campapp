import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { trips } from '../db/schema.js';

const router = new Hono();

router.get('/:token', async (c) => {
  const token = c.req.param('token');
  const [trip] = await db.select().from(trips).where(eq(trips.shareToken, token));
  if (!trip) return c.json({ error: 'Not found' }, 404);
  return c.json({
    id: trip.id,
    name: trip.name,
    date: trip.date,
    notes: trip.notes,
    items: trip.items,
  });
});

export { router as shareRouter };
