import { useState } from 'react';
import { useTemplates } from '../hooks/useTemplates';
import { TemplateCard } from '../components/templates/TemplateCard';
import { TemplateCreator } from '../components/templates/TemplateCreator';
import { Button } from '../components/ui/Button';
import type { GeneratedItem } from '../data/templateGenerator';

export function Templates() {
  const { templates, deleteTemplate, createTemplate } = useTemplates();
  const [showCreator, setShowCreator] = useState(false);

  function handleSave(name: string, items: GeneratedItem[]) {
    createTemplate({ name }, items);
    setShowCreator(false);
  }

  if (showCreator) {
    return (
      <TemplateCreator
        onSave={handleSave}
        onCancel={() => {
          setShowCreator(false);
        }}
      />
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#2D5016]">Templates</h1>
          <p className="text-sm text-gray-500">Ready-made gear lists</p>
        </div>
        <Button
          onClick={() => {
            setShowCreator(true);
          }}
        >
          + New template
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onDelete={
              !template.isDefault
                ? () => {
                    deleteTemplate(template.id);
                  }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
