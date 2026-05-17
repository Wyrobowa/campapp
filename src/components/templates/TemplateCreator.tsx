import { useState } from 'react';
import type { CreatorAnswers, TripType, Duration, GroupSize, Season, GeneratedItem } from '../../data/templateGenerator';
import { generateItems, generateTemplateName } from '../../data/templateGenerator';
import { CATEGORIES } from '../../data/categories';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface TemplateCreatorProps {
  onSave: (name: string, items: GeneratedItem[]) => void;
  onCancel: () => void;
}

interface QuestionOption<T extends string> {
  value: T;
  emoji: string;
  label: string;
  description: string;
}

const TRIP_TYPE_OPTIONS: QuestionOption<TripType>[] = [
  { value: 'tent', emoji: '⛺', label: 'Tent camping', description: 'Backpacking with a tent' },
  { value: 'car', emoji: '🚗', label: 'Car camping', description: 'Comfort camping by the car' },
  { value: 'hiking', emoji: '🥾', label: 'Hiking', description: 'Ultralight backpacking' },
  { value: 'winter', emoji: '❄️', label: 'Winter camping', description: 'Cold-weather overnight' },
];

const DURATION_OPTIONS: QuestionOption<Duration>[] = [
  { value: 'day', emoji: '🌅', label: 'Day trip', description: 'No overnight stay' },
  { value: 'short', emoji: '🌙', label: '1–2 nights', description: 'Short weekend trip' },
  { value: 'medium', emoji: '📅', label: '3–5 nights', description: 'Extended trip' },
  { value: 'long', emoji: '🗓️', label: 'A week or more', description: 'Long expedition' },
];

const GROUP_OPTIONS: QuestionOption<GroupSize>[] = [
  { value: 'solo', emoji: '🧍', label: 'Solo', description: 'Just me' },
  { value: 'duo', emoji: '👫', label: 'Two people', description: 'Pair or couple' },
  { value: 'group', emoji: '👥', label: 'Small group', description: '3 to 5 people' },
];

const SEASON_OPTIONS: QuestionOption<Season>[] = [
  { value: 'summer', emoji: '☀️', label: 'Summer', description: 'Warm and dry' },
  { value: 'shoulder', emoji: '🍂', label: 'Spring / Autumn', description: 'Mild, variable weather' },
  { value: 'winter', emoji: '❄️', label: 'Winter', description: 'Cold, snow possible' },
];

const QUESTIONS = [
  { key: 'tripType' as const, heading: 'What kind of trip?', options: TRIP_TYPE_OPTIONS },
  { key: 'duration' as const, heading: 'How long?', options: DURATION_OPTIONS },
  { key: 'groupSize' as const, heading: "Who's coming?", options: GROUP_OPTIONS },
  { key: 'season' as const, heading: 'What season?', options: SEASON_OPTIONS },
];

export function TemplateCreator({ onSave, onCancel }: TemplateCreatorProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<CreatorAnswers>>({});
  const [templateName, setTemplateName] = useState('');
  const [items, setItems] = useState<GeneratedItem[]>([]);

  function handleAnswer(key: keyof CreatorAnswers, value: string) {
    const newAnswers = { ...answers, [key]: value } as Partial<CreatorAnswers>;
    setAnswers(newAnswers);

    if (step < QUESTIONS.length - 1) {
      setStep((s) => s + 1);
    } else {
      const fullAnswers = newAnswers as CreatorAnswers;
      setItems(generateItems(fullAnswers));
      setTemplateName(generateTemplateName(fullAnswers));
      setStep(QUESTIONS.length);
    }
  }

  function handleBack() {
    if (step === 0) {
      onCancel();
    } else {
      setStep((s) => s - 1);
    }
  }

  function handleRemoveItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSave() {
    if (!templateName.trim() || items.length === 0) return;
    onSave(templateName.trim(), items);
  }

  const BackButton = ({ to }: { to: number | 'cancel' }) => (
    <button
      onClick={to === 'cancel' ? onCancel : () => setStep(typeof to === 'number' ? to : 0)}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 -ml-1 p-1 rounded"
    >
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {to === 'cancel' ? 'Templates' : 'Back'}
    </button>
  );

  // Review step
  if (step === QUESTIONS.length) {
    const categoriesWithItems = CATEGORIES.filter((c) =>
      items.some((item) => item.category === c.id)
    );

    return (
      <div className="p-4 max-w-lg mx-auto">
        <BackButton to={QUESTIONS.length - 1} />

        <h2 className="text-xl font-bold text-gray-900 mb-1">Your template</h2>
        <p className="text-sm text-gray-500 mb-5">Remove items you don't need, then save.</p>

        <div className="mb-5">
          <Input
            label="Template name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </div>

        <div className="space-y-5 mb-6">
          {categoriesWithItems.map((cat) => (
            <div key={cat.id}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {cat.emoji} {cat.label}
              </p>
              <ul className="space-y-1">
                {items
                  .filter((item) => item.category === cat.id)
                  .map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-100"
                    >
                      <span className="text-sm text-gray-800">
                        {item.name}
                        {item.quantity > 1 && (
                          <span className="ml-1.5 text-xs text-gray-400">×{item.quantity}</span>
                        )}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded"
                        aria-label="Remove item"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <Button
          onClick={handleSave}
          className="w-full justify-center"
          disabled={!templateName.trim() || items.length === 0}
        >
          Save template ({items.length} items)
        </Button>
      </div>
    );
  }

  // Question step
  const question = QUESTIONS[step];
  const cols = question.options.length === 3 ? 'grid-cols-1' : 'grid-cols-2';

  return (
    <div className="p-4 max-w-lg mx-auto">
      <BackButton to={step === 0 ? 'cancel' : step - 1} />

      <div className="flex gap-1.5 mb-7">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full flex-1 transition-colors duration-300 ${
              i <= step ? 'bg-[#2D5016]' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-5">{question.heading}</h2>

      <div className={`grid ${cols} gap-3`}>
        {question.options.map((option) => {
          const isSelected = answers[question.key] === option.value;
          return (
            <button
              key={option.value}
              onClick={() => handleAnswer(question.key, option.value)}
              className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${
                isSelected
                  ? 'border-[#2D5016] bg-[#F0F4EC]'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-2xl mb-2">{option.emoji}</span>
              <span className="font-semibold text-gray-900 text-sm leading-tight">{option.label}</span>
              <span className="text-xs text-gray-500 mt-0.5">{option.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
