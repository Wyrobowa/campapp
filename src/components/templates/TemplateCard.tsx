import type { Template } from '../../types';
import { Button } from '../ui/Button';

interface TemplateCardProps {
  template: Template;
  onUse: () => void;
  onDelete?: () => void;
}

export function TemplateCard({ template, onUse, onDelete }: TemplateCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-900 text-base leading-tight">{template.name}</h3>
        {template.isDefault && (
          <span className="text-xs bg-[#F0F4EC] text-[#2D5016] px-2 py-0.5 rounded-full font-medium">
            Default
          </span>
        )}
      </div>
      {template.description && (
        <p className="text-xs text-gray-500 mb-3">{template.description}</p>
      )}
      <p className="text-xs text-gray-400 mb-4">{template.items.length} items</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={onUse}>Use template</Button>
        {!template.isDefault && onDelete && (
          <Button size="sm" variant="danger" onClick={onDelete}>Delete</Button>
        )}
      </div>
    </div>
  );
}
