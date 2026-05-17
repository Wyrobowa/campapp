import type { GearCategory } from '../types';
import { generateId } from '../utils/id';

export type TripType = 'tent' | 'car' | 'hiking' | 'winter';
export type Duration = 'day' | 'short' | 'medium' | 'long';
export type GroupSize = 'solo' | 'duo' | 'group';
export type Season = 'summer' | 'shoulder' | 'winter';

export interface CreatorAnswers {
  tripType: TripType;
  duration: Duration;
  groupSize: GroupSize;
  season: Season;
}

export interface GeneratedItem {
  id: string;
  name: string;
  category: GearCategory;
  quantity: number;
}

export function generateTemplateName(answers: CreatorAnswers): string {
  const { tripType, duration, season } = answers;

  const typeLabel: Record<TripType, string> = {
    tent: 'tent camping',
    car: 'car camping',
    hiking: 'hiking',
    winter: 'winter camping',
  };
  const durationLabel: Record<Duration, string> = {
    day: 'Day trip',
    short: '1–2 night',
    medium: '3–5 night',
    long: 'Week-long',
  };
  const seasonLabel: Record<Season, string> = {
    summer: 'summer',
    shoulder: 'spring/autumn',
    winter: 'winter',
  };

  if (duration === 'day') return `Day trip — ${typeLabel[tripType]}`;
  if (tripType === 'winter') return `${durationLabel[duration]} winter camping`;
  return `${durationLabel[duration]} ${seasonLabel[season]} ${typeLabel[tripType]}`;
}

export function generateItems(answers: CreatorAnswers): GeneratedItem[] {
  const { tripType, duration, groupSize, season } = answers;
  const overnight = duration !== 'day';
  const isWinter = season === 'winter' || tripType === 'winter';
  const isCold = season !== 'summer' || tripType === 'winter';
  const isLong = duration === 'medium' || duration === 'long';
  const isVeryLong = duration === 'long';
  const ppl = groupSize === 'solo' ? 1 : groupSize === 'duo' ? 2 : 4;
  const socks = isVeryLong ? 7 : isLong ? 4 : 3;

  const raw: Omit<GeneratedItem, 'id'>[] = [];

  // SHELTER
  if (overnight) {
    if (tripType === 'car') {
      raw.push({ name: 'Family tent', category: 'shelter', quantity: 1 });
      raw.push({ name: 'Tent awning', category: 'shelter', quantity: 1 });
    } else if (tripType === 'winter') {
      raw.push({ name: '4-season tent', category: 'shelter', quantity: 1 });
    } else if (tripType === 'hiking') {
      raw.push({ name: 'Ultralight tent', category: 'shelter', quantity: 1 });
    } else {
      raw.push({ name: 'Tent', category: 'shelter', quantity: 1 });
      raw.push({ name: 'Spare tent pegs', category: 'shelter', quantity: 6 });
    }
  }

  // SLEEPING
  if (overnight) {
    if (tripType === 'winter') {
      raw.push({ name: 'Winter sleeping bag (-20°C)', category: 'sleeping', quantity: ppl });
      raw.push({ name: 'Insulating mat', category: 'sleeping', quantity: ppl });
      raw.push({ name: 'Mat underlay', category: 'sleeping', quantity: ppl });
    } else if (tripType === 'hiking') {
      raw.push({ name: 'Down sleeping bag', category: 'sleeping', quantity: ppl });
      raw.push({ name: 'Foam sleeping mat', category: 'sleeping', quantity: ppl });
    } else if (tripType === 'car') {
      raw.push({ name: 'Sleeping bag', category: 'sleeping', quantity: ppl });
      raw.push({ name: 'Inflatable mattress', category: 'sleeping', quantity: Math.ceil(ppl / 2) });
      raw.push({ name: 'Electric pump', category: 'sleeping', quantity: 1 });
    } else {
      raw.push({ name: 'Sleeping bag', category: 'sleeping', quantity: ppl });
      raw.push({ name: 'Self-inflating sleeping mat', category: 'sleeping', quantity: ppl });
      raw.push({ name: 'Pillow', category: 'sleeping', quantity: ppl });
    }
  }

  // COOKING
  if (tripType === 'car') {
    raw.push({ name: '2-burner camping stove', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Camping cooler', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Cookware set', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Cutlery set', category: 'cooking', quantity: ppl });
  } else if (tripType === 'hiking') {
    raw.push({ name: 'Alcohol stove', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Titanium mug', category: 'cooking', quantity: ppl });
  } else if (overnight) {
    raw.push({ name: 'Gas stove', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Gas canister', category: 'cooking', quantity: isVeryLong ? 3 : isLong ? 2 : 1 });
    raw.push({ name: 'Pot', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Mug', category: 'cooking', quantity: ppl });
    raw.push({ name: 'Cutlery', category: 'cooking', quantity: ppl });
  }
  if (isWinter && overnight) {
    raw.push({ name: 'Thermos', category: 'cooking', quantity: ppl });
  }

  // CLOTHING
  if (isWinter) {
    raw.push({ name: 'Down jacket', category: 'clothing', quantity: ppl });
    raw.push({ name: 'Ski pants', category: 'clothing', quantity: ppl });
    raw.push({ name: 'Gloves', category: 'clothing', quantity: ppl });
    raw.push({ name: 'Balaclava', category: 'clothing', quantity: ppl });
    raw.push({ name: 'Thermal base layer', category: 'clothing', quantity: ppl });
    raw.push({ name: 'Wool socks', category: 'clothing', quantity: ppl * socks });
  } else {
    raw.push({ name: 'Rain jacket', category: 'clothing', quantity: ppl });
    if (isCold) raw.push({ name: 'Fleece', category: 'clothing', quantity: ppl });
    raw.push({ name: 'Socks', category: 'clothing', quantity: ppl * socks });
    if (tripType === 'hiking') {
      raw.push({ name: 'Hiking boots', category: 'clothing', quantity: ppl });
    }
  }

  // TOOLS
  raw.push({ name: 'Headlamp', category: 'tools', quantity: ppl });
  if (overnight) raw.push({ name: 'Pocket knife', category: 'tools', quantity: 1 });
  if (tripType === 'hiking') {
    raw.push({ name: 'Trekking poles', category: 'tools', quantity: ppl * 2 });
    raw.push({ name: 'Map + compass', category: 'tools', quantity: 1 });
  }
  if (isLong || tripType === 'car') {
    raw.push({ name: 'Power bank', category: 'tools', quantity: groupSize === 'group' ? 2 : 1 });
  }
  if (tripType === 'car') {
    raw.push({ name: 'LED lantern', category: 'tools', quantity: 1 });
    raw.push({ name: 'Extension cord / power station', category: 'tools', quantity: 1 });
  }
  if (tripType === 'winter') {
    raw.push({ name: 'Crampons / microspikes', category: 'tools', quantity: ppl });
    raw.push({ name: 'Snow shovel', category: 'tools', quantity: 1 });
  }

  // FIRST AID
  raw.push({ name: 'First aid kit', category: 'first-aid', quantity: 1 });
  if (season === 'summer' && tripType !== 'winter') {
    raw.push({ name: 'Sunscreen', category: 'first-aid', quantity: 1 });
    raw.push({ name: 'Insect repellent', category: 'first-aid', quantity: 1 });
  }
  if (isWinter) {
    raw.push({ name: 'Emergency blanket', category: 'first-aid', quantity: ppl });
  }

  // OTHER
  if (tripType === 'car') {
    raw.push({ name: 'Folding table', category: 'other', quantity: 1 });
    raw.push({ name: 'Camping chairs', category: 'other', quantity: ppl });
  }
  if (isWinter) {
    raw.push({ name: 'Chemical hand warmers', category: 'other', quantity: ppl * 2 });
  }

  return raw.map((item) => ({ ...item, id: generateId() }));
}
