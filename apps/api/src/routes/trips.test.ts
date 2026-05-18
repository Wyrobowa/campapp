import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { tripsRouter } from './trips.js';
import type { AppVariables } from '../types.js';

// ── mocks ──────────────────────────────────────────────────────────
// SELECT chain:  db.select().from().where()  →  selectWhere resolves to rows
// INSERT chain:  db.insert().values().returning()  →  insertReturn resolves to rows
// UPDATE chain:  db.update().set().where().returning()  →  mutateReturn resolves to rows
// DELETE chain:  db.delete().where().returning()  →  mutateReturn resolves to rows

const { mockDb, selectWhere, insertReturn, mutateReturn } = vi.hoisted(() => {
  const selectWhere = vi.fn();
  const insertReturn = vi.fn();
  const mutateReturn = vi.fn();

  const mutateWhere = vi.fn(() => ({ returning: mutateReturn }));
  const mockDb = {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: selectWhere })) })),
    insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: insertReturn })) })),
    update: vi.fn(() => ({ set: vi.fn(() => ({ where: mutateWhere })) })),
    delete: vi.fn(() => ({ where: mutateWhere })),
  };
  return { mockDb, selectWhere, insertReturn, mutateReturn };
});

vi.mock('../db/index.js', () => ({ db: mockDb }));

vi.mock('../middleware/session.js', () => ({
  requireSession: async (c: Context, next: Next) => {
    c.set('userId', 'user-1');
    await next();
  },
}));

// ── test app ───────────────────────────────────────────────────────

function makeApp() {
  const app = new Hono<{ Variables: AppVariables }>();
  app.route('/api/trips', tripsRouter);
  return app;
}

const trip = {
  id: 'trip-1',
  userId: 'user-1',
  name: 'Test trip',
  date: '2025-08-01',
  items: [],
  notes: null,
  templateId: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ── tests ──────────────────────────────────────────────────────────

describe('GET /api/trips', () => {
  it('returns the list of trips', async () => {
    selectWhere.mockResolvedValue([trip]);
    const res = await makeApp().request('/api/trips');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect((body as typeof trip[])[0]?.id).toBe('trip-1');
  });
});

describe('POST /api/trips', () => {
  it('creates a trip and returns 201', async () => {
    insertReturn.mockResolvedValue([trip]);
    const res = await makeApp().request('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test trip', date: '2025-08-01', items: [] }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as typeof trip;
    expect(body.id).toBe('trip-1');
  });

  it('returns 400 for missing name', async () => {
    const res = await makeApp().request('/api/trips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: '2025-08-01' }),
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/trips/:id', () => {
  it('returns the trip when found', async () => {
    selectWhere.mockResolvedValue([trip]);
    const res = await makeApp().request('/api/trips/trip-1');
    expect(res.status).toBe(200);
    const body = (await res.json()) as typeof trip;
    expect(body.id).toBe('trip-1');
  });

  it('returns 404 when not found', async () => {
    selectWhere.mockResolvedValue([]);
    const res = await makeApp().request('/api/trips/nope');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/trips/:id', () => {
  it('updates and returns the trip', async () => {
    mutateReturn.mockResolvedValue([{ ...trip, name: 'Updated' }]);
    const res = await makeApp().request('/api/trips/trip-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as typeof trip;
    expect(body.name).toBe('Updated');
  });

  it('returns 404 when trip belongs to another user', async () => {
    mutateReturn.mockResolvedValue([]);
    const res = await makeApp().request('/api/trips/other-trip', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Nope' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/trips/:id', () => {
  it('deletes and returns ok', async () => {
    mutateReturn.mockResolvedValue([trip]);
    const res = await makeApp().request('/api/trips/trip-1', { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it('returns 404 for non-existent trip', async () => {
    mutateReturn.mockResolvedValue([]);
    const res = await makeApp().request('/api/trips/nope', { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});
