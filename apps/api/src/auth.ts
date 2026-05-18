import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/index.js';
import * as schema from './db/schema.js';

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? 'noreply@resend.dev';
  if (!apiKey) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from, to, subject, html }),
  });
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, token }) => {
      const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173';
      const url = `${frontendUrl}/reset-password?token=${token}`;
      await sendEmail(
        user.email,
        'Reset your CampApp password',
        `<p>Click the link below to reset your password. It expires in 1 hour.</p><p><a href="${url}">${url}</a></p>`
      );
    },
    sendEmailVerification: async ({ user, url }: { user: { email: string }; url: string }) => {
      await sendEmail(
        user.email,
        'Verify your CampApp email',
        `<p>Welcome to CampApp! Click the link below to verify your email address.</p><p><a href="${url}">${url}</a></p>`
      );
    },
  },
  trustedOrigins: [process.env.FRONTEND_URL ?? 'http://localhost:5173'],
});
