import { useState } from 'react';
import type {
  CreatorAnswers, SleepSetup, EatingSetup, FuelSource, VehicleEquipment,
  Activity, Duration, GroupComposition, Season, GeneratedItem,
} from '../../data/templateGenerator';

import { generateItems, generateTemplateName } from '../../data/templateGenerator';
import { CATEGORIES } from '../../data/categories';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface TemplateCreatorProps {
  onSave: (name: string, items: GeneratedItem[]) => void;
  onCancel: () => void;
}

interface Option<T extends string> {
  value: T;
  emoji: string;
  label: string;
  description: string;
}

// ── OPTION LISTS ─────────────────────────────────────────────────

const SLEEP_OPTIONS: Option<SleepSetup>[] = [
  { value: 'tent', emoji: '⛺', label: 'Tent', description: 'Traditional tent setup' },
  { value: 'car', emoji: '🚗', label: 'In the car', description: 'Sleeping in your car' },
  { value: 'car-tent', emoji: '🏕️', label: 'Car / roof tent', description: 'Tent attached to the car' },
  { value: 'van', emoji: '🚐', label: 'Van / campervan', description: 'Converted van or motorhome' },
];

const EAT_OPTIONS: Option<EatingSetup>[] = [
  { value: 'stove', emoji: '🍳', label: 'Camp stove', description: 'Hot meals on a portable stove' },
  { value: 'campfire', emoji: '🔥', label: 'Campfire cooking', description: 'Cooking over an open fire' },
  { value: 'bbq', emoji: '🥩', label: 'BBQ / grilling', description: 'Charcoal or portable grill' },
  { value: 'cold-food', emoji: '🥗', label: 'Cold food & snacks', description: 'No cooking needed' },
  { value: 'freeze-dried', emoji: '🧂', label: 'Freeze-dried meals', description: 'Just add boiling water' },
  { value: 'restaurants', emoji: '🍽️', label: 'Restaurants & cafés', description: 'Mostly eating out' },
];

const VEHICLE_OPTIONS: Option<VehicleEquipment>[] = [
  { value: 'fridge', emoji: '🧊', label: 'Fridge / cooler', description: 'Car fridge or portable cooler' },
  { value: 'stove', emoji: '🍳', label: 'Camp stove / kitchen', description: 'Cooking setup already packed' },
  { value: 'inverter', emoji: '⚡', label: 'Power inverter / solar', description: 'Shore power, inverter or solar' },
  { value: 'chairs-table', emoji: '🪑', label: 'Chairs & table', description: 'Camping furniture already in the car' },
];

const FUEL_OPTIONS: Option<FuelSource>[] = [
  { value: 'gas', emoji: '⛽', label: 'Gas canister stove', description: 'Most common, easy to find' },
  { value: 'alcohol', emoji: '🍶', label: 'Alcohol stove', description: 'Lightweight, ultralight setups' },
  { value: 'electric', emoji: '⚡', label: 'Electric / induction', description: 'Needs a power source' },
  { value: 'campfire', emoji: '🔥', label: 'Campfire', description: 'Wood fire where permitted' },
];

const ACTIVITY_OPTIONS: Option<Activity>[] = [
  { value: 'hiking', emoji: '🥾', label: 'Hiking', description: 'Trails and trekking' },
  { value: 'swimming', emoji: '🏊', label: 'Swimming', description: 'Lakes, rivers or sea' },
  { value: 'cycling', emoji: '🚲', label: 'Cycling', description: 'Bike rides or touring' },
  { value: 'climbing', emoji: '🧗', label: 'Climbing', description: 'Rock or sport climbing' },
  { value: 'fishing', emoji: '🎣', label: 'Fishing', description: 'Angling or fly fishing' },
  { value: 'paddling', emoji: '🛶', label: 'Paddling', description: 'Kayak, canoe or SUP' },
];

const DURATION_OPTIONS: Option<Duration>[] = [
  { value: 'day', emoji: '🌅', label: 'Day trip', description: 'No overnight stay' },
  { value: 'short', emoji: '🌙', label: '1–2 nights', description: 'Short weekend trip' },
  { value: 'medium', emoji: '📅', label: '3–5 nights', description: 'Extended trip' },
  { value: 'long', emoji: '🗓️', label: 'A week or more', description: 'Long expedition' },
];

const SEASON_OPTIONS: Option<Season>[] = [
  { value: 'summer', emoji: '☀️', label: 'Summer', description: 'Warm and dry' },
  { value: 'shoulder', emoji: '🍂', label: 'Spring / Autumn', description: 'Mild, variable weather' },
  { value: 'winter', emoji: '❄️', label: 'Winter', description: 'Cold, snow possible' },
];

// ── QUESTION DEFINITIONS ─────────────────────────────────────────

interface QuestionDef {
  key: keyof PartialAnswers;
  heading: string;
  subheading: string;
  multiSelect: boolean;
  options: Option<string>[];
  cols: 1 | 2;
}

const SLEEP_Q: QuestionDef = { key: 'sleepSetup', heading: 'Where will you sleep?', subheading: 'Your main sleeping setup for this trip.', multiSelect: false, options: SLEEP_OPTIONS, cols: 2 };
const EAT_Q: QuestionDef = { key: 'eatingSetup', heading: 'How will you eat?', subheading: 'Select all that apply.', multiSelect: true, options: EAT_OPTIONS, cols: 2 };
const VEHICLE_Q: QuestionDef = { key: 'vehicleEquipment', heading: "What's already in your vehicle?", subheading: "Select what you've already got packed — those items won't appear on your list.", multiSelect: true, options: VEHICLE_OPTIONS, cols: 2 };
const FUEL_Q: QuestionDef = { key: 'fuelSource', heading: 'What will you cook on?', subheading: 'Determines which stove and fuel to add to your list.', multiSelect: false, options: FUEL_OPTIONS, cols: 2 };
const ACTIVITIES_Q: QuestionDef = { key: 'activities', heading: 'Any planned activities?', subheading: 'Select all that apply. Skip if none.', multiSelect: true, options: ACTIVITY_OPTIONS, cols: 2 };
const DURATION_Q: QuestionDef = { key: 'duration', heading: 'How long is the trip?', subheading: 'Affects quantities and supply planning.', multiSelect: false, options: DURATION_OPTIONS, cols: 2 };
const GROUP_Q: QuestionDef = { key: 'group', heading: "Who's coming?", subheading: 'Sets quantities for personal gear.', multiSelect: false, options: [], cols: 1 };
const SEASON_Q: QuestionDef = { key: 'season', heading: 'What season?', subheading: 'Determines clothing and weather gear.', multiSelect: false, options: SEASON_OPTIONS, cols: 1 };

// ── TYPES ────────────────────────────────────────────────────────

type MultiKey = 'activities' | 'vehicleEquipment' | 'eatingSetup';
type SingleKey = Exclude<keyof CreatorAnswers, MultiKey | 'group'>;

type PartialAnswers = Omit<Partial<CreatorAnswers>, MultiKey | 'group'> & {
  activities: Activity[];
  vehicleEquipment: VehicleEquipment[];
  eatingSetup: EatingSetup[];
  group: GroupComposition;
};

// ── DYNAMIC QUESTION BUILDER ─────────────────────────────────────

function computeQuestions(answers: PartialAnswers): QuestionDef[] {
  const isVehicleSleep = answers.sleepSetup === 'car' || answers.sleepSetup === 'van' || answers.sleepSetup === 'car-tent';
  const needsFuel = (answers.eatingSetup.includes('stove') || answers.eatingSetup.includes('freeze-dried'))
    && !answers.vehicleEquipment.includes('stove');

  const qs: QuestionDef[] = [SLEEP_Q, EAT_Q];
  if (isVehicleSleep) qs.push(VEHICLE_Q);
  if (needsFuel) qs.push(FUEL_Q);
  qs.push(ACTIVITIES_Q, DURATION_Q, GROUP_Q, SEASON_Q);
  return qs;
}

// ── STEPPER ROW ──────────────────────────────────────────────────

function StepperRow({ label, subtitle, value, min = 0, onChange }: {
  label: string;
  subtitle?: string;
  value: number;
  min?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 px-4 bg-white rounded-2xl border-2 border-gray-200">
      <div>
        <p className="font-semibold text-gray-900 text-sm">{label}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:border-[#2D5016] hover:text-[#2D5016] transition-colors"
          aria-label={`Decrease ${label}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span className="w-5 text-center font-semibold text-gray-900 text-base tabular-nums">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-600 hover:border-[#2D5016] hover:text-[#2D5016] transition-colors"
          aria-label={`Increase ${label}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── COMPONENT ────────────────────────────────────────────────────

export function TemplateCreator({ onSave, onCancel }: TemplateCreatorProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({
    activities: [],
    vehicleEquipment: [],
    eatingSetup: [],
    group: { adults: 1, kids: 0, pets: 0 },
  });
  const [templateName, setTemplateName] = useState('');
  const [items, setItems] = useState<GeneratedItem[]>([]);

  const questions = computeQuestions(answers);
  const isReview = step >= questions.length;

  function goToReview(final: PartialAnswers) {
    const full = final as CreatorAnswers;
    setItems(generateItems(full));
    setTemplateName(generateTemplateName(full));
    setStep(questions.length);
  }

  function advance(nextAnswers: PartialAnswers) {
    const nextQuestions = computeQuestions(nextAnswers);
    if (step < nextQuestions.length - 1) {
      setStep((s) => s + 1);
    } else {
      goToReview(nextAnswers);
    }
  }

  function handleSingleSelect(key: SingleKey, value: string) {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    advance(next);
  }

  function handleMultiToggle(key: MultiKey, value: string) {
    setAnswers((prev) => {
      const current = prev[key] as string[];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  }

  function handleGroupChange(field: keyof GroupComposition, value: number) {
    setAnswers((prev) => ({ ...prev, group: { ...prev.group, [field]: value } }));
  }

  function handleContinue() {
    advance(answers);
  }

  function handleBack() {
    if (step === 0) onCancel();
    else if (isReview) setStep(questions.length - 1);
    else setStep((s) => s - 1);
  }

  function handleRemoveItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleSave() {
    if (!templateName.trim() || items.length === 0) return;
    onSave(templateName.trim(), items);
  }

  const BackButton = ({ label }: { label: string }) => (
    <button onClick={handleBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 -ml-1 p-1 rounded">
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );

  // ── REVIEW ───────────────────────────────────────────────────────
  if (isReview) {
    const categoriesWithItems = CATEGORIES.filter((c) => items.some((item) => item.category === c.id));
    return (
      <div className="p-4 max-w-lg mx-auto">
        <BackButton label="Back" />
        <h2 className="text-xl font-bold text-gray-900 mb-1">Your template</h2>
        <p className="text-sm text-gray-500 mb-5">Remove items you don't need, then save.</p>
        <div className="mb-5">
          <Input label="Template name" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
        </div>
        <div className="space-y-5 mb-6">
          {categoriesWithItems.map((cat) => (
            <div key={cat.id}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{cat.emoji} {cat.label}</p>
              <ul className="space-y-1">
                {items.filter((item) => item.category === cat.id).map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-100">
                    <span className="text-sm text-gray-800">
                      {item.name}
                      {item.quantity > 1 && <span className="ml-1.5 text-xs text-gray-400">×{item.quantity}</span>}
                    </span>
                    <button onClick={() => handleRemoveItem(item.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1 rounded" aria-label="Remove item">
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
        <Button onClick={handleSave} className="w-full justify-center" disabled={!templateName.trim() || items.length === 0}>
          Save template ({items.length} items)
        </Button>
      </div>
    );
  }

  // ── QUESTION ─────────────────────────────────────────────────────
  const question = questions[step];
  const isGroup = question.key === 'group';
  const isMulti = question.multiSelect;
  const multiKey = isMulti ? (question.key as MultiKey) : null;
  const selectedMulti = multiKey ? (answers[multiKey] as string[]) : [];
  const needsContinue = isGroup || isMulti;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <BackButton label={step === 0 ? 'Templates' : 'Back'} />

      <div className="flex gap-1.5 mb-6">
        {questions.map((_, i) => (
          <div key={i} className={`h-1 rounded-full flex-1 transition-colors duration-300 ${i <= step ? 'bg-[#2D5016]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-1">{question.heading}</h2>
      <p className="text-sm text-gray-500 mb-5">{question.subheading}</p>

      {isGroup ? (
        <div className="flex flex-col gap-3 mb-5">
          <StepperRow label="Adults" subtitle="18 years and older" value={answers.group.adults} min={1} onChange={(v) => handleGroupChange('adults', v)} />
          <StepperRow label="Kids" subtitle="Under 18" value={answers.group.kids} min={0} onChange={(v) => handleGroupChange('kids', v)} />
          <StepperRow label="Pets" subtitle="Dogs and other animals" value={answers.group.pets} min={0} onChange={(v) => handleGroupChange('pets', v)} />
        </div>
      ) : (
        <div className={`grid gap-3 mb-5 ${question.cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {question.options.map((option) => {
            const isSelected = isMulti
              ? selectedMulti.includes(option.value)
              : answers[question.key as SingleKey] === option.value;

            return (
              <button
                key={option.value}
                onClick={() =>
                  isMulti
                    ? handleMultiToggle(multiKey!, option.value)
                    : handleSingleSelect(question.key as SingleKey, option.value)
                }
                className={`flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] ${isSelected ? 'border-[#2D5016] bg-[#F0F4EC]' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="w-full flex items-start justify-between mb-2">
                  <span className="text-2xl">{option.emoji}</span>
                  {isMulti && isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#2D5016] flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </div>
                <span className="font-semibold text-gray-900 text-sm leading-tight">{option.label}</span>
                <span className="text-xs text-gray-500 mt-0.5">{option.description}</span>
              </button>
            );
          })}
        </div>
      )}

      {needsContinue && (
        <Button onClick={handleContinue} className="w-full justify-center">
          {isGroup
            ? `Continue — ${answers.group.adults + answers.group.kids} ${answers.group.adults + answers.group.kids === 1 ? 'person' : 'people'}${answers.group.pets > 0 ? ` + ${answers.group.pets} pet${answers.group.pets > 1 ? 's' : ''}` : ''}`
            : question.key === 'vehicleEquipment'
              ? selectedMulti.length === 0 ? 'Nothing pre-packed — continue' : `Continue (${selectedMulti.length} already packed)`
              : question.key === 'eatingSetup'
                ? selectedMulti.length === 0 ? 'Continue — eating out only' : `Continue (${selectedMulti.length} meal type${selectedMulti.length === 1 ? '' : 's'})`
                : selectedMulti.length === 0 ? 'Skip — no specific activities' : `Continue with ${selectedMulti.length} activit${selectedMulti.length === 1 ? 'y' : 'ies'}`}
        </Button>
      )}
    </div>
  );
}
