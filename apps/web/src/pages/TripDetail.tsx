import { useEffect, useState } from 'react';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import type { GearCategory, Trip } from '../types';
import { useTrips } from '../hooks/useTrips';
import { useTemplates } from '../hooks/useTemplates';
import { useEditableTrip } from '../hooks/useEditableTrip';
import { CATEGORIES } from '../data/categories';
import { CategoryGroup } from '../components/checklist/CategoryGroup';
import { AddItemForm } from '../components/checklist/AddItemForm';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { formatDate } from '../utils/date';

const Route = getRouteApi('/trips/$tripId');

function TripDetailView({ trip }: { trip: Trip }) {
  const navigate = useNavigate();
  const { toggleItem, addItem, removeItem } = useTrips();
  const { createTemplateFromTrip } = useTemplates();
  const {
    editing,
    editName,
    editDate,
    editError,
    setEditName,
    setEditDate,
    startEdit,
    cancelEdit,
    saveEdit,
  } = useEditableTrip(trip);

  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const packed = trip.items.filter((i) => i.packed).length;

  const itemsByCategory = CATEGORIES.reduce<Record<GearCategory, typeof trip.items>>(
    (acc, cat) => {
      acc[cat.id] = trip.items.filter((i) => i.category === cat.id);
      return acc;
    },
    {} as Record<GearCategory, typeof trip.items>
  );

  const categoriesWithItems = CATEGORIES.filter((c) => itemsByCategory[c.id].length > 0);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const handleSaveAsTemplate = async () => {
    try {
      await createTemplateFromTrip(trip);
      showToast('Template saved!');
    } catch {
      showToast('Failed to save template.');
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-24">
      <button
        onClick={() => {
          void navigate({ to: '/' });
        }}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-4 -ml-1 p-1 rounded"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 4L6 8l4 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Trips
      </button>

      {editing ? (
        <div className="mb-4 flex flex-col gap-3">
          <Input
            label="Trip name"
            value={editName}
            onChange={(e) => {
              setEditName(e.target.value);
            }}
            autoFocus
          />
          <Input
            label="Date"
            type="date"
            value={editDate}
            onChange={(e) => {
              setEditDate(e.target.value);
            }}
          />
          {editError && <p className="text-sm text-red-600">{editError}</p>}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                void saveEdit();
              }}
              disabled={!editName.trim()}
            >
              Save
            </Button>
            <Button variant="ghost" onClick={cancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{trip.name}</h1>
            <p className="text-sm text-gray-400">{formatDate(trip.date)}</p>
            {trip.notes && (
              <p className="text-sm text-gray-500 mt-2 whitespace-pre-wrap">{trip.notes}</p>
            )}
          </div>
          <button
            onClick={startEdit}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded flex-shrink-0 mt-0.5"
            aria-label="Edit trip"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path
                d="M11 2l3 3-8 8H3v-3l8-8z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}

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
          onToggle={(itemId) => {
            toggleItem(trip, itemId);
          }}
          onRemove={(itemId) => {
            removeItem(trip, itemId);
          }}
        />
      ))}

      <div className="mt-4">
        {showAddForm ? (
          <div className="mb-4">
            <AddItemForm
              onAdd={(item) => {
                addItem(trip, item);
                setShowAddForm(false);
              }}
            />
            <button
              onClick={() => {
                setShowAddForm(false);
              }}
              className="mt-2 text-sm text-gray-400 hover:text-gray-600 w-full text-center py-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <Button
            variant="secondary"
            className="w-full justify-center"
            onClick={() => {
              setShowAddForm(true);
            }}
          >
            + Add item
          </Button>
        )}
      </div>

      {trip.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void handleSaveAsTemplate();
            }}
            className="text-gray-500"
          >
            Save as template
          </Button>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-full shadow-lg pointer-events-none z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}

export function TripDetail() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const { trips, isLoading } = useTrips();

  const trip = trips.find((t) => t.id === tripId);

  useEffect(() => {
    if (!isLoading && !trip) {
      const timer = setTimeout(() => {
        void navigate({ to: '/' });
      }, 1500);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [trip, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-2 text-center p-6">
        <p className="text-3xl">🔍</p>
        <p className="text-sm text-gray-500">Trip not found — taking you home…</p>
      </div>
    );
  }

  return <TripDetailView trip={trip} />;
}
