import { useState } from 'react';
import type { GearItem, GearCategory } from '../../types';
import { CATEGORY_MAP } from '../../data/categories';
import { ChecklistItem } from './ChecklistItem';

interface CategoryGroupProps {
  category: GearCategory;
  items: GearItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function CategoryGroup({ category, items, onToggle, onRemove }: CategoryGroupProps) {
  const [collapsed, setCollapsed] = useState(false);
  const cat = CATEGORY_MAP[category];
  const packedCount = items.filter((i) => i.packed).length;

  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between py-2 px-1 text-left"
      >
        <span className="flex items-center gap-2 font-medium text-sm text-gray-700">
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
          <span className="text-xs text-gray-400 font-normal">
            {packedCount}/{items.length}
          </span>
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${collapsed ? '-rotate-90' : ''}`}
          viewBox="0 0 16 16" fill="none"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {!collapsed && (
        <ul className="divide-y divide-gray-100 pl-1">
          {items.map((item) => (
            <ChecklistItem key={item.id} item={item} onToggle={onToggle} onRemove={onRemove} />
          ))}
        </ul>
      )}
    </div>
  );
}
