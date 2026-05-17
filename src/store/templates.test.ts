import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db', () => ({
  db: {
    templates: {
      toArray: vi.fn().mockResolvedValue([]),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

import { useTemplatesStore } from './templates';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';

beforeEach(() => {
  useTemplatesStore.setState({ customTemplates: [], templates: DEFAULT_TEMPLATES });
});

const baseItems = [{ id: 'i-1', name: 'Tent', category: 'shelter' as const, quantity: 1 }];

describe('useTemplatesStore – createTemplate', () => {
  it('adds to customTemplates', () => {
    useTemplatesStore.getState().createTemplate({ name: 'My pack' }, baseItems);
    expect(useTemplatesStore.getState().customTemplates).toHaveLength(1);
    expect(useTemplatesStore.getState().customTemplates[0]?.name).toBe('My pack');
  });

  it('prepends custom templates to combined list after default templates', () => {
    useTemplatesStore.getState().createTemplate({ name: 'First' }, []);
    useTemplatesStore.getState().createTemplate({ name: 'Second' }, []);
    const { templates } = useTemplatesStore.getState();
    const customNames = templates.filter((t) => !t.isDefault).map((t) => t.name);
    expect(customNames[0]).toBe('Second');
    expect(customNames[1]).toBe('First');
  });

  it('sets isDefault to false', () => {
    const t = useTemplatesStore.getState().createTemplate({ name: 'Custom' }, []);
    expect(t.isDefault).toBe(false);
  });

  it('combined templates list includes both default and custom', () => {
    useTemplatesStore.getState().createTemplate({ name: 'Mine' }, []);
    const { templates } = useTemplatesStore.getState();
    expect(templates.some((t) => t.isDefault)).toBe(true);
    expect(templates.some((t) => !t.isDefault)).toBe(true);
  });
});

describe('useTemplatesStore – deleteTemplate', () => {
  it('removes from customTemplates', () => {
    const t = useTemplatesStore.getState().createTemplate({ name: 'Gone' }, []);
    useTemplatesStore.getState().deleteTemplate(t.id);
    expect(useTemplatesStore.getState().customTemplates).toHaveLength(0);
  });

  it('default templates are unaffected', () => {
    const t = useTemplatesStore.getState().createTemplate({ name: 'Gone' }, []);
    useTemplatesStore.getState().deleteTemplate(t.id);
    const { templates } = useTemplatesStore.getState();
    expect(templates.filter((x) => x.isDefault)).toHaveLength(DEFAULT_TEMPLATES.length);
  });
});

describe('useTemplatesStore – updateTemplate', () => {
  it('updates name on custom template', () => {
    const t = useTemplatesStore.getState().createTemplate({ name: 'Old' }, []);
    useTemplatesStore.getState().updateTemplate(t.id, { name: 'New' });
    const updated = useTemplatesStore.getState().customTemplates.find((x) => x.id === t.id);
    expect(updated?.name).toBe('New');
  });

  it('is reflected in combined templates list', () => {
    const t = useTemplatesStore.getState().createTemplate({ name: 'Old' }, []);
    useTemplatesStore.getState().updateTemplate(t.id, { name: 'Updated' });
    const { templates } = useTemplatesStore.getState();
    expect(templates.find((x) => x.id === t.id)?.name).toBe('Updated');
  });
});

describe('useTemplatesStore – createTemplateFromTrip', () => {
  it('creates a template with correct name suffix', () => {
    const fakeTrip = {
      id: 'trip-1',
      name: 'Lake hike',
      date: '2025-08-01',
      items: [{ id: 'i-1', name: 'Tent', category: 'shelter' as const, quantity: 1, packed: true }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const t = useTemplatesStore.getState().createTemplateFromTrip(fakeTrip);
    expect(t.name).toBe('Lake hike (template)');
  });

  it('strips packed field from items', () => {
    const fakeTrip = {
      id: 'trip-1',
      name: 'Test trip',
      date: '2025-08-01',
      items: [{ id: 'i-1', name: 'Tent', category: 'shelter' as const, quantity: 1, packed: true }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const t = useTemplatesStore.getState().createTemplateFromTrip(fakeTrip);
    expect('packed' in (t.items[0] ?? {})).toBe(false);
  });
});
