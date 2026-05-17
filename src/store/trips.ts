import { create } from 'zustand';
import { storageParse, storageSet } from '../utils/storage';
import { TripArraySchema } from '../schemas';
import { generateId } from '../utils/id';
import type { Trip, GearItem } from '../schemas';

const KEY = 'camp-trips';

interface TripsState {
  trips: Trip[];
  createTrip: (
    data: Pick<Trip, 'name' | 'date' | 'notes' | 'templateId'>,
    items: Omit<GearItem, 'packed'>[]
  ) => Trip;
  updateTrip: (id: string, patch: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  toggleItem: (tripId: string, itemId: string) => void;
  addItem: (tripId: string, item: Omit<GearItem, 'id'>) => void;
  removeItem: (tripId: string, itemId: string) => void;
}

function persist(trips: Trip[]) {
  storageSet(KEY, trips);
  return { trips };
}

const initialTrips = storageParse(KEY, TripArraySchema, []);

export const useTripsStore = create<TripsState>((set) => ({
  trips: initialTrips,

  createTrip: (data, items) => {
    const now = new Date().toISOString();
    const trip: Trip = {
      id: generateId(),
      ...data,
      items: items.map((item) => ({ ...item, packed: false })),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => persist([trip, ...state.trips]));
    return trip;
  },

  updateTrip: (id, patch) => {
    set((state) =>
      persist(
        state.trips.map((t) =>
          t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
        )
      )
    );
  },

  deleteTrip: (id) => {
    set((state) => persist(state.trips.filter((t) => t.id !== id)));
  },

  toggleItem: (tripId, itemId) => {
    set((state) =>
      persist(
        state.trips.map((t) =>
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
      )
    );
  },

  addItem: (tripId, item) => {
    set((state) =>
      persist(
        state.trips.map((t) =>
          t.id === tripId
            ? {
                ...t,
                updatedAt: new Date().toISOString(),
                items: [...t.items, { ...item, id: generateId() }],
              }
            : t
        )
      )
    );
  },

  removeItem: (tripId, itemId) => {
    set((state) =>
      persist(
        state.trips.map((t) =>
          t.id === tripId
            ? {
                ...t,
                updatedAt: new Date().toISOString(),
                items: t.items.filter((item) => item.id !== itemId),
              }
            : t
        )
      )
    );
  },
}));
