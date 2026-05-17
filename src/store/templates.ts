import { create } from 'zustand';
import { storageParse, storageSet } from '../utils/storage';
import { TemplateArraySchema } from '../schemas';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import { generateId } from '../utils/id';
import type { Template, GearItem, Trip } from '../schemas';

const KEY = 'camp-templates';

interface TemplatesState {
  customTemplates: Template[];
  templates: Template[];
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

function persist(custom: Template[]) {
  storageSet(KEY, custom);
  return { customTemplates: custom, templates: allTemplates(custom) };
}

const initialCustom = storageParse(KEY, TemplateArraySchema, []);

export const useTemplatesStore = create<TemplatesState>((set) => ({
  customTemplates: initialCustom,
  templates: allTemplates(initialCustom),

  createTemplate: (data, items) => {
    const template: Template = { id: generateId(), ...data, items, isDefault: false };
    set((state) => persist([template, ...state.customTemplates]));
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
    set((state) => persist([template, ...state.customTemplates]));
    return template;
  },

  updateTemplate: (id, patch) => {
    set((state) =>
      persist(state.customTemplates.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    );
  },

  deleteTemplate: (id) => {
    set((state) => persist(state.customTemplates.filter((t) => t.id !== id)));
  },
}));
