import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './auth.js';
import { tripsRouter } from './routes/trips.js';
import { templatesRouter } from './routes/templates.js';
import { accountRouter } from './routes/account.js';
import { shareRouter } from './routes/share.js';
import { pushRouter } from './routes/push.js';
import { startTripReminderJob } from './jobs/tripReminders.js';
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
app.route('/api/account', accountRouter);
app.route('/api/share', shareRouter);
app.route('/api/push', pushRouter);

const port = Number(process.env.PORT ?? 3000);
serve({ fetch: app.fetch, port }, () => {
  console.log(`API running on http://localhost:${port}`);
  startTripReminderJob();
});
