import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { and, eq, or } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { GearItemSchema } from '@campapp/shared';
import { db } from '../db/index.js';
import { trips, tripCollaborators, user } from '../db/schema.js';
import { requireSession } from '../middleware/session.js';
import type { AppVariables } from '../types.js';

const router = new Hono<{ Variables: AppVariables }>();

const createSchema = z.object({
  name: z.string().min(1),
  date: z.string(),
  notes: z.string().optional(),
  templateId: z.string().optional(),
  items: z.array(GearItemSchema).default([]),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  date: z.string().optional(),
  notes: z.string().optional(),
  templateId: z.string().optional(),
  items: z.array(GearItemSchema).optional(),
});

router.use('/*', requireSession);

async function getCollaborators(tripId: string) {
  const rows = await db
    .select({ id: user.id, name: user.name, email: user.email })
    .from(tripCollaborators)
    .innerJoin(user, eq(tripCollaborators.userId, user.id))
    .where(eq(tripCollaborators.tripId, tripId));
  return rows;
}

router.get('/', async (c) => {
  const userId = c.get('userId');

  const collabTripIds = await db
    .select({ tripId: tripCollaborators.tripId })
    .from(tripCollaborators)
    .where(eq(tripCollaborators.userId, userId));
  const collabIds = collabTripIds.map((r) => r.tripId);

  let rows;
  if (collabIds.length > 0) {
    rows = await db
      .select()
      .from(trips)
      .where(or(eq(trips.userId, userId), ...collabIds.map((id) => eq(trips.id, id))));
  } else {
    rows = await db.select().from(trips).where(eq(trips.userId, userId));
  }

  const withCollaborators = await Promise.all(
    rows.map(async (trip) => ({ ...trip, collaborators: await getCollaborators(trip.id) }))
  );

  return c.json(withCollaborators);
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
  return c.json({ ...trip, collaborators: [] }, 201);
});

router.get('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  const [trip] = await db.select().from(trips).where(eq(trips.id, id));
  if (!trip) return c.json({ error: 'Not found' }, 404);

  const isCollaborator = await db
    .select()
    .from(tripCollaborators)
    .where(and(eq(tripCollaborators.tripId, id), eq(tripCollaborators.userId, userId)));

  if (trip.userId !== userId && isCollaborator.length === 0) {
    return c.json({ error: 'Not found' }, 404);
  }

  return c.json({ ...trip, collaborators: await getCollaborators(id) });
});

router.put('/:id', zValidator('json', updateSchema), async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = c.req.valid('json');

  const [existing] = await db.select().from(trips).where(eq(trips.id, id));
  if (!existing) return c.json({ error: 'Not found' }, 404);

  const isCollaborator = await db
    .select()
    .from(tripCollaborators)
    .where(and(eq(tripCollaborators.tripId, id), eq(tripCollaborators.userId, userId)));

  if (existing.userId !== userId && isCollaborator.length === 0) {
    return c.json({ error: 'Not found' }, 404);
  }

  const [trip] = await db
    .update(trips)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(trips.id, id))
    .returning();

  return c.json({ ...trip, collaborators: await getCollaborators(id) });
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

router.post('/:id/share', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const shareToken = randomUUID();
  const [trip] = await db
    .update(trips)
    .set({ shareToken, updatedAt: new Date() })
    .where(and(eq(trips.id, id), eq(trips.userId, userId)))
    .returning();
  if (!trip) return c.json({ error: 'Not found' }, 404);
  return c.json({ shareToken });
});

router.delete('/:id/share', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [trip] = await db
    .update(trips)
    .set({ shareToken: null, updatedAt: new Date() })
    .where(and(eq(trips.id, id), eq(trips.userId, userId)))
    .returning();
  if (!trip) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

router.post(
  '/:id/collaborators',
  zValidator('json', z.object({ email: z.string().email() })),
  async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const { email } = c.req.valid('json');

    const [trip] = await db
      .select()
      .from(trips)
      .where(and(eq(trips.id, id), eq(trips.userId, userId)));
    if (!trip) return c.json({ error: 'Not found' }, 404);

    const [invitee] = await db.select().from(user).where(eq(user.email, email));
    if (!invitee) return c.json({ error: 'User not found' }, 404);
    if (invitee.id === userId) return c.json({ error: 'Cannot invite yourself' }, 400);

    const existing = await db
      .select()
      .from(tripCollaborators)
      .where(and(eq(tripCollaborators.tripId, id), eq(tripCollaborators.userId, invitee.id)));
    if (existing.length > 0) return c.json({ error: 'Already a collaborator' }, 409);

    await db.insert(tripCollaborators).values({
      id: randomUUID(),
      tripId: id,
      userId: invitee.id,
      invitedBy: userId,
      createdAt: new Date(),
    });

    return c.json({ id: invitee.id, name: invitee.name, email: invitee.email }, 201);
  }
);

router.delete('/:id/collaborators/:collaboratorId', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const collaboratorId = c.req.param('collaboratorId');

  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, id), eq(trips.userId, userId)));
  if (!trip) return c.json({ error: 'Not found' }, 404);

  await db
    .delete(tripCollaborators)
    .where(
      and(eq(tripCollaborators.tripId, id), eq(tripCollaborators.userId, collaboratorId))
    );

  return c.json({ ok: true });
});

export { router as tripsRouter };
