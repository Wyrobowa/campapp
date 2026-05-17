import { useLocalStorage } from './useLocalStorage';
import { generateId } from '../utils/id';
import { DEFAULT_TEMPLATES } from '../data/defaultTemplates';
import type { Template, GearItem, Trip } from '../types';

export function useTemplates() {
  const [customTemplates, setCustomTemplates] = useLocalStorage<Template[]>('camp-templates', []);
  const templates = [...DEFAULT_TEMPLATES, ...customTemplates];

  function createTemplate(data: Pick<Template, 'name' | 'description'>, items: Omit<GearItem, 'packed'>[]): Template {
    const template: Template = {
      id: generateId(),
      ...data,
      items,
      isDefault: false,
    };
    setCustomTemplates((prev) => [template, ...prev]);
    return template;
  }

  function createTemplateFromTrip(trip: Trip): Template {
    return createTemplate(
      { name: `${trip.name} (template)`, description: `Template from trip: ${trip.name}` },
      trip.items.map(({ packed: _packed, ...item }) => item)
    );
  }

  function updateTemplate(id: string, patch: Partial<Template>) {
    setCustomTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  }

  function deleteTemplate(id: string) {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
  }

  return { templates, customTemplates, createTemplate, createTemplateFromTrip, updateTemplate, deleteTemplate };
}
