import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../lib/api';
import type { Template, GearItem, Trip } from '../types';

export function useTemplates() {
  const qc = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: templatesApi.list,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['templates'] });

  const createTemplate = useMutation({
    mutationFn: (vars: {
      data: Pick<Template, 'name' | 'description'>;
      items: Omit<GearItem, 'packed'>[];
    }) => templatesApi.create({ ...vars.data, items: vars.items }),
    onSuccess: invalidate,
  });

  const createTemplateFromTrip = useMutation({
    mutationFn: (trip: Trip) =>
      templatesApi.create({
        name: `${trip.name} (template)`,
        description: `Template from trip: ${trip.name}`,
        items: trip.items.map(({ packed: _packed, ...item }) => item),
      }),
    onSuccess: invalidate,
  });

  const updateTemplate = useMutation({
    mutationFn: (vars: { id: string; patch: Partial<Template> }) =>
      templatesApi.update(vars.id, vars.patch),
    onSuccess: invalidate,
  });

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess: invalidate,
  });

  return {
    templates,
    isLoading,
    createTemplate: (
      data: Pick<Template, 'name' | 'description'>,
      items: Omit<GearItem, 'packed'>[]
    ) => createTemplate.mutateAsync({ data, items }),
    createTemplateFromTrip: (trip: Trip) => createTemplateFromTrip.mutateAsync(trip),
    updateTemplate: (id: string, patch: Partial<Template>) =>
      updateTemplate.mutateAsync({ id, patch }),
    deleteTemplate: (id: string) => { deleteTemplate.mutate(id); },
  };
}
