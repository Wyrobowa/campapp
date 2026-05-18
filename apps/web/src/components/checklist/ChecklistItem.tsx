import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { GearItem } from '../../types';

interface ChecklistItemProps {
  item: GearItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function ChecklistItem({ item, onToggle, onRemove }: ChecklistItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="flex items-center gap-3 py-2.5 px-1 group">
      <button
        {...attributes}
        {...listeners}
        className="text-gray-200 hover:text-gray-400 active:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.2" />
          <circle cx="11" cy="4" r="1.2" />
          <circle cx="5" cy="8" r="1.2" />
          <circle cx="11" cy="8" r="1.2" />
          <circle cx="5" cy="12" r="1.2" />
          <circle cx="11" cy="12" r="1.2" />
        </svg>
      </button>

      <button
        onClick={() => {
          onToggle(item.id);
        }}
        className={`w-6 h-6 rounded-md border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          item.packed ? 'bg-forest border-forest' : 'border-gray-300 hover:border-forest'
        }`}
        aria-label={item.packed ? 'Uncheck' : 'Mark as packed'}
      >
        {item.packed && (
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6l3 3 5-5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <span
        className={`flex-1 text-sm ${item.packed ? 'line-through text-gray-400' : 'text-gray-800'}`}
      >
        {item.name}
        {item.quantity > 1 && (
          <span className="ml-1.5 text-xs text-gray-400">×{item.quantity}</span>
        )}
      </span>

      <button
        onClick={() => {
          onRemove(item.id);
        }}
        className="text-gray-300 hover:text-red-500 active:text-red-500 transition-colors p-1 rounded flex-shrink-0"
        aria-label="Remove item"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 4l8 8M12 4l-8 8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </li>
  );
}
