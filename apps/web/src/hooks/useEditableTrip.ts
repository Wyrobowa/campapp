import { useState } from 'react';
import { useTrips } from './useTrips';
import type { Trip } from '../types';

export function useEditableTrip(trip: Trip) {
  const { updateTrip } = useTrips();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const startEdit = () => {
    setEditName(trip.name);
    setEditDate(trip.date);
    setEditNotes(trip.notes ?? '');
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditError(null);
  };

  const saveEdit = async () => {
    if (!editName.trim()) return;
    setEditError(null);
    try {
      await updateTrip(trip.id, {
        name: editName.trim(),
        date: editDate,
        notes: editNotes.trim() || undefined,
      });
      setEditing(false);
    } catch {
      setEditError('Failed to save changes.');
    }
  };

  return {
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
  };
}
