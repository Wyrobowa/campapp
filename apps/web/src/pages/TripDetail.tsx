import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
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
import { formatDate, relativeDate } from '../utils/date';

const Route = getRouteApi('/trips/$tripId');

function TripDetailView({ trip }: { trip: Trip }) {
  const navigate = useNavigate();
  const { toggleItem, addItem, removeItem, setAllPacked, reorderItems, shareTrip, unshareTrip } =
    useTrips();
  const { createTemplateFromTrip } = useTemplates();
  const {
    editing,
    editName,
    editDate,
    editNotes,
    editError,
    setEditName,
    setEditDate,
    setEditNotes,
    startEdit,
    cancelEdit,
    saveEdit,
  } = useEditableTrip(trip);

  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = trip.items.findIndex((i) => i.id === active.id);
    const newIndex = trip.items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    reorderItems(trip, arrayMove(trip.items, oldIndex, newIndex));
  };

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

  const handleExport = () => {
    const lines: string[] = [trip.name, `Date: ${formatDate(trip.date)}`, ''];
    if (trip.notes) {
      lines.push(trip.notes, '');
    }
    lines.push(`Progress: ${packed}/${trip.items.length} packed`, '');
    categoriesWithItems.forEach((cat) => {
      lines.push(cat.label.toUpperCase());
      itemsByCategory[cat.id].forEach((item) => {
        lines.push(
          `${item.packed ? '[x]' : '[ ]'} ${item.name}${item.quantity > 1 ? ` ×${item.quantity}` : ''}`
        );
      });
      lines.push('');
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${trip.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (trip.shareToken) {
      const url = `${window.location.origin}/share/${trip.shareToken}`;
      await navigator.clipboard.writeText(url).catch(() => null);
      showToast('Link copied!');
    } else {
      try {
        const { shareToken } = await shareTrip(trip.id);
        const url = `${window.location.origin}/share/${shareToken}`;
        await navigator.clipboard.writeText(url).catch(() => null);
        showToast('Sharing enabled — link copied!');
      } catch {
        showToast('Failed to enable sharing.');
      }
    }
  };

  const handleUnshare = async () => {
    try {
      await unshareTrip(trip.id);
      showToast('Sharing disabled.');
    } catch {
      showToast('Failed to disable sharing.');
    }
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
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={editNotes}
              onChange={(e) => {
                setEditNotes(e.target.value);
              }}
              placeholder="Optional notes…"
              className="field-base min-h-[80px] resize-y"
            />
          </div>
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
            <p className="text-sm text-gray-400">
              {formatDate(trip.date)}
              {relativeDate(trip.date) && (
                <span className="ml-1.5 text-forest/70">{relativeDate(trip.date)}</span>
              )}
            </p>
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
          <div className="flex gap-2 mt-2">
            {packed < trip.items.length && (
              <button
                onClick={() => {
                  setAllPacked(trip, true);
                }}
                className="text-xs text-forest hover:text-forest/80 font-medium"
              >
                Pack all
              </button>
            )}
            {packed > 0 && (
              <button
                onClick={() => {
                  setAllPacked(trip, false);
                }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Unpack all
              </button>
            )}
          </div>
        </div>
      )}

      {categoriesWithItems.length === 0 && !showAddForm && (
        <div className="text-center py-10">
          <p className="text-3xl mb-2">🎒</p>
          <p className="text-gray-500 text-sm">List is empty — add some items!</p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
      </DndContext>

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

      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
        {trip.items.length > 0 && (
          <div className="flex gap-2 flex-wrap">
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
            <Button variant="ghost" size="sm" onClick={handleExport} className="text-gray-500">
              Export
            </Button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              void handleShare();
            }}
            className="text-gray-500"
          >
            {trip.shareToken ? 'Copy link' : 'Share trip'}
          </Button>
          {trip.shareToken && (
            <button
              onClick={() => {
                void handleUnshare();
              }}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              Stop sharing
            </button>
          )}
        </div>
      </div>

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
