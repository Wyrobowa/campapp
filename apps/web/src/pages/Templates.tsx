import { useState } from 'react';
import { useTemplates } from '../hooks/useTemplates';
import { TemplateCard } from '../components/templates/TemplateCard';
import { TemplateCreator } from '../components/templates/TemplateCreator';
import { Button } from '../components/ui/Button';
import type { GeneratedItem } from '../data/templateGenerator';

export function Templates() {
  const { templates, isLoading, deleteTemplate, createTemplate } = useTemplates();
  const [showCreator, setShowCreator] = useState(false);

  const handleSave = (name: string, items: GeneratedItem[]) => {
    void createTemplate({ name }, items);
    setShowCreator(false);
  };

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

  const defaultTemplates = templates.filter((t) => t.isDefault);
  const customTemplates = templates.filter((t) => !t.isDefault);

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-forest">Templates</h1>
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

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-16 bg-white rounded-2xl border border-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <>
          {customTemplates.length > 0 && (
            <section className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Your templates
              </p>
              <div className="flex flex-col gap-3">
                {customTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onDelete={() => {
                      deleteTemplate(template.id);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {customTemplates.length === 0 && (
            <div className="bg-surface rounded-2xl p-5 mb-6 text-center">
              <p className="text-sm text-gray-500">
                No custom templates yet — use{' '}
                <span className="font-medium text-forest">+ New template</span> to build one from a
                wizard, or save any trip as a template.
              </p>
            </div>
          )}

          <section>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Built-in templates
            </p>
            <div className="flex flex-col gap-3">
              {defaultTemplates.map((template) => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
