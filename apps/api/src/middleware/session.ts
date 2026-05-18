import type { Context, Next } from 'hono';
import { auth } from '../auth.js';
import type { AppVariables } from '../types.js';

export async function requireSession(
  c: Context<{ Variables: AppVariables }>,
  next: Next,
) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: 'Unauthorized' }, 401);
  c.set('userId', session.user.id);
  await next();
}
