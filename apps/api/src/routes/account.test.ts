import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { accountRouter } from './account.js';
import type { AppVariables } from '../types.js';

const { mockDb, selectWhere } = vi.hoisted(() => {
  const selectWhere = vi.fn();
  const mutateWhere = vi.fn(() => ({ returning: vi.fn() }));
  const mockDb = {
    select: vi.fn(() => ({ from: vi.fn(() => ({ where: selectWhere })) })),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(() => ({ where: mutateWhere })),
  };
  return { mockDb, selectWhere };
});

vi.mock('../db/index.js', () => ({ db: mockDb }));

vi.mock('../middleware/session.js', () => ({
  requireSession: async (c: Context, next: Next) => {
    c.set('userId', 'user-1');
    await next();
  },
}));

function makeApp() {
  const app = new Hono<{ Variables: AppVariables }>();
  app.route('/api/account', accountRouter);
  return app;
}

const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test User' };

beforeEach(() => {
  vi.clearAllMocks();
});

describe('DELETE /api/account', () => {
  it('deletes the account and returns ok', async () => {
    selectWhere.mockResolvedValue([mockUser]);

    const res = await makeApp().request('/api/account', { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);

    expect(mockDb.delete).toHaveBeenCalledTimes(4);
  });

  it('returns 404 when user is not found', async () => {
    selectWhere.mockResolvedValue([]);

    const res = await makeApp().request('/api/account', { method: 'DELETE' });
    expect(res.status).toBe(404);

    expect(mockDb.delete).not.toHaveBeenCalled();
  });
});
