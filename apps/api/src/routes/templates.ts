import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { and, eq, isNull, or } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { TemplateItemSchema } from '@campapp/shared';
import { db } from '../db/index.js';
import { templates } from '../db/schema.js';
import { requireSession } from '../middleware/session.js';
import type { AppVariables } from '../types.js';

const router = new Hono<{ Variables: AppVariables }>();

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  items: z.array(TemplateItemSchema).default([]),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  items: z.array(TemplateItemSchema).optional(),
});

router.use('/*', requireSession);

// Returns the user's own templates and any built-in defaults (userId IS NULL)
router.get('/', async (c) => {
  const userId = c.get('userId');
  const rows = await db
    .select()
    .from(templates)
    .where(or(eq(templates.userId, userId), isNull(templates.userId)));
  return c.json(rows);
});

router.post('/', zValidator('json', createSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const [template] = await db
    .insert(templates)
    .values({
      id: randomUUID(),
      userId,
      name: body.name,
      description: body.description,
      items: body.items,
      isDefault: false,
    })
    .returning();
  return c.json(template, 201);
});

router.get('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [template] = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.id, id),
        or(eq(templates.userId, userId), isNull(templates.userId)),
      ),
    );
  if (!template) return c.json({ error: 'Not found' }, 404);
  return c.json(template);
});

router.put('/:id', zValidator('json', updateSchema), async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = c.req.valid('json');
  const [template] = await db
    .update(templates)
    .set(body)
    .where(and(eq(templates.id, id), eq(templates.userId, userId)))
    .returning();
  if (!template) return c.json({ error: 'Not found' }, 404);
  return c.json(template);
});

router.delete('/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const [template] = await db
    .delete(templates)
    .where(and(eq(templates.id, id), eq(templates.userId, userId)))
    .returning();
  if (!template) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true });
});

export { router as templatesRouter };
