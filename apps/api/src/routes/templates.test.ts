import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { templatesRouter } from './templates.js';
import type { AppVariables } from '../types.js';

// ── mocks ──────────────────────────────────────────────────────────

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
  app.route('/api/templates', templatesRouter);
  return app;
}

const template = {
  id: 'tmpl-1',
  userId: 'user-1',
  name: 'Weekend camping',
  description: null,
  items: [],
  isDefault: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const defaultTemplate = { ...template, id: 'tmpl-default', userId: null, isDefault: true };

beforeEach(() => {
  vi.clearAllMocks();
});

// ── tests ──────────────────────────────────────────────────────────

describe('GET /api/templates', () => {
  it('returns user templates and built-in defaults', async () => {
    selectWhere.mockResolvedValue([template, defaultTemplate]);
    const res = await makeApp().request('/api/templates');
    expect(res.status).toBe(200);
    const body = (await res.json()) as typeof template[];
    expect(body).toHaveLength(2);
  });
});

describe('POST /api/templates', () => {
  it('creates a template and returns 201', async () => {
    insertReturn.mockResolvedValue([template]);
    const res = await makeApp().request('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Weekend camping', items: [] }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as typeof template;
    expect(body.id).toBe('tmpl-1');
    expect(body.isDefault).toBe(false);
  });

  it('returns 400 for empty name', async () => {
    const res = await makeApp().request('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', items: [] }),
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/templates/:id', () => {
  it('returns the template', async () => {
    selectWhere.mockResolvedValue([template]);
    const res = await makeApp().request('/api/templates/tmpl-1');
    expect(res.status).toBe(200);
  });

  it('returns 404 when not found', async () => {
    selectWhere.mockResolvedValue([]);
    const res = await makeApp().request('/api/templates/nope');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/templates/:id', () => {
  it('updates a user-owned template', async () => {
    mutateReturn.mockResolvedValue([{ ...template, name: 'Updated' }]);
    const res = await makeApp().request('/api/templates/tmpl-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as typeof template;
    expect(body.name).toBe('Updated');
  });

  it('returns 404 for a built-in default (userId IS NULL)', async () => {
    mutateReturn.mockResolvedValue([]);
    const res = await makeApp().request('/api/templates/tmpl-default', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Hack' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/templates/:id', () => {
  it('deletes a user-owned template', async () => {
    mutateReturn.mockResolvedValue([template]);
    const res = await makeApp().request('/api/templates/tmpl-1', { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);
  });

  it('returns 404 for built-in defaults', async () => {
    mutateReturn.mockResolvedValue([]);
    const res = await makeApp().request('/api/templates/tmpl-default', { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});
