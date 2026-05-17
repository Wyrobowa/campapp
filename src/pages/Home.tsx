import { useState } from 'react';
import type { Trip } from '../types';
import { useTrips } from '../hooks/useTrips';
import { useTemplates } from '../hooks/useTemplates';
import { TripCard } from '../components/trips/TripCard';
import { TripForm } from '../components/trips/TripForm';
import { Button } from '../components/ui/Button';

interface HomeProps {
  onSelectTrip: (trip: Trip) => void;
}

export function Home({ onSelectTrip }: HomeProps) {
  const { trips, createTrip, deleteTrip } = useTrips();
  const { templates } = useTemplates();
  const [showForm, setShowForm] = useState(false);

  function handleCreate(data: Parameters<typeof createTrip>[0]) {
    const template = templates.find((t) => t.id === data.templateId);
    const items = template ? template.items : [];
    const trip = createTrip(data, items);
    setShowForm(false);
    onSelectTrip(trip);
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D5016]">CampApp</h1>
          <p className="text-sm text-gray-500">Your trips</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>+ New trip</Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">New trip</h2>
          <TripForm
            templates={templates}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {trips.length === 0 && !showForm ? (
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
              onClick={() => onSelectTrip(trip)}
              onDelete={() => deleteTrip(trip.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
