import { useState } from 'react';
import type { Trip } from '../types';
import type { GearCategory } from '../types';
import { useTrips } from '../hooks/useTrips';
import { useTemplates } from '../hooks/useTemplates';
import { CATEGORIES } from '../data/categories';
import { CategoryGroup } from '../components/checklist/CategoryGroup';
import { AddItemForm } from '../components/checklist/AddItemForm';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { formatDate } from '../utils/date';

interface TripDetailProps {
  trip: Trip;
  onBack: () => void;
}

export function TripDetail({ trip: initialTrip, onBack }: TripDetailProps) {
  const { trips, toggleItem, addItem, removeItem } = useTrips();
  const { createTemplateFromTrip } = useTemplates();
  const [showAddForm, setShowAddForm] = useState(false);

  const trip = trips.find((t) => t.id === initialTrip.id) ?? initialTrip;
  const packed = trip.items.filter((i) => i.packed).length;

  const itemsByCategory = CATEGORIES.reduce<Record<GearCategory, typeof trip.items>>(
    (acc, cat) => {
      acc[cat.id] = trip.items.filter((i) => i.category === cat.id);
      return acc;
    },
    {} as Record<GearCategory, typeof trip.items>
  );

  const categoriesWithItems = CATEGORIES.filter((c) => itemsByCategory[c.id].length > 0);

  function handleSaveAsTemplate() {
    createTemplateFromTrip(trip);
    alert('Template saved!');
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 -ml-1 p-1 rounded">
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Trips
      </button>

      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">{trip.name}</h1>
        <p className="text-sm text-gray-400">{formatDate(trip.date)}</p>
      </div>

      {trip.items.length > 0 && (
        <div className="mb-6">
          <ProgressBar packed={packed} total={trip.items.length} />
        </div>
      )}

      {categoriesWithItems.length === 0 && !showAddForm && (
        <div className="text-center py-10">
          <p className="text-3xl mb-2">🎒</p>
          <p className="text-gray-500 text-sm">List is empty — add some items!</p>
        </div>
      )}

      {categoriesWithItems.map((cat) => (
        <CategoryGroup
          key={cat.id}
          category={cat.id}
          items={itemsByCategory[cat.id]}
          onToggle={(itemId) => toggleItem(trip.id, itemId)}
          onRemove={(itemId) => removeItem(trip.id, itemId)}
        />
      ))}

      <div className="mt-4">
        {showAddForm ? (
          <div className="mb-4">
            <AddItemForm onAdd={(item) => { addItem(trip.id, item); setShowAddForm(false); }} />
            <button onClick={() => setShowAddForm(false)} className="mt-2 text-sm text-gray-400 hover:text-gray-600 w-full text-center py-1">
              Cancel
            </button>
          </div>
        ) : (
          <Button variant="secondary" className="w-full justify-center" onClick={() => setShowAddForm(true)}>
            + Add item
          </Button>
        )}
      </div>

      {trip.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button variant="ghost" size="sm" onClick={handleSaveAsTemplate} className="text-gray-500">
            Save as template
          </Button>
        </div>
      )}
    </div>
  );
}
