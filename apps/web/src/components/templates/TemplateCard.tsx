import { useState } from 'react';
import type { Template } from '../../types';
import { Button } from '../ui/Button';

interface TemplateCardProps {
  template: Template;
  onUse?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TemplateCard({ template, onUse, onEdit, onDelete }: TemplateCardProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-900 text-base leading-tight">{template.name}</h3>
        {template.isDefault && (
          <span className="text-xs bg-surface text-forest px-2 py-0.5 rounded-full font-medium">
            Default
          </span>
        )}
      </div>
      {template.description && <p className="text-xs text-gray-500 mb-3">{template.description}</p>}
      <p className="text-xs text-gray-400 mb-4">{template.items.length} items</p>
      <div className="flex gap-2 items-center">
        {onUse && (
          <Button size="sm" onClick={onUse}>
            Use template
          </Button>
        )}
        {!template.isDefault && onEdit && (
          <Button size="sm" variant="secondary" onClick={onEdit}>
            Edit
          </Button>
        )}
        {!template.isDefault && onDelete && (
          <>
            {confirming ? (
              <>
                <button
                  onClick={() => {
                    setConfirming(false);
                  }}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded"
                >
                  Delete
                </button>
              </>
            ) : (
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  setConfirming(true);
                }}
              >
                Delete
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
