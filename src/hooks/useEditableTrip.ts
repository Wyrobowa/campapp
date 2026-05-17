import { useState } from 'react';
import { useTrips } from './useTrips';
import type { Trip } from '../types';

export function useEditableTrip(trip: Trip) {
  const { updateTrip } = useTrips();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');

  function startEdit() {
    setEditName(trip.name);
    setEditDate(trip.date);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
  }

  function saveEdit() {
    if (!editName.trim()) return;
    updateTrip(trip.id, { name: editName.trim(), date: editDate });
    setEditing(false);
  }

  return { editing, editName, editDate, setEditName, setEditDate, startEdit, cancelEdit, saveEdit };
}
