import { useState } from 'react';
import type { Template, TemplateItem, GearCategory } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface TemplateEditorProps {
  template: Template;
  onSave: (
    id: string,
    patch: Partial<Pick<Template, 'name' | 'description' | 'items'>>
  ) => Promise<void>;
  onCancel: () => void;
}

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description ?? '');
  const [items, setItems] = useState<TemplateItem[]>(template.items);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<GearCategory>('other');
  const [newQty, setNewQty] = useState(1);

  const addItem = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: newName.trim(), category: newCategory, quantity: newQty },
    ]);
    setNewName('');
    setNewQty(1);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await onSave(template.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        items,
      });
    } catch {
      setError('Failed to save template.');
      setSaving(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onCancel}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 -ml-1 p-1 rounded"
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
          Back
        </button>
        <h1 className="text-xl font-bold text-forest">Edit template</h1>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <Input
          label="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          placeholder="Template name"
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <input
            className="field-base"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            placeholder="Optional description"
          />
        </div>
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Items ({items.length})
      </p>

      {items.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {items.map((item) => {
            const cat = CATEGORIES.find((c) => c.id === item.category);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{cat?.emoji}</span>
                  <span className="text-sm text-gray-800 truncate">{item.name}</span>
                  {item.quantity > 1 && (
                    <span className="text-xs text-gray-400">×{item.quantity}</span>
                  )}
                </div>
                <button
                  onClick={() => {
                    removeItem(item.id);
                  }}
                  className="text-gray-300 hover:text-red-400 transition-colors ml-3 flex-shrink-0"
                  aria-label="Remove item"
                >
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 4h10M6 4V3h4v1M5 4v8h6V4H5z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={addItem} className="flex flex-col gap-3 p-4 bg-surface rounded-xl mb-6">
        <Input
          label="Item name"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
          }}
          placeholder="e.g. Sleeping bag"
        />
        <div className="flex gap-3">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={newCategory}
              onChange={(e) => {
                setNewCategory(e.target.value as GearCategory);
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
              value={newQty}
              onChange={(e) => {
                setNewQty(Math.max(1, parseInt(e.target.value) || 1));
              }}
              className="field-base"
            />
          </div>
        </div>
        <Button type="submit" className="self-end">
          + Add
        </Button>
      </form>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="flex gap-3">
        <button onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button
          onClick={() => {
            void handleSave();
          }}
          disabled={saving || !name.trim()}
          className="btn-primary flex-1"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}
