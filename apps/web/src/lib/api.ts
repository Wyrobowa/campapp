import type { Trip, Template, GearItem } from '../types';

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || res.statusText);
  }
  return res.json() as Promise<T>;
}

// ── TRIPS ─────────────────────────────────────────────────────────

export type CreateTripInput = Pick<Trip, 'name' | 'date' | 'notes' | 'templateId'> & {
  items: GearItem[];
};
export type UpdateTripInput = Partial<
  Pick<Trip, 'name' | 'date' | 'notes' | 'templateId' | 'items'>
>;

export const tripsApi = {
  list: () => request<Trip[]>('/api/trips'),
  get: (id: string) => request<Trip>(`/api/trips/${id}`),
  create: (body: CreateTripInput) =>
    request<Trip>('/api/trips', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateTripInput) =>
    request<Trip>(`/api/trips/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request<{ ok: boolean }>(`/api/trips/${id}`, { method: 'DELETE' }),
};

// ── TEMPLATES ─────────────────────────────────────────────────────

export type CreateTemplateInput = Pick<Template, 'name' | 'description'> & {
  items: Template['items'];
};
export type UpdateTemplateInput = Partial<Pick<Template, 'name' | 'description' | 'items'>>;

export const templatesApi = {
  list: () => request<Template[]>('/api/templates'),
  create: (body: CreateTemplateInput) =>
    request<Template>('/api/templates', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateTemplateInput) =>
    request<Template>(`/api/templates/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: string) => request<{ ok: boolean }>(`/api/templates/${id}`, { method: 'DELETE' }),
};
