import { useTemplates } from '../hooks/useTemplates';
import { TemplateCard } from '../components/templates/TemplateCard';

export function Templates() {
  const { templates, deleteTemplate } = useTemplates();

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2D5016]">Templates</h1>
        <p className="text-sm text-gray-500">Ready-made gear lists</p>
      </div>

      <div className="flex flex-col gap-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={() => {}}
            onDelete={!template.isDefault ? () => deleteTemplate(template.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
