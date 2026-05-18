import { create } from 'zustand';
import { db } from '../db';
import { generateId } from '../utils/id';
import type { Trip, GearItem } from '../schemas';

interface TripsState {
  trips: Trip[];
  hydrate: () => Promise<void>;
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

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: [],

  hydrate: async () => {
    const trips = await db.trips.orderBy('createdAt').reverse().toArray();
    set({ trips });
  },

  createTrip: (data, items) => {
    const now = new Date().toISOString();
    const trip: Trip = {
      id: generateId(),
      ...data,
      items: items.map((item) => ({ ...item, packed: false })),
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ trips: [trip, ...state.trips] }));
    void db.trips.put(trip);
    return trip;
  },

  updateTrip: (id, patch) => {
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
      ),
    }));
    const updated = get().trips.find((t) => t.id === id);
    if (updated) void db.trips.put(updated);
  },

  deleteTrip: (id) => {
    set((state) => ({ trips: state.trips.filter((t) => t.id !== id) }));
    void db.trips.delete(id);
  },

  toggleItem: (tripId, itemId) => {
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              updatedAt: new Date().toISOString(),
              items: t.items.map((item) =>
                item.id === itemId ? { ...item, packed: !item.packed } : item
              ),
            }
          : t
      ),
    }));
    const updated = get().trips.find((t) => t.id === tripId);
    if (updated) void db.trips.put(updated);
  },

  addItem: (tripId, item) => {
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              updatedAt: new Date().toISOString(),
              items: [...t.items, { ...item, id: generateId() }],
            }
          : t
      ),
    }));
    const updated = get().trips.find((t) => t.id === tripId);
    if (updated) void db.trips.put(updated);
  },

  removeItem: (tripId, itemId) => {
    set((state) => ({
      trips: state.trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              updatedAt: new Date().toISOString(),
              items: t.items.filter((item) => item.id !== itemId),
            }
          : t
      ),
    }));
    const updated = get().trips.find((t) => t.id === tripId);
    if (updated) void db.trips.put(updated);
  },
}));
