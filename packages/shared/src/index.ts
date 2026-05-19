import { z } from 'zod';

// ── PRIMITIVES ────────────────────────────────────────────────────

export const BUILT_IN_CATEGORIES = [
  'shelter',
  'sleeping',
  'cooking',
  'clothing',
  'tools',
  'first-aid',
  'other',
] as const;

export const GearCategorySchema = z.string().min(1);

// ── GEAR ITEM ─────────────────────────────────────────────────────

export const GearItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: GearCategorySchema,
  quantity: z.number().int().positive(),
  packed: z.boolean(),
  notes: z.string().optional(),
  weight: z.number().nonnegative().optional(),
  weightUnit: z.enum(['g', 'oz']).optional(),
});

export const TemplateItemSchema = GearItemSchema.omit({ packed: true });

// ── TEMPLATE ──────────────────────────────────────────────────────

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  items: z.array(TemplateItemSchema),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ── COLLABORATOR ──────────────────────────────────────────────────

export const CollaboratorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

// ── TRIP ──────────────────────────────────────────────────────────

export const TripSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  date: z.string(),
  templateId: z.string().nullable().optional(),
  items: z.array(GearItemSchema),
  notes: z.string().nullable().optional(),
  shareToken: z.string().nullable().optional(),
  collaborators: z.array(CollaboratorSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ── ARRAY SCHEMAS ─────────────────────────────────────────────────

export const TripArraySchema = z.array(TripSchema);
export const TemplateArraySchema = z.array(TemplateSchema);

// ── INFERRED TYPES ────────────────────────────────────────────────

export type GearCategory = z.infer<typeof GearCategorySchema>;
export type GearItem = z.infer<typeof GearItemSchema>;
export type TemplateItem = z.infer<typeof TemplateItemSchema>;
export type Template = z.infer<typeof TemplateSchema>;
export type Collaborator = z.infer<typeof CollaboratorSchema>;
export type Trip = z.infer<typeof TripSchema>;
