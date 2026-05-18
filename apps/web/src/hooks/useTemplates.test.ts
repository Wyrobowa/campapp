import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { useTemplates } from './useTemplates';
import * as api from '../lib/api';
import type { Template } from '../types';

vi.mock('../lib/api');

const makeTemplate = (overrides: Partial<Template> = {}): Template => ({
  id: 'tmpl-1',
  name: 'Weekend camping',
  isDefault: false,
  items: [],
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

describe('useTemplates', () => {
  it('returns empty templates while loading', () => {
    vi.mocked(api.templatesApi.list).mockReturnValue(new Promise(() => undefined));
    const { result } = renderHook(() => useTemplates(), { wrapper: wrapper() });
    expect(result.current.templates).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it('returns templates after fetch', async () => {
    const templates = [makeTemplate()];
    vi.mocked(api.templatesApi.list).mockResolvedValue(templates);
    const { result } = renderHook(() => useTemplates(), { wrapper: wrapper() });
    await waitFor(() => { expect(result.current.isLoading).toBe(false); });
    expect(result.current.templates).toEqual(templates);
  });

  it('invalidates cache after createTemplate', async () => {
    const initial = [makeTemplate()];
    const updated = [makeTemplate(), makeTemplate({ id: 'tmpl-2', name: 'Light hiking' })];
    vi.mocked(api.templatesApi.list).mockResolvedValueOnce(initial).mockResolvedValueOnce(updated);
    vi.mocked(api.templatesApi.create).mockResolvedValue(makeTemplate({ id: 'tmpl-2' }));

    const { result } = renderHook(() => useTemplates(), { wrapper: wrapper() });
    await waitFor(() => { expect(result.current.templates).toHaveLength(1); });

    await act(async () => {
      await result.current.createTemplate({ name: 'Light hiking' }, []);
    });

    await waitFor(() => { expect(result.current.templates).toHaveLength(2); });
  });

  it('invalidates cache after deleteTemplate', async () => {
    const template = makeTemplate();
    vi.mocked(api.templatesApi.list).mockResolvedValueOnce([template]).mockResolvedValueOnce([]);
    vi.mocked(api.templatesApi.delete).mockResolvedValue({ ok: true });

    const { result } = renderHook(() => useTemplates(), { wrapper: wrapper() });
    await waitFor(() => { expect(result.current.templates).toHaveLength(1); });

    act(() => {
      result.current.deleteTemplate('tmpl-1');
    });

    await waitFor(() => { expect(result.current.templates).toHaveLength(0); });
  });
});
