import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTrips } from '../hooks/useTrips';
import { useTemplates } from '../hooks/useTemplates';
import { TripCard } from '../components/trips/TripCard';
import { TripForm } from '../components/trips/TripForm';
import { Button } from '../components/ui/Button';

export function Home() {
  const navigate = useNavigate();
  const { trips, isLoading, isError, refetch, createTrip, deleteTrip, duplicateTrip } = useTrips();
  const { templates } = useTemplates();
  const [showForm, setShowForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [search, setSearch] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = trips.filter((t) => t.date >= today);
  const past = trips.filter((t) => t.date < today);
  const query = search.trim().toLowerCase();
  const visibleTrips = query
    ? trips.filter((t) => t.name.toLowerCase().includes(query))
    : filter === 'upcoming'
      ? upcoming
      : past;

  const handleCreate = async (data: Parameters<typeof createTrip>[0]) => {
    setCreateError(null);
    try {
      const template = templates.find((t) => t.id === data.templateId);
      const trip = await createTrip(data, template ? template.items : []);
      setShowForm(false);
      void navigate({ to: '/trips/$tripId', params: { tripId: trip.id } });
    } catch {
      setCreateError('Failed to create trip. Please try again.');
    }
  };

  const totalItems = trips.reduce((s, t) => s + t.items.length, 0);
  const packedItems = trips.reduce((s, t) => s + t.items.filter((i) => i.packed).length, 0);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-forest">CampApp</h1>
          {trips.length > 0 ? (
            <p className="text-xs text-gray-400 mt-0.5">
              {trips.length} {trips.length === 1 ? 'trip' : 'trips'} · {totalItems} items
              {packedItems > 0 && ` · ${packedItems} packed`}
            </p>
          ) : (
            <p className="text-sm text-gray-500">Your trips</p>
          )}
        </div>
        {!showForm && (
          <Button
            onClick={() => {
              setShowForm(true);
            }}
          >
            + New trip
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">New trip</h2>
          {createError && <p className="text-sm text-red-600 mb-3">{createError}</p>}
          <TripForm
            templates={templates}
            onSubmit={(data) => {
              void handleCreate(data);
            }}
            onCancel={() => {
              setShowForm(false);
              setCreateError(null);
            }}
          />
        </div>
      )}

      {isError ? (
        <div className="text-center py-12">
          <p className="text-2xl mb-2">⚠️</p>
          <p className="text-sm text-gray-500 mb-3">
            Couldn't load trips. The server may be waking up.
          </p>
          <button
            onClick={() => {
              void refetch();
            }}
            className="text-sm text-forest font-medium hover:underline"
          >
            Try again
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-white rounded-2xl border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : trips.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">⛺</p>
          <p className="text-gray-500 text-sm">No trips yet — create your first one!</p>
        </div>
      ) : (
        <>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-3">
            <button
              onClick={() => {
                setFilter('upcoming');
                setSearch('');
              }}
              className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-colors ${
                filter === 'upcoming' && !query
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upcoming{upcoming.length > 0 ? ` (${upcoming.length})` : ''}
            </button>
            <button
              onClick={() => {
                setFilter('past');
                setSearch('');
              }}
              className={`flex-1 text-sm font-medium py-1.5 rounded-lg transition-colors ${
                filter === 'past' && !query
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Past{past.length > 0 ? ` (${past.length})` : ''}
            </button>
          </div>
          <div className="relative mb-4">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              viewBox="0 0 16 16"
              fill="none"
            >
              <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M11 11l2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              placeholder="Search trips…"
              className="field-base w-full pl-9 text-sm"
            />
          </div>
          {visibleTrips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">
                {query
                  ? 'No trips match your search.'
                  : filter === 'upcoming'
                    ? 'No upcoming trips.'
                    : 'No past trips.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {visibleTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onClick={() => {
                    void navigate({ to: '/trips/$tripId', params: { tripId: trip.id } });
                  }}
                  onDuplicate={() => {
                    void duplicateTrip(trip);
                  }}
                  onDelete={() => {
                    deleteTrip(trip.id);
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
