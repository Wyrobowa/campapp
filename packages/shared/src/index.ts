import { z } from 'zod';

// ── PRIMITIVES ────────────────────────────────────────────────────

export const GearCategorySchema = z.enum([
  'shelter',
  'sleeping',
  'cooking',
  'clothing',
  'tools',
  'first-aid',
  'other',
]);

// ── GEAR ITEM ─────────────────────────────────────────────────────

export const GearItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: GearCategorySchema,
  quantity: z.number().int().positive(),
  packed: z.boolean(),
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

// ── TRIP ──────────────────────────────────────────────────────────

export const TripSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  templateId: z.string().optional(),
  items: z.array(GearItemSchema),
  notes: z.string().optional(),
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
export type Trip = z.infer<typeof TripSchema>;
