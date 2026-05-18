import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTrips } from '../hooks/useTrips';
import { useTemplates } from '../hooks/useTemplates';
import { TripCard } from '../components/trips/TripCard';
import { TripForm } from '../components/trips/TripForm';
import { Button } from '../components/ui/Button';

export function Home() {
  const navigate = useNavigate();
  const { trips, isLoading, isError, createTrip, deleteTrip } = useTrips();
  const { templates } = useTemplates();
  const [showForm, setShowForm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-forest">CampApp</h1>
          <p className="text-sm text-gray-500">Your trips</p>
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
          <p className="text-sm text-gray-500">
            Couldn't load trips. Check your connection and try refreshing.
          </p>
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
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onClick={() => {
                void navigate({ to: '/trips/$tripId', params: { tripId: trip.id } });
              }}
              onDelete={() => {
                deleteTrip(trip.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
