import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './auth.js';
import { tripsRouter } from './routes/trips.js';
import { templatesRouter } from './routes/templates.js';
import type { AppVariables } from './types.js';

const app = new Hono<{ Variables: AppVariables }>();

app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

app.on(['GET', 'POST'], '/api/auth/**', (c) => auth.handler(c.req.raw));

app.route('/api/trips', tripsRouter);
app.route('/api/templates', templatesRouter);

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on http://localhost:${port}`);
});
