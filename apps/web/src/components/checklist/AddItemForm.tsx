import { useState } from 'react';
import type { GearItem } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AddItemFormProps {
  onAdd: (item: Omit<GearItem, 'id'>) => void;
}

export function AddItemForm({ onAdd }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('other');
  const [customCategory, setCustomCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState<'g' | 'oz'>('g');
  const [showExtra, setShowExtra] = useState(false);

  const isCustom = category === '__custom__';
  const effectiveCategory = isCustom ? customCategory.trim() || 'other' : category;

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const parsedWeight = weight ? parseFloat(weight) : undefined;
    onAdd({
      name: name.trim(),
      category: effectiveCategory,
      quantity,
      packed: false,
      notes: notes.trim() || undefined,
      weight: parsedWeight && !isNaN(parsedWeight) ? parsedWeight : undefined,
      weightUnit: parsedWeight ? weightUnit : undefined,
    });
    setName('');
    setQuantity(1);
    setNotes('');
    setWeight('');
    setCustomCategory('');
    setShowExtra(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4 bg-surface rounded-xl">
      <Input
        label="Item name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
        placeholder="e.g. Sleeping bag"
        autoFocus
      />
      <div className="flex gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
            }}
            className="field-base bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </option>
            ))}
            <option value="__custom__">✏️ Custom…</option>
          </select>
        </div>
        <div className="w-24 flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Qty</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => {
              setQuantity(Math.max(1, parseInt(e.target.value) || 1));
            }}
            className="field-base"
          />
        </div>
      </div>

      {isCustom && (
        <input
          value={customCategory}
          onChange={(e) => {
            setCustomCategory(e.target.value);
          }}
          placeholder="Category name…"
          className="field-base"
          autoFocus
        />
      )}

      <button
        type="button"
        onClick={() => {
          setShowExtra((v) => !v);
        }}
        className="text-xs text-gray-400 hover:text-gray-600 text-left"
      >
        {showExtra ? '▲ Hide' : '▼ Notes & weight'}
      </button>

      {showExtra && (
        <>
          <input
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
            }}
            placeholder="Notes (optional)"
            className="field-base text-sm"
          />
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              step="any"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
              }}
              placeholder="Weight"
              className="field-base flex-1 text-sm"
            />
            <select
              value={weightUnit}
              onChange={(e) => {
                setWeightUnit(e.target.value as 'g' | 'oz');
              }}
              className="field-base bg-white w-16 text-sm"
            >
              <option value="g">g</option>
              <option value="oz">oz</option>
            </select>
          </div>
        </>
      )}

      <Button type="submit" className="self-end">
        + Add
      </Button>
    </form>
  );
}
