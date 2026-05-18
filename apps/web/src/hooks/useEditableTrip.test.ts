import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useEditableTrip } from './useEditableTrip';
import * as api from '../lib/api';
import type { Trip } from '../types';

vi.mock('../lib/api');

const trip: Trip = {
  id: 'trip-1',
  name: 'Alpine weekend',
  date: '2025-08-01',
  items: [],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const wrapper = () => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  vi.mocked(api.tripsApi.list).mockResolvedValue([trip]);
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useEditableTrip', () => {
  it('starts with editing = false', () => {
    const { result } = renderHook(() => useEditableTrip(trip), { wrapper: wrapper() });
    expect(result.current.editing).toBe(false);
  });

  it('startEdit copies trip name and date into edit fields', () => {
    const { result } = renderHook(() => useEditableTrip(trip), { wrapper: wrapper() });
    act(() => {
      result.current.startEdit();
    });
    expect(result.current.editName).toBe('Alpine weekend');
    expect(result.current.editDate).toBe('2025-08-01');
    expect(result.current.editing).toBe(true);
  });

  it('cancelEdit resets editing state', () => {
    const { result } = renderHook(() => useEditableTrip(trip), { wrapper: wrapper() });
    act(() => {
      result.current.startEdit();
    });
    act(() => {
      result.current.cancelEdit();
    });
    expect(result.current.editing).toBe(false);
    expect(result.current.editError).toBeNull();
  });

  it('saveEdit calls updateTrip and clears editing on success', async () => {
    vi.mocked(api.tripsApi.list).mockResolvedValue([trip]);
    vi.mocked(api.tripsApi.update).mockResolvedValue({ ...trip, name: 'New name' });
    const { result } = renderHook(() => useEditableTrip(trip), { wrapper: wrapper() });

    act(() => {
      result.current.startEdit();
    });
    act(() => {
      result.current.setEditName('New name');
    });
    await act(async () => {
      await result.current.saveEdit();
    });

    expect(api.tripsApi.update).toHaveBeenCalledWith('trip-1', {
      name: 'New name',
      date: '2025-08-01',
    });
    expect(result.current.editing).toBe(false);
    expect(result.current.editError).toBeNull();
  });

  it('saveEdit does nothing when name is blank', async () => {
    const { result } = renderHook(() => useEditableTrip(trip), { wrapper: wrapper() });
    act(() => {
      result.current.startEdit();
    });
    act(() => {
      result.current.setEditName('   ');
    });
    await act(async () => {
      await result.current.saveEdit();
    });
    expect(api.tripsApi.update).not.toHaveBeenCalled();
  });

  it('saveEdit sets editError on API failure', async () => {
    vi.mocked(api.tripsApi.list).mockResolvedValue([trip]);
    vi.mocked(api.tripsApi.update).mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useEditableTrip(trip), { wrapper: wrapper() });

    act(() => {
      result.current.startEdit();
    });
    await act(async () => {
      await result.current.saveEdit();
    });

    expect(result.current.editError).toBe('Failed to save changes.');
    expect(result.current.editing).toBe(true);
  });
});
