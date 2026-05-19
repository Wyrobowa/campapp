import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useTrips } from './useTrips';
import * as api from '../lib/api';
import type { Trip } from '../types';

vi.mock('../lib/api');

const makeTrip = (overrides: Partial<Trip> = {}): Trip => ({
  id: 'trip-1',
  userId: 'user-1',
  name: 'Test trip',
  date: '2025-08-01',
  items: [],
  collaborators: [],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

const wrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useTrips', () => {
  it('returns empty trips while loading', () => {
    vi.mocked(api.tripsApi.list).mockReturnValue(new Promise(() => undefined));
    const { result } = renderHook(() => useTrips(), { wrapper: wrapper() });
    expect(result.current.trips).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('returns trips after fetch', async () => {
    const trips = [makeTrip()];
    vi.mocked(api.tripsApi.list).mockResolvedValue(trips);
    const { result } = renderHook(() => useTrips(), { wrapper: wrapper() });
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.trips).toEqual(trips);
  });

  describe('optimistic toggleItem', () => {
    it('flips packed immediately in the cache', async () => {
      const item = {
        id: 'i-1',
        name: 'Tent',
        category: 'shelter' as const,
        quantity: 1,
        packed: false,
      };
      const trip = makeTrip({ items: [item] });
      vi.mocked(api.tripsApi.list).mockResolvedValue([trip]);
      vi.mocked(api.tripsApi.update).mockReturnValue(new Promise(() => undefined));

      const { result } = renderHook(() => useTrips(), { wrapper: wrapper() });
      await waitFor(() => {
        expect(result.current.trips).toHaveLength(1);
      });

      act(() => {
        result.current.toggleItem(trip, 'i-1');
      });

      await waitFor(() => {
        expect(result.current.trips[0]?.items[0]?.packed).toBe(true);
      });
    });

    it('rolls back on API error', async () => {
      const item = {
        id: 'i-1',
        name: 'Tent',
        category: 'shelter' as const,
        quantity: 1,
        packed: false,
      };
      const trip = makeTrip({ items: [item] });
      vi.mocked(api.tripsApi.list).mockResolvedValue([trip]);
      vi.mocked(api.tripsApi.update).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTrips(), { wrapper: wrapper() });
      await waitFor(() => {
        expect(result.current.trips).toHaveLength(1);
      });

      act(() => {
        result.current.toggleItem(trip, 'i-1');
      });
      await waitFor(() => {
        expect(result.current.trips[0]?.items[0]?.packed).toBe(false);
      });
    });
  });

  describe('optimistic addItem', () => {
    it('appends the new item immediately', async () => {
      const trip = makeTrip();
      vi.mocked(api.tripsApi.list).mockResolvedValue([trip]);
      vi.mocked(api.tripsApi.update).mockReturnValue(new Promise(() => undefined));

      const { result } = renderHook(() => useTrips(), { wrapper: wrapper() });
      await waitFor(() => {
        expect(result.current.trips).toHaveLength(1);
      });

      act(() => {
        result.current.addItem(trip, {
          name: 'Tent',
          category: 'shelter',
          quantity: 1,
          packed: false,
        });
      });

      await waitFor(() => {
        expect(result.current.trips[0]?.items).toHaveLength(1);
      });
      expect(result.current.trips[0]?.items[0]?.name).toBe('Tent');
    });
  });

  describe('optimistic removeItem', () => {
    it('removes the item immediately', async () => {
      const item = {
        id: 'i-1',
        name: 'Tent',
        category: 'shelter' as const,
        quantity: 1,
        packed: false,
      };
      const trip = makeTrip({ items: [item] });
      vi.mocked(api.tripsApi.list).mockResolvedValue([trip]);
      vi.mocked(api.tripsApi.update).mockReturnValue(new Promise(() => undefined));

      const { result } = renderHook(() => useTrips(), { wrapper: wrapper() });
      await waitFor(() => {
        expect(result.current.trips).toHaveLength(1);
      });

      act(() => {
        result.current.removeItem(trip, 'i-1');
      });

      await waitFor(() => {
        expect(result.current.trips[0]?.items).toHaveLength(0);
      });
    });
  });
});
