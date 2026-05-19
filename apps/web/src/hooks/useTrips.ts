import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi, shareApi, collaboratorsApi } from '../lib/api';
import type { Trip, GearItem } from '../types';
import { generateId } from '../utils/id';

export function useTrips() {
  const qc = useQueryClient();

  const {
    data: trips = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const data = await tripsApi.list();
      return [...data].sort((a, b) => a.date.localeCompare(b.date));
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['trips'] });

  const applyOptimistic = async (updater: (old: Trip[]) => Trip[]) => {
    await qc.cancelQueries({ queryKey: ['trips'] });
    const prev = qc.getQueryData<Trip[]>(['trips']);
    qc.setQueryData<Trip[]>(['trips'], (old = []) => updater(old));
    return { prev };
  };

  const rollback = (_err: unknown, _vars: unknown, ctx: { prev?: Trip[] } | undefined) => {
    if (ctx?.prev) qc.setQueryData(['trips'], ctx.prev);
  };

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
    onMutate: (vars) =>
      applyOptimistic((old) =>
        old.map((t) =>
          t.id !== vars.trip.id
            ? t
            : {
                ...t,
                items: t.items.map((item) =>
                  item.id === vars.itemId ? { ...item, packed: !item.packed } : item
                ),
              }
        )
      ),
    onError: rollback,
    onSettled: invalidate,
  });

  const addItem = useMutation({
    mutationFn: (vars: { trip: Trip; item: Omit<GearItem, 'id'>; newId: string }) => {
      const items = [...vars.trip.items, { ...vars.item, id: vars.newId }];
      return tripsApi.update(vars.trip.id, { items });
    },
    onMutate: (vars) =>
      applyOptimistic((old) =>
        old.map((t) =>
          t.id !== vars.trip.id
            ? t
            : { ...t, items: [...t.items, { ...vars.item, id: vars.newId }] }
        )
      ),
    onError: rollback,
    onSettled: invalidate,
  });

  const removeItem = useMutation({
    mutationFn: (vars: { trip: Trip; itemId: string }) => {
      const items = vars.trip.items.filter((i) => i.id !== vars.itemId);
      return tripsApi.update(vars.trip.id, { items });
    },
    onMutate: (vars) =>
      applyOptimistic((old) =>
        old.map((t) =>
          t.id !== vars.trip.id ? t : { ...t, items: t.items.filter((i) => i.id !== vars.itemId) }
        )
      ),
    onError: rollback,
    onSettled: invalidate,
  });

  const duplicateTrip = useMutation({
    mutationFn: (trip: Trip) =>
      tripsApi.create({
        name: `${trip.name} (copy)`,
        date: new Date().toISOString().slice(0, 10),
        templateId: trip.templateId,
        notes: trip.notes,
        items: trip.items.map((item) => ({ ...item, packed: false })),
      }),
    onSuccess: invalidate,
  });

  const reorderItems = useMutation({
    mutationFn: (vars: { trip: Trip; items: GearItem[] }) =>
      tripsApi.update(vars.trip.id, { items: vars.items }),
    onMutate: (vars) =>
      applyOptimistic((old) =>
        old.map((t) => (t.id !== vars.trip.id ? t : { ...t, items: vars.items }))
      ),
    onError: rollback,
    onSettled: invalidate,
  });

  const shareTrip = useMutation({
    mutationFn: (tripId: string) => shareApi.create(tripId),
    onSuccess: invalidate,
  });

  const unshareTrip = useMutation({
    mutationFn: (tripId: string) => shareApi.remove(tripId),
    onSuccess: invalidate,
  });

  const inviteCollaborator = useMutation({
    mutationFn: (vars: { tripId: string; email: string }) =>
      collaboratorsApi.invite(vars.tripId, vars.email),
    onSuccess: invalidate,
  });

  const removeCollaborator = useMutation({
    mutationFn: (vars: { tripId: string; collaboratorId: string }) =>
      collaboratorsApi.remove(vars.tripId, vars.collaboratorId),
    onSuccess: invalidate,
  });

  const setAllPacked = useMutation({
    mutationFn: (vars: { trip: Trip; packed: boolean }) => {
      const items = vars.trip.items.map((item) => ({ ...item, packed: vars.packed }));
      return tripsApi.update(vars.trip.id, { items });
    },
    onMutate: (vars) =>
      applyOptimistic((old) =>
        old.map((t) =>
          t.id !== vars.trip.id
            ? t
            : { ...t, items: t.items.map((item) => ({ ...item, packed: vars.packed })) }
        )
      ),
    onError: rollback,
    onSettled: invalidate,
  });

  return {
    trips,
    isLoading,
    isError,
    refetch,
    createTrip: (
      data: Pick<Trip, 'name' | 'date' | 'notes' | 'templateId'>,
      items: Omit<GearItem, 'packed'>[]
    ) => createTrip.mutateAsync({ data, items }),
    updateTrip: (id: string, patch: Partial<Trip>) => updateTrip.mutateAsync({ id, patch }),
    deleteTrip: (id: string) => {
      deleteTrip.mutate(id);
    },
    toggleItem: (trip: Trip, itemId: string) => {
      toggleItem.mutate({ trip, itemId });
    },
    addItem: (trip: Trip, item: Omit<GearItem, 'id'>) => {
      addItem.mutate({ trip, item, newId: generateId() });
    },
    removeItem: (trip: Trip, itemId: string) => {
      removeItem.mutate({ trip, itemId });
    },
    setAllPacked: (trip: Trip, packed: boolean) => {
      setAllPacked.mutate({ trip, packed });
    },
    duplicateTrip: (trip: Trip) => duplicateTrip.mutateAsync(trip),
    reorderItems: (trip: Trip, items: GearItem[]) => {
      reorderItems.mutate({ trip, items });
    },
    shareTrip: (tripId: string) => shareTrip.mutateAsync(tripId),
    unshareTrip: (tripId: string) => unshareTrip.mutateAsync(tripId),
    inviteCollaborator: (tripId: string, email: string) =>
      inviteCollaborator.mutateAsync({ tripId, email }),
    removeCollaborator: (tripId: string, collaboratorId: string) =>
      removeCollaborator.mutateAsync({ tripId, collaboratorId }),
  };
}
