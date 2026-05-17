import type { GearCategory } from '../types';
import { generateId } from '../utils/id';

export type SleepSetup = 'tent' | 'car' | 'car-tent' | 'van';
export type EatingSetup = 'cook-all' | 'mix' | 'restaurants' | 'cold-food';
export type FuelSource = 'gas' | 'alcohol' | 'electric' | 'campfire';
export type VehicleEquipment = 'fridge' | 'stove' | 'inverter' | 'chairs-table';
export type Activity = 'hiking' | 'swimming' | 'cycling' | 'climbing' | 'fishing' | 'paddling';
export type Duration = 'day' | 'short' | 'medium' | 'long';
export type GroupSize = 'solo' | 'duo' | 'family' | 'with-pet' | 'group' | 'large-group';
export type Season = 'summer' | 'shoulder' | 'winter';

export interface CreatorAnswers {
  sleepSetup: SleepSetup;
  eatingSetup: EatingSetup;
  fuelSource?: FuelSource;
  vehicleEquipment: VehicleEquipment[];
  activities: Activity[];
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
  const { sleepSetup, duration, season, activities, groupSize } = answers;

  const sleepLabel: Record<SleepSetup, string> = {
    tent: 'tent camping',
    car: 'car camping',
    'car-tent': 'car tent camping',
    van: 'van trip',
  };
  const durationLabel: Record<Duration, string> = {
    day: 'Day trip', short: '1–2 night', medium: '3–5 night', long: 'Week-long',
  };
  const seasonLabel: Record<Season, string> = {
    summer: 'summer', shoulder: 'spring/autumn', winter: 'winter',
  };
  const activityLabel: Record<Activity, string> = {
    hiking: 'hiking', swimming: 'swimming', cycling: 'cycling',
    climbing: 'climbing', fishing: 'fishing', paddling: 'paddling',
  };
  const groupSuffix: Partial<Record<GroupSize, string>> = {
    family: ' — family', 'with-pet': ' — with pet', 'large-group': ' — large group',
  };

  const activityStr = activities.length > 0
    ? ` + ${activities.slice(0, 2).map((a) => activityLabel[a]).join(' & ')}`
    : '';
  const suffix = groupSuffix[groupSize] ?? '';

  if (duration === 'day') {
    return activities.length > 0
      ? `Day trip — ${activities.slice(0, 2).map((a) => activityLabel[a]).join(' & ')}${suffix}`
      : `Day trip${suffix}`;
  }

  return `${durationLabel[duration]} ${seasonLabel[season]} ${sleepLabel[sleepSetup]}${activityStr}${suffix}`;
}

export function generateItems(answers: CreatorAnswers): GeneratedItem[] {
  const { sleepSetup, eatingSetup, fuelSource, vehicleEquipment, activities, duration, groupSize, season } = answers;

  const overnight = duration !== 'day';
  const isWinter = season === 'winter';
  const isCold = season !== 'summer';
  const isLong = duration === 'medium' || duration === 'long';
  const isVeryLong = duration === 'long';

  const pplMap: Record<GroupSize, number> = {
    solo: 1, duo: 2, family: 4, 'with-pet': 2, group: 4, 'large-group': 8,
  };
  const ppl = pplMap[groupSize];
  const hasKids = groupSize === 'family';
  const hasPet = groupSize === 'with-pet';
  const socks = isVeryLong ? 7 : isLong ? 4 : 3;

  const isVehicleSleep = sleepSetup === 'car' || sleepSetup === 'van' || sleepSetup === 'car-tent';
  const vHasFridge = vehicleEquipment.includes('fridge');
  const vHasStove = vehicleEquipment.includes('stove');
  const vHasInverter = vehicleEquipment.includes('inverter');
  const vHasChairsTable = vehicleEquipment.includes('chairs-table');
  const isCooking = eatingSetup === 'cook-all' || eatingSetup === 'mix';

  const raw: Omit<GeneratedItem, 'id'>[] = [];

  // ── SHELTER & SLEEPING ───────────────────────────────────────────
  if (overnight) {
    if (sleepSetup === 'tent') {
      raw.push({ name: isWinter ? '4-season tent' : 'Tent', category: 'shelter', quantity: 1 });
      raw.push({ name: 'Tent pegs', category: 'shelter', quantity: 6 });
      raw.push({ name: isWinter ? 'Winter sleeping bag (-20°C)' : 'Sleeping bag', category: 'sleeping', quantity: ppl });
      raw.push({ name: isWinter ? 'Insulating mat' : 'Self-inflating sleeping mat', category: 'sleeping', quantity: ppl });
      if (!isWinter) raw.push({ name: 'Pillow', category: 'sleeping', quantity: ppl });
    } else if (sleepSetup === 'car') {
      raw.push({ name: 'Sleeping bag', category: 'sleeping', quantity: ppl });
      raw.push({ name: 'Blanket', category: 'sleeping', quantity: ppl });
      raw.push({ name: 'Pillow', category: 'sleeping', quantity: ppl });
      raw.push({ name: 'Window sun shades', category: 'sleeping', quantity: 1 });
    } else if (sleepSetup === 'car-tent') {
      raw.push({ name: 'Car / roof tent', category: 'shelter', quantity: 1 });
      raw.push({ name: isWinter ? 'Winter sleeping bag (-20°C)' : 'Sleeping bag', category: 'sleeping', quantity: ppl });
      raw.push({ name: 'Sleeping mat', category: 'sleeping', quantity: ppl });
    } else if (sleepSetup === 'van') {
      raw.push({ name: isWinter ? 'Winter sleeping bag' : 'Sleeping bag', category: 'sleeping', quantity: ppl });
      raw.push({ name: 'Pillow', category: 'sleeping', quantity: ppl });
      if (!isWinter) raw.push({ name: 'Lightweight blanket', category: 'sleeping', quantity: ppl });
    }
    if (isWinter && sleepSetup !== 'car') {
      raw.push({ name: 'Mat underlay', category: 'sleeping', quantity: ppl });
    }
  }

  // ── COOKING ──────────────────────────────────────────────────────
  if (isCooking) {
    if (!vHasStove) {
      const fuel = fuelSource ?? 'gas';
      if (fuel === 'gas') {
        raw.push({ name: isWinter ? 'Cold-weather gas stove' : 'Gas stove', category: 'cooking', quantity: 1 });
        raw.push({ name: isWinter ? 'Winter gas canister' : 'Gas canister', category: 'cooking', quantity: isVeryLong ? 3 : isLong ? 2 : 1 });
      } else if (fuel === 'alcohol') {
        raw.push({ name: 'Alcohol stove', category: 'cooking', quantity: 1 });
        raw.push({ name: 'Alcohol fuel bottle', category: 'cooking', quantity: isLong ? 2 : 1 });
      } else if (fuel === 'campfire') {
        raw.push({ name: 'Grill grate / tripod', category: 'cooking', quantity: 1 });
        raw.push({ name: 'Lighter', category: 'cooking', quantity: 1 });
        raw.push({ name: 'Fire starter', category: 'cooking', quantity: 1 });
      } else if (fuel === 'electric') {
        raw.push({ name: 'Portable induction cooktop', category: 'cooking', quantity: 1 });
        if (!vHasInverter) {
          raw.push({ name: 'Portable power station', category: 'tools', quantity: 1 });
        }
      }
    }

    if (eatingSetup === 'cook-all') {
      raw.push({ name: 'Pot', category: 'cooking', quantity: 1 });
      raw.push({ name: 'Pan', category: 'cooking', quantity: 1 });
      raw.push({ name: 'Mug', category: 'cooking', quantity: ppl });
      raw.push({ name: 'Plate', category: 'cooking', quantity: ppl });
      raw.push({ name: 'Cutlery', category: 'cooking', quantity: ppl });
      if (isCold) raw.push({ name: 'Thermos', category: 'cooking', quantity: ppl });
    } else {
      raw.push({ name: 'Pot', category: 'cooking', quantity: 1 });
      raw.push({ name: 'Mug', category: 'cooking', quantity: ppl });
      raw.push({ name: 'Cutlery', category: 'cooking', quantity: ppl });
      if (isCold) raw.push({ name: 'Thermos', category: 'cooking', quantity: ppl });
    }
  } else if (eatingSetup === 'cold-food') {
    if (!vHasFridge) raw.push({ name: 'Camping cooler', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Plate', category: 'cooking', quantity: ppl });
    raw.push({ name: 'Cutlery', category: 'cooking', quantity: ppl });
    raw.push({ name: 'Folding knife', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Reusable water bottle', category: 'cooking', quantity: ppl });
  } else {
    raw.push({ name: 'Reusable water bottle', category: 'cooking', quantity: ppl });
    raw.push({ name: 'Snack box', category: 'cooking', quantity: ppl });
  }

  // ── CLOTHING ─────────────────────────────────────────────────────
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
  }

  // ── TOOLS ────────────────────────────────────────────────────────
  raw.push({ name: 'Headlamp', category: 'tools', quantity: ppl });
  if (overnight) raw.push({ name: 'Pocket knife', category: 'tools', quantity: 1 });

  const usingElectric = fuelSource === 'electric';
  const needsPowerBank = (isLong || sleepSetup === 'van') && !vHasInverter && !usingElectric;
  if (needsPowerBank) {
    raw.push({ name: 'Power bank', category: 'tools', quantity: groupSize === 'large-group' ? 2 : 1 });
  }

  if (isVehicleSleep) {
    raw.push({ name: 'LED lantern', category: 'tools', quantity: 1 });
  }

  if (isWinter) {
    raw.push({ name: 'Crampons / microspikes', category: 'tools', quantity: ppl });
    raw.push({ name: 'Snow shovel', category: 'tools', quantity: 1 });
  }

  // ── VEHICLE COMFORTS (not already packed) ────────────────────────
  if (isVehicleSleep && !vHasChairsTable) {
    raw.push({ name: 'Folding table', category: 'other', quantity: 1 });
    raw.push({ name: 'Camping chairs', category: 'other', quantity: ppl });
  }

  // ── ACTIVITY GEAR ────────────────────────────────────────────────
  if (activities.includes('hiking')) {
    raw.push({ name: 'Trekking poles', category: 'tools', quantity: ppl * 2 });
    raw.push({ name: 'Map + compass', category: 'tools', quantity: 1 });
    raw.push({ name: 'Hiking boots', category: 'clothing', quantity: ppl });
    if (isWinter) raw.push({ name: 'Gaiters', category: 'clothing', quantity: ppl });
    raw.push({ name: 'Blister pads', category: 'first-aid', quantity: 1 });
  }
  if (activities.includes('swimming')) {
    raw.push({ name: 'Swimwear', category: 'clothing', quantity: ppl });
    raw.push({ name: 'Quick-dry towel', category: 'other', quantity: ppl });
    raw.push({ name: 'Water shoes', category: 'clothing', quantity: ppl });
    raw.push({ name: 'Dry bag', category: 'other', quantity: 1 });
  }
  if (activities.includes('cycling')) {
    raw.push({ name: 'Helmet', category: 'tools', quantity: ppl });
    raw.push({ name: 'Bike repair kit', category: 'tools', quantity: 1 });
    raw.push({ name: 'Bike pump', category: 'tools', quantity: 1 });
    raw.push({ name: 'Bike lights', category: 'tools', quantity: ppl });
    raw.push({ name: 'Cycling gloves', category: 'clothing', quantity: ppl });
  }
  if (activities.includes('climbing')) {
    raw.push({ name: 'Climbing harness', category: 'tools', quantity: ppl });
    raw.push({ name: 'Climbing helmet', category: 'tools', quantity: ppl });
    raw.push({ name: 'Chalk bag', category: 'tools', quantity: ppl });
    raw.push({ name: 'Climbing shoes', category: 'clothing', quantity: ppl });
  }
  if (activities.includes('fishing')) {
    raw.push({ name: 'Fishing rod', category: 'tools', quantity: 1 });
    raw.push({ name: 'Tackle box', category: 'tools', quantity: 1 });
    raw.push({ name: 'Fishing license', category: 'other', quantity: 1 });
  }
  if (activities.includes('paddling')) {
    raw.push({ name: 'Life jacket (PFD)', category: 'tools', quantity: ppl });
    raw.push({ name: 'Dry bag', category: 'other', quantity: ppl });
    raw.push({ name: 'Water shoes', category: 'clothing', quantity: ppl });
    if (isCold) raw.push({ name: 'Paddling jacket', category: 'clothing', quantity: ppl });
  }

  // ── KIDS GEAR ────────────────────────────────────────────────────
  if (hasKids) {
    raw.push({ name: "Kids' sleeping bag", category: 'sleeping', quantity: 2 });
    raw.push({ name: "Kids' rain jacket", category: 'clothing', quantity: 2 });
    raw.push({ name: "Kids' headlamp", category: 'tools', quantity: 2 });
    raw.push({ name: 'Baby wipes', category: 'other', quantity: 2 });
    if (isWinter) raw.push({ name: "Kids' thermal layer", category: 'clothing', quantity: 2 });
  }

  // ── PET GEAR ─────────────────────────────────────────────────────
  if (hasPet) {
    raw.push({ name: 'Dog leash', category: 'other', quantity: 1 });
    raw.push({ name: 'Dog food + bowl', category: 'other', quantity: 1 });
    raw.push({ name: 'Pet water bowl', category: 'other', quantity: 1 });
    raw.push({ name: 'Poo bags', category: 'other', quantity: 1 });
    raw.push({ name: 'Pet towel', category: 'other', quantity: 1 });
    raw.push({ name: 'Tick remover', category: 'first-aid', quantity: 1 });
  }

  // ── FIRST AID ────────────────────────────────────────────────────
  raw.push({ name: 'First aid kit', category: 'first-aid', quantity: 1 });
  if (!isWinter) raw.push({ name: 'Insect repellent', category: 'first-aid', quantity: 1 });
  if (season === 'summer') raw.push({ name: 'Sunscreen', category: 'first-aid', quantity: 1 });
  if (isWinter) {
    raw.push({ name: 'Emergency blanket', category: 'first-aid', quantity: ppl });
    raw.push({ name: 'Chemical hand warmers', category: 'other', quantity: ppl * 2 });
  }

  // Deduplicate by name
  const seen = new Set<string>();
  return raw
    .filter((item) => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    })
    .map((item) => ({ ...item, id: generateId() }));
}
