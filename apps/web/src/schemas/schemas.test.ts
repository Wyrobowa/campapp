import { describe, it, expect } from 'vitest';
import { GearItemSchema, TripSchema, TripArraySchema, TemplateSchema } from './index';

const validGearItem = {
  id: 'item-1',
  name: 'Tent',
  category: 'shelter',
  quantity: 2,
  packed: false,
};

const validTrip = {
  id: 'trip-1',
  name: 'Weekend camp',
  date: '2025-08-01',
  items: [validGearItem],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('GearItemSchema', () => {
  it('accepts a valid gear item', () => {
    expect(GearItemSchema.safeParse(validGearItem).success).toBe(true);
  });

  it('rejects an invalid category', () => {
    expect(GearItemSchema.safeParse({ ...validGearItem, category: 'vehicle' }).success).toBe(false);
  });

  it('rejects zero quantity', () => {
    expect(GearItemSchema.safeParse({ ...validGearItem, quantity: 0 }).success).toBe(false);
  });

  it('rejects negative quantity', () => {
    expect(GearItemSchema.safeParse({ ...validGearItem, quantity: -1 }).success).toBe(false);
  });

  it('rejects fractional quantity', () => {
    expect(GearItemSchema.safeParse({ ...validGearItem, quantity: 1.5 }).success).toBe(false);
  });

  it('rejects missing name', () => {
    const { name: _, ...noName } = validGearItem;
    expect(GearItemSchema.safeParse(noName).success).toBe(false);
  });
});

describe('TripSchema', () => {
  it('accepts a valid trip', () => {
    expect(TripSchema.safeParse(validTrip).success).toBe(true);
  });

  it('accepts optional notes and templateId', () => {
    const result = TripSchema.safeParse({ ...validTrip, notes: 'fun', templateId: 't-1' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toBe('fun');
      expect(result.data.templateId).toBe('t-1');
    }
  });

  it('rejects missing id', () => {
    const { id: _, ...noId } = validTrip;
    expect(TripSchema.safeParse(noId).success).toBe(false);
  });

  it('rejects items with invalid gear item', () => {
    const result = TripSchema.safeParse({
      ...validTrip,
      items: [{ ...validGearItem, quantity: 0 }],
    });
    expect(result.success).toBe(false);
  });
});

describe('TripArraySchema', () => {
  it('accepts empty array', () => {
    expect(TripArraySchema.safeParse([]).success).toBe(true);
  });

  it('accepts array of valid trips', () => {
    expect(TripArraySchema.safeParse([validTrip]).success).toBe(true);
  });

  it('rejects non-array', () => {
    expect(TripArraySchema.safeParse(validTrip).success).toBe(false);
  });

  it('rejects array with invalid trip', () => {
    expect(TripArraySchema.safeParse([{ ...validTrip, id: undefined }]).success).toBe(false);
  });
});

const validTemplate = {
  id: 'tmpl-1',
  name: 'Hiking starter',
  isDefault: false,
  items: [{ id: 'i-1', name: 'Tent', category: 'shelter', quantity: 1 }],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('TemplateSchema', () => {
  it('accepts a valid template', () => {
    expect(TemplateSchema.safeParse(validTemplate).success).toBe(true);
  });

  it('accepts optional description', () => {
    const result = TemplateSchema.safeParse({ ...validTemplate, description: 'A starter kit' });
    expect(result.success).toBe(true);
  });

  it('rejects missing createdAt', () => {
    const { createdAt: _, ...noCreatedAt } = validTemplate;
    expect(TemplateSchema.safeParse(noCreatedAt).success).toBe(false);
  });

  it('rejects template with packed field on items', () => {
    // TemplateItemSchema omits packed — Zod strips unknown keys so it still passes
    const template = {
      ...validTemplate,
      items: [{ id: 'i-1', name: 'Tent', category: 'shelter', quantity: 1, packed: true }],
    };
    expect(TemplateSchema.safeParse(template).success).toBe(true);
  });
});
