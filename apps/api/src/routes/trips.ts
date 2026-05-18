import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { db } from '../db/index.js';
import { trips } from '../db/schema.js';
import { requireSession } from '../middleware/session.js';
import type { AppVariables } from '../types.js';

const router = new Hono<{ Variables: AppVariables }>();

const gearItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  quantity: z.number().int().min(1),
  packed: z.boolean(),
  notes: z.string().optional(),
});

const createSchema = z.object({
  name: z.string().min(1),
  date: z.string(),
  notes: z.string().optional(),
  templateId: z.string().optional(),
  items: z.array(gearItemSchema).default([]),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
  templateId: z.string().optional(),
  items: z.array(gearItemSchema).optional(),
});

router.use('/*', requireSession);

router.get('/', async (c) => {
  const userId = c.get('userId');
  const rows = await db.select().from(trips).where(eq(trips.userId, userId));
  return c.json(rows);
});

router.post('/', zValidator('json', createSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const now = new Date();
  const [trip] = await db
    .insert(trips)
    .values({
      id: randomUUID(),
      userId,
      name: body.name,
      date: body.date,
      notes: body.notes,
      templateId: body.templateId,
      items: body.items,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return c.json(trip, 201);
});

router.get('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, userId)));
  if (!trip) return c.json({ error: 'Not found' }, 404);
  return c.json(trip);
});

router.put('/:id', zValidator('json', updateSchema), async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const [trip] = await db
    .update(trips)
    .set({ ...body, updatedAt: new Date() })
    .where(and(eq(trips.id, id), eq(trips.userId, userId)))
    .returning();
  if (!trip) return c.json({ error: 'Not found' }, 404);
  return c.json(trip);
});

router.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [trip] = await db
    .delete(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, userId)))
    .returning();
  if (!trip) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export { router as tripsRouter };
