import { useState } from 'react';
import type { GearItem, GearCategory } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AddItemFormProps {
  onAdd: (item: Omit<GearItem, 'id'>) => void;
}

export function AddItemForm({ onAdd }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<GearCategory>('other');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), category, quantity, packed: false });
    setName('');
    setQuantity(1);
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
      />
      <div className="flex gap-3">
        <div className="flex-1 flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as GearCategory);
            }}
            className="field-base bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="w-24 flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Quantity</label>
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
      <Button type="submit" className="self-end">
        + Add
      </Button>
    </form>
  );
}
