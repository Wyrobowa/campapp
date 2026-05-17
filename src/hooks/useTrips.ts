import { useLocalStorage } from './useLocalStorage';
import { generateId } from '../utils/id';
import type { Trip, GearItem } from '../types';

export function useTrips() {
  const [trips, setTrips] = useLocalStorage<Trip[]>('camp-trips', []);

  function createTrip(
    data: Pick<Trip, 'name' | 'date' | 'notes' | 'templateId'>,
    items: Omit<GearItem, 'packed'>[]
  ): Trip {
    const now = new Date().toISOString();
    const trip: Trip = {
      id: generateId(),
      ...data,
      items: items.map((item) => ({ ...item, packed: false })),
      createdAt: now,
      updatedAt: now,
    };
    setTrips((prev) => [trip, ...prev]);
    return trip;
  }

  function updateTrip(id: string, patch: Partial<Trip>) {
    setTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t))
    );
  }

  function deleteTrip(id: string) {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  }

  function toggleItem(tripId: string, itemId: string) {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              updatedAt: new Date().toISOString(),
              items: t.items.map((item) =>
                item.id === itemId ? { ...item, packed: !item.packed } : item
              ),
            }
          : t
      )
    );
  }

  function addItem(tripId: string, item: Omit<GearItem, 'id'>) {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              updatedAt: new Date().toISOString(),
              items: [...t.items, { ...item, id: generateId() }],
            }
          : t
      )
    );
  }

  function removeItem(tripId: string, itemId: string) {
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              updatedAt: new Date().toISOString(),
              items: t.items.filter((item) => item.id !== itemId),
            }
          : t
      )
    );
  }

  return { trips, createTrip, updateTrip, deleteTrip, toggleItem, addItem, removeItem };
}
