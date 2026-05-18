import { useState } from 'react';
import type { Template, Trip } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface TripFormProps {
  templates: Template[];
  onSubmit: (data: Pick<Trip, 'name' | 'date' | 'notes' | 'templateId'>) => void;
  onCancel: () => void;
}

export function TripForm({ templates, onSubmit, onCancel }: TripFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState('');
  const [templateId, setTemplateId] = useState('');

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;
    onSubmit({
      name: name.trim(),
      date,
      notes: notes.trim() || undefined,
      templateId: templateId || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Trip name"
        id="trip-name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        placeholder="e.g. Mountain hike with friends"
        required
      />
      <Input
        label="Date"
        id="trip-date"
        type="date"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
        }}
        required
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="trip-template" className="text-sm font-medium text-gray-700">
          Template (optional)
        </label>
        <select
          id="trip-template"
          value={templateId}
          onChange={(e) => {
            setTemplateId(e.target.value);
          }}
          className="field-base bg-white"
        >
          <option value="">— start from scratch —</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="trip-notes" className="text-sm font-medium text-gray-700">
          Notes (optional)
        </label>
        <textarea
          id="trip-notes"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
          }}
          rows={3}
          placeholder="Campsite, route plan..."
          className="field-base resize-none"
        />
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create trip</Button>
      </div>
    </form>
  );
}
