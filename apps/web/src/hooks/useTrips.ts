import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../lib/api';
import type { Trip, GearItem } from '../types';
import { generateId } from '../utils/id';

export function useTrips() {
  const qc = useQueryClient();

  const { data: trips = [], isLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: tripsApi.list,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['trips'] });

  const createTrip = useMutation({
    mutationFn: (vars: {
      data: Pick<Trip, 'name' | 'date' | 'notes' | 'templateId'>;
      items: Omit<GearItem, 'packed'>[];
    }) =>
      tripsApi.create({
        ...vars.data,
        items: vars.items.map((item) => ({ ...item, packed: false })),
      }),
    onSuccess: invalidate,
  });

  const updateTrip = useMutation({
    mutationFn: (vars: { id: string; patch: Partial<Trip> }) =>
      tripsApi.update(vars.id, vars.patch),
    onSuccess: invalidate,
  });

  const deleteTrip = useMutation({
    mutationFn: (id: string) => tripsApi.delete(id),
    onSuccess: invalidate,
  });

  const toggleItem = useMutation({
    mutationFn: (vars: { trip: Trip; itemId: string }) => {
      const items = vars.trip.items.map((item) =>
        item.id === vars.itemId ? { ...item, packed: !item.packed } : item
      );
      return tripsApi.update(vars.trip.id, { items });
    },
    onSuccess: invalidate,
  });

  const addItem = useMutation({
    mutationFn: (vars: { trip: Trip; item: Omit<GearItem, 'id'> }) => {
      const items = [...vars.trip.items, { ...vars.item, id: generateId() }];
      return tripsApi.update(vars.trip.id, { items });
    },
    onSuccess: invalidate,
  });

  const removeItem = useMutation({
    mutationFn: (vars: { trip: Trip; itemId: string }) => {
      const items = vars.trip.items.filter((i) => i.id !== vars.itemId);
      return tripsApi.update(vars.trip.id, { items });
    },
    onSuccess: invalidate,
  });

  return {
    trips,
    isLoading,
    createTrip: (
      data: Pick<Trip, 'name' | 'date' | 'notes' | 'templateId'>,
      items: Omit<GearItem, 'packed'>[]
    ) => createTrip.mutateAsync({ data, items }),
    updateTrip: (id: string, patch: Partial<Trip>) => updateTrip.mutateAsync({ id, patch }),
    deleteTrip: (id: string) => { deleteTrip.mutate(id); },
    toggleItem: (trip: Trip, itemId: string) => { toggleItem.mutate({ trip, itemId }); },
    addItem: (trip: Trip, item: Omit<GearItem, 'id'>) => { addItem.mutate({ trip, item }); },
    removeItem: (trip: Trip, itemId: string) => { removeItem.mutate({ trip, itemId }); },
  };
}
