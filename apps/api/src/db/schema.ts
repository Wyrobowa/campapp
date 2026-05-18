import { boolean, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// ── AUTH TABLES (required by better-auth) ────────────────────────

export const user = pgTable('user', {
  id:            text('id').primaryKey(),
  name:          text('name').notNull(),
  email:         text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image:         text('image'),
  createdAt:     timestamp('created_at').notNull(),
  updatedAt:     timestamp('updated_at').notNull(),
});

export const session = pgTable('session', {
  id:        text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token:     text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId:    text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const account = pgTable('account', {
  id:                     text('id').primaryKey(),
  accountId:              text('account_id').notNull(),
  providerId:             text('provider_id').notNull(),
  userId:                 text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  password:               text('password'),
  accessToken:            text('access_token'),
  refreshToken:           text('refresh_token'),
  idToken:                text('id_token'),
  accessTokenExpiresAt:   timestamp('access_token_expires_at'),
  refreshTokenExpiresAt:  timestamp('refresh_token_expires_at'),
  scope:                  text('scope'),
  createdAt:              timestamp('created_at').notNull(),
  updatedAt:              timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id:         text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value:      text('value').notNull(),
  expiresAt:  timestamp('expires_at').notNull(),
  createdAt:  timestamp('created_at'),
  updatedAt:  timestamp('updated_at'),
});

// ── APP TABLES ───────────────────────────────────────────────────

export const trips = pgTable('trips', {
  id:         text('id').primaryKey(),
  userId:     text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name:       text('name').notNull(),
  date:       text('date').notNull(),
  notes:      text('notes'),
  templateId: text('template_id'),
  items:      jsonb('items').notNull().default([]),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt:  timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const templates = pgTable('templates', {
  id:          text('id').primaryKey(),
  userId:      text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  name:        text('name').notNull(),
  description: text('description'),
  items:       jsonb('items').notNull().default([]),
  isDefault:   boolean('is_default').notNull().default(false),
});
