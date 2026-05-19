import { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { shareApi } from '../lib/api';
import type { SharedTrip } from '../lib/api';
import { CATEGORIES } from '../data/categories';
import type { GearCategory } from '../types';
import { formatDate } from '../utils/date';
import { ProgressBar } from '../components/ui/ProgressBar';

export function ShareTrip() {
  const { token } = useParams({ from: '/share/$token' });
  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    shareApi
      .get(token)
      .then(setTrip)
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (notFound || !trip) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="text-3xl">🔍</p>
        <p className="text-sm text-gray-500">This shared trip doesn't exist or has been removed.</p>
      </div>
    );
  }

  const packed = trip.items.filter((i) => i.packed).length;
  const itemsByCategory = CATEGORIES.reduce<Record<GearCategory, typeof trip.items>>(
    (acc, cat) => {
      acc[cat.id] = trip.items.filter((i) => i.category === cat.id);
      return acc;
    },
    {}
  );
  const categoriesWithItems = CATEGORIES.filter((c) => (itemsByCategory[c.id]?.length ?? 0) > 0);

  return (
    <div className="min-h-screen bg-bg">
      <div className="p-4 max-w-lg mx-auto pb-12">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-lg font-bold text-forest">CampApp</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            shared trip
          </span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 mb-1">{trip.name}</h1>
        <p className="text-sm text-gray-400 mb-4">{formatDate(trip.date)}</p>
        {trip.notes && (
          <p className="text-sm text-gray-500 mb-4 whitespace-pre-wrap">{trip.notes}</p>
        )}

        {trip.items.length > 0 && (
          <div className="mb-6">
            <ProgressBar packed={packed} total={trip.items.length} />
          </div>
        )}

        {categoriesWithItems.map((cat) => (
          <div key={cat.id} className="mb-4">
            <p className="font-medium text-sm text-gray-700 py-2 flex items-center gap-2">
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </p>
            <ul className="divide-y divide-gray-100 pl-1">
              {(itemsByCategory[cat.id] ?? []).map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-2.5 px-1">
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center ${
                      item.packed ? 'bg-forest border-forest' : 'border-gray-300'
                    }`}
                  >
                    {item.packed && (
                      <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6l3 3 5-5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`flex-1 text-sm ${item.packed ? 'line-through text-gray-400' : 'text-gray-800'}`}
                  >
                    {item.name}
                    {item.quantity > 1 && (
                      <span className="ml-1.5 text-xs text-gray-400">×{item.quantity}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {trip.items.length === 0 && (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">🎒</p>
            <p className="text-gray-500 text-sm">No items in this trip.</p>
          </div>
        )}
      </div>
    </div>
  );
}
