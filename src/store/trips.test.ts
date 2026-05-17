import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db', () => ({
  db: {
    trips: {
      orderBy: vi.fn().mockReturnValue({
        reverse: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([]),
        }),
      }),
      put: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    },
  },
}));

import { useTripsStore } from './trips';

const baseItems = [{ id: 'item-1', name: 'Tent', category: 'shelter' as const, quantity: 1 }];

beforeEach(() => {
  useTripsStore.setState({ trips: [] });
});

describe('useTripsStore – createTrip', () => {
  it('adds trip to state', () => {
    const trip = useTripsStore
      .getState()
      .createTrip(
        { name: 'Lake trip', date: '2025-08-01', notes: undefined, templateId: undefined },
        baseItems
      );
    const { trips } = useTripsStore.getState();
    expect(trips).toHaveLength(1);
    expect(trips[0]?.id).toBe(trip.id);
  });

  it('sets packed=false on all items', () => {
    const trip = useTripsStore
      .getState()
      .createTrip(
        { name: 'Test', date: '2025-08-01', notes: undefined, templateId: undefined },
        baseItems
      );
    expect(trip.items.every((i) => !i.packed)).toBe(true);
  });

  it('prepends to existing trips', () => {
    const first = useTripsStore
      .getState()
      .createTrip(
        { name: 'First', date: '2025-08-01', notes: undefined, templateId: undefined },
        []
      );
    const second = useTripsStore
      .getState()
      .createTrip(
        { name: 'Second', date: '2025-08-02', notes: undefined, templateId: undefined },
        []
      );
    const { trips } = useTripsStore.getState();
    expect(trips[0]?.id).toBe(second.id);
    expect(trips[1]?.id).toBe(first.id);
  });
});

describe('useTripsStore – deleteTrip', () => {
  it('removes trip from state', () => {
    const trip = useTripsStore
      .getState()
      .createTrip(
        { name: 'Delete me', date: '2025-08-01', notes: undefined, templateId: undefined },
        []
      );
    useTripsStore.getState().deleteTrip(trip.id);
    expect(useTripsStore.getState().trips).toHaveLength(0);
  });

  it('only removes the specified trip', () => {
    const a = useTripsStore
      .getState()
      .createTrip({ name: 'A', date: '2025-08-01', notes: undefined, templateId: undefined }, []);
    const b = useTripsStore
      .getState()
      .createTrip({ name: 'B', date: '2025-08-02', notes: undefined, templateId: undefined }, []);
    useTripsStore.getState().deleteTrip(a.id);
    const { trips } = useTripsStore.getState();
    expect(trips).toHaveLength(1);
    expect(trips[0]?.id).toBe(b.id);
  });
});

describe('useTripsStore – toggleItem', () => {
  it('flips packed from false to true', () => {
    const trip = useTripsStore
      .getState()
      .createTrip(
        { name: 'Toggle test', date: '2025-08-01', notes: undefined, templateId: undefined },
        baseItems
      );
    useTripsStore.getState().toggleItem(trip.id, 'item-1');
    const updated = useTripsStore.getState().trips.find((t) => t.id === trip.id);
    expect(updated?.items.find((i) => i.id === 'item-1')?.packed).toBe(true);
  });

  it('flips packed from true to false', () => {
    const trip = useTripsStore
      .getState()
      .createTrip(
        { name: 'Toggle test 2', date: '2025-08-01', notes: undefined, templateId: undefined },
        baseItems
      );
    useTripsStore.getState().toggleItem(trip.id, 'item-1');
    useTripsStore.getState().toggleItem(trip.id, 'item-1');
    const updated = useTripsStore.getState().trips.find((t) => t.id === trip.id);
    expect(updated?.items.find((i) => i.id === 'item-1')?.packed).toBe(false);
  });
});

describe('useTripsStore – updateTrip', () => {
  it('updates trip name', () => {
    const trip = useTripsStore
      .getState()
      .createTrip(
        { name: 'Old name', date: '2025-08-01', notes: undefined, templateId: undefined },
        []
      );
    useTripsStore.getState().updateTrip(trip.id, { name: 'New name' });
    const updated = useTripsStore.getState().trips.find((t) => t.id === trip.id);
    expect(updated?.name).toBe('New name');
  });

  it('bumps updatedAt', () => {
    vi.useFakeTimers();
    const trip = useTripsStore
      .getState()
      .createTrip(
        { name: 'Timestamp test', date: '2025-08-01', notes: undefined, templateId: undefined },
        []
      );
    const before = trip.updatedAt;
    vi.advanceTimersByTime(1000);
    useTripsStore.getState().updateTrip(trip.id, { name: 'Changed' });
    const updated = useTripsStore.getState().trips.find((t) => t.id === trip.id);
    expect(updated?.updatedAt).not.toBe(before);
    vi.useRealTimers();
  });
});

describe('useTripsStore – addItem / removeItem', () => {
  it('addItem appends to items', () => {
    const trip = useTripsStore
      .getState()
      .createTrip(
        { name: 'Items test', date: '2025-08-01', notes: undefined, templateId: undefined },
        []
      );
    useTripsStore.getState().addItem(trip.id, { name: 'Lantern', category: 'tools', quantity: 1 });
    const updated = useTripsStore.getState().trips.find((t) => t.id === trip.id);
    expect(updated?.items).toHaveLength(1);
    expect(updated?.items[0]?.name).toBe('Lantern');
  });

  it('removeItem removes the item', () => {
    const trip = useTripsStore
      .getState()
      .createTrip(
        { name: 'Remove test', date: '2025-08-01', notes: undefined, templateId: undefined },
        baseItems
      );
    useTripsStore.getState().removeItem(trip.id, 'item-1');
    const updated = useTripsStore.getState().trips.find((t) => t.id === trip.id);
    expect(updated?.items).toHaveLength(0);
  });
});
