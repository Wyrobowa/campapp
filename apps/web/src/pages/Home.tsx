import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useTrips } from '../hooks/useTrips';
import { useTemplates } from '../hooks/useTemplates';
import { TripCard } from '../components/trips/TripCard';
import { TripForm } from '../components/trips/TripForm';
import { Button } from '../components/ui/Button';

export function Home() {
  const navigate = useNavigate();
  const { trips, isLoading, createTrip, deleteTrip } = useTrips();
  const { templates } = useTemplates();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = async (data: Parameters<typeof createTrip>[0]) => {
    const template = templates.find((t) => t.id === data.templateId);
    const trip = await createTrip(data, template ? template.items : []);
    setShowForm(false);
    void navigate({ to: '/trips/$tripId', params: { tripId: trip.id } });
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
          <TripForm
            templates={templates}
            onSubmit={(data) => {
              void handleCreate(data);
            }}
            onCancel={() => {
              setShowForm(false);
            }}
          />
        </div>
      )}

      {isLoading ? (
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
