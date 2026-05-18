import { create } from 'zustand';
import { db } from '../db';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { generateId } from '../utils/id';
import type { Template, GearItem, Trip } from '../schemas';

interface TemplatesState {
  customTemplates: Template[];
  templates: Template[];
  hydrate: () => Promise<void>;
  createTemplate: (
    data: Pick<Template, 'name' | 'description'>,
    items: Omit<GearItem, 'packed'>[]
  ) => Template;
  createTemplateFromTrip: (trip: Trip) => Template;
  updateTemplate: (id: string, patch: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
}

function allTemplates(custom: Template[]): Template[] {
  return [...DEFAULT_TEMPLATES, ...custom];
}

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  customTemplates: [],
  templates: DEFAULT_TEMPLATES,

  hydrate: async () => {
    const custom = await db.templates.toArray();
    set({ customTemplates: custom, templates: allTemplates(custom) });
  },

  createTemplate: (data, items) => {
    const template: Template = { id: generateId(), ...data, items, isDefault: false };
    set((state) => {
      const custom = [template, ...state.customTemplates];
      return { customTemplates: custom, templates: allTemplates(custom) };
    });
    void db.templates.put(template);
    return template;
  },

  createTemplateFromTrip: (trip) => {
    const template: Template = {
      id: generateId(),
      name: `${trip.name} (template)`,
      description: `Template from trip: ${trip.name}`,
      items: trip.items.map(({ packed: _packed, ...item }) => item),
      isDefault: false,
    };
    set((state) => {
      const custom = [template, ...state.customTemplates];
      return { customTemplates: custom, templates: allTemplates(custom) };
    });
    void db.templates.put(template);
    return template;
  },

  updateTemplate: (id, patch) => {
    set((state) => {
      const custom = state.customTemplates.map((t) => (t.id === id ? { ...t, ...patch } : t));
      return { customTemplates: custom, templates: allTemplates(custom) };
    });
    const updated = get().customTemplates.find((t) => t.id === id);
    if (updated) void db.templates.put(updated);
  },

  deleteTemplate: (id) => {
    set((state) => {
      const custom = state.customTemplates.filter((t) => t.id !== id);
      return { customTemplates: custom, templates: allTemplates(custom) };
    });
    void db.templates.delete(id);
  },
}));
