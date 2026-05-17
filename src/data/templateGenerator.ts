import type { GearCategory } from '../types';
import { generateId } from '../utils/id';

export type SleepSetup = 'tent' | 'car' | 'car-tent' | 'van';
export type EatingSetup = 'stove' | 'campfire' | 'bbq' | 'cold-food' | 'freeze-dried' | 'restaurants';
export type FuelSource = 'gas' | 'alcohol' | 'electric' | 'campfire';
export type VehicleEquipment = 'fridge' | 'stove' | 'inverter' | 'chairs-table' | 'lighting' | 'first-aid-kit' | 'awning' | 'water-tank';
export type Activity = 'hiking' | 'swimming' | 'cycling' | 'climbing' | 'fishing' | 'paddling' | 'trail-running' | 'photography' | 'yoga' | 'stargazing' | 'surfing';
export type Duration = 'day' | 'short' | 'medium' | 'long';
export type Season = 'summer' | 'shoulder' | 'winter';

export interface GroupComposition {
  adults: number;
  kids: number;
  pets: number;
}

export interface CreatorAnswers {
  sleepSetup: SleepSetup;
  eatingSetup: EatingSetup[];
  fuelSource?: FuelSource;
  vehicleEquipment: VehicleEquipment[];
  activities: Activity[];
  duration: Duration;
  startDate?: string;
  endDate?: string;
  group: GroupComposition;
  season: Season;
}

export interface GeneratedItem {
  id: string;
  name: string;
  category: GearCategory;
  quantity: number;
}

function formatGroupStr(group: GroupComposition): string {
  const parts: string[] = [];
  if (group.adults === 1) parts.push('solo');
  else parts.push(`${group.adults} adults`);
  if (group.kids === 1) parts.push('1 kid');
  else if (group.kids > 1) parts.push(`${group.kids} kids`);
  if (group.pets === 1) parts.push('+ dog');
  else if (group.pets > 1) parts.push(`+ ${group.pets} pets`);
  return parts.join(', ');
}

export function generateTemplateName(answers: CreatorAnswers): string {
  const { sleepSetup, duration, season, activities, group } = answers;

  const sleepLabel: Record<SleepSetup, string> = {
    tent: 'tent camping', car: 'car camping', 'car-tent': 'car tent camping', van: 'van trip',
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
    'trail-running': 'trail running', photography: 'photography',
    yoga: 'yoga', stargazing: 'stargazing', surfing: 'surfing',
  };

  const activityStr = activities.length > 0
    ? ` + ${activities.slice(0, 2).map((a) => activityLabel[a]).join(' & ')}`
    : '';
  const groupStr = formatGroupStr(group);
  const groupSuffix = groupStr !== 'solo' ? ` (${groupStr})` : '';

  if (duration === 'day') {
    return activities.length > 0
      ? `Day trip — ${activities.slice(0, 2).map((a) => activityLabel[a]).join(' & ')}${groupSuffix}`
      : `Day trip${groupSuffix}`;
  }

  return `${durationLabel[duration]} ${seasonLabel[season]} ${sleepLabel[sleepSetup]}${activityStr}${groupSuffix}`;
}

export function generateItems(answers: CreatorAnswers): GeneratedItem[] {
  const { sleepSetup, eatingSetup, fuelSource, vehicleEquipment, activities, duration, startDate, endDate, group, season } = answers;

  const adults = group.adults;
  const kids = group.kids;
  const pets = group.pets;
  const ppl = adults + kids;
  const hasKids = kids > 0;
  const hasPet = pets > 0;

  const nights =
    startDate && endDate
      ? Math.max(0, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
      : duration === 'day' ? 0 : duration === 'short' ? 2 : duration === 'medium' ? 4 : 8;

  const overnight = nights > 0;
  const isWinter = season === 'winter';
  const isCold = season !== 'summer';
  const isLong = nights >= 3;
  const isLargeGroup = ppl >= 6;
  const socks = Math.min(Math.max(3, nights + 1), 10);

  const isVehicleSleep = sleepSetup === 'car' || sleepSetup === 'van' || sleepSetup === 'car-tent';
  const vHasFridge = vehicleEquipment.includes('fridge');
  const vHasStove = vehicleEquipment.includes('stove');
  const vHasInverter = vehicleEquipment.includes('inverter');
  const vHasChairsTable = vehicleEquipment.includes('chairs-table');
  const vHasLighting = vehicleEquipment.includes('lighting');
  const vHasFirstAidKit = vehicleEquipment.includes('first-aid-kit');

  const eating = eatingSetup;
  const hasStoveCooking = eating.includes('stove');
  const hasCampfire = eating.includes('campfire');
  const hasBBQ = eating.includes('bbq');
  const hasColdFood = eating.includes('cold-food');
  const hasFreezeDried = eating.includes('freeze-dried');
  const hasRealCooking = hasStoveCooking || hasCampfire || hasBBQ;
  const needsHotWater = hasStoveCooking || hasFreezeDried;

  const raw: Omit<GeneratedItem, 'id'>[] = [];

  // ── SHELTER & SLEEPING ───────────────────────────────────────────
  if (overnight) {
    if (sleepSetup === 'tent') {
      raw.push({ name: isWinter ? '4-season tent' : 'Tent', category: 'shelter', quantity: 1 });
      raw.push({ name: 'Tent pegs', category: 'shelter', quantity: 6 });
      raw.push({ name: isWinter ? 'Winter sleeping bag (-20°C)' : 'Sleeping bag', category: 'sleeping', quantity: adults });
      raw.push({ name: isWinter ? 'Insulating mat' : 'Self-inflating sleeping mat', category: 'sleeping', quantity: adults });
      if (!isWinter) raw.push({ name: 'Pillow', category: 'sleeping', quantity: adults });
    } else if (sleepSetup === 'car') {
      raw.push({ name: 'Sleeping bag', category: 'sleeping', quantity: adults });
      raw.push({ name: 'Blanket', category: 'sleeping', quantity: adults });
      raw.push({ name: 'Pillow', category: 'sleeping', quantity: adults });
      raw.push({ name: 'Window sun shades', category: 'sleeping', quantity: 1 });
    } else if (sleepSetup === 'car-tent') {
      raw.push({ name: 'Car / roof tent', category: 'shelter', quantity: 1 });
      raw.push({ name: isWinter ? 'Winter sleeping bag (-20°C)' : 'Sleeping bag', category: 'sleeping', quantity: adults });
      raw.push({ name: 'Sleeping mat', category: 'sleeping', quantity: adults });
    } else if (sleepSetup === 'van') {
      raw.push({ name: isWinter ? 'Winter sleeping bag' : 'Sleeping bag', category: 'sleeping', quantity: adults });
      raw.push({ name: 'Pillow', category: 'sleeping', quantity: adults });
      if (!isWinter) raw.push({ name: 'Lightweight blanket', category: 'sleeping', quantity: adults });
    }
    if (isWinter && sleepSetup !== 'car') {
      raw.push({ name: 'Mat underlay', category: 'sleeping', quantity: adults });
    }
    if (hasKids) {
      raw.push({ name: isWinter ? "Kids' winter sleeping bag" : "Kids' sleeping bag", category: 'sleeping', quantity: kids });
      raw.push({ name: "Kids' sleeping mat", category: 'sleeping', quantity: kids });
    }
  }

  // ── COOKING ──────────────────────────────────────────────────────

  // STOVE / FUEL (for camp stove cooking or freeze-dried)
  if (needsHotWater && !vHasStove) {
    const fuel = fuelSource ?? 'gas';
    if (fuel === 'gas') {
      raw.push({ name: isWinter ? 'Cold-weather gas stove' : 'Gas stove', category: 'cooking', quantity: 1 });
      raw.push({ name: isWinter ? 'Winter gas canister' : 'Gas canister', category: 'cooking', quantity: Math.max(1, Math.ceil(nights / 2.5)) });
    } else if (fuel === 'alcohol') {
      raw.push({ name: 'Alcohol stove', category: 'cooking', quantity: 1 });
      raw.push({ name: 'Alcohol fuel bottle', category: 'cooking', quantity: Math.max(1, Math.ceil(nights / 4)) });
    } else if (fuel === 'electric') {
      raw.push({ name: 'Portable induction cooktop', category: 'cooking', quantity: 1 });
      if (!vHasInverter) raw.push({ name: 'Portable power station', category: 'tools', quantity: 1 });
    }
  }

  // CAMPFIRE GEAR
  if (hasCampfire) {
    raw.push({ name: 'Grill grate / tripod', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Lighter', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Fire starter', category: 'cooking', quantity: 1 });
  }

  // BBQ GEAR
  if (hasBBQ) {
    raw.push({ name: 'Portable BBQ / grill', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Charcoal / briquettes', category: 'cooking', quantity: isLong ? 3 : 1 });
    raw.push({ name: 'BBQ tongs', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Lighter', category: 'cooking', quantity: 1 }); // deduped if also campfire
  }

  // COLD FOOD EXTRAS
  if (hasColdFood) {
    if (!vHasFridge) raw.push({ name: 'Camping cooler', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Folding knife', category: 'cooking', quantity: 1 });
  }

  // COOKING VESSELS & UTENSILS
  if (hasRealCooking) {
    raw.push({ name: 'Pot', category: 'cooking', quantity: 1 });
    if (hasStoveCooking || hasBBQ) raw.push({ name: 'Pan', category: 'cooking', quantity: 1 });
    raw.push({ name: 'Plate', category: 'cooking', quantity: ppl });
    raw.push({ name: 'Cutlery', category: 'cooking', quantity: ppl });
    raw.push({ name: 'Mug', category: 'cooking', quantity: ppl });
    if (isCold) raw.push({ name: 'Thermos', category: 'cooking', quantity: adults });
  } else if (hasFreezeDried) {
    raw.push({ name: 'Mug / bowl', category: 'cooking', quantity: ppl });
    raw.push({ name: 'Spork', category: 'cooking', quantity: ppl });
  } else if (hasColdFood) {
    raw.push({ name: 'Plate', category: 'cooking', quantity: ppl });
    raw.push({ name: 'Cutlery', category: 'cooking', quantity: ppl });
  }

  // WATER BOTTLE (always)
  raw.push({ name: 'Reusable water bottle', category: 'cooking', quantity: ppl });

  // ── CLOTHING ─────────────────────────────────────────────────────
  if (isWinter) {
    raw.push({ name: 'Down jacket', category: 'clothing', quantity: adults });
    raw.push({ name: 'Ski pants', category: 'clothing', quantity: adults });
    raw.push({ name: 'Gloves', category: 'clothing', quantity: adults });
    raw.push({ name: 'Balaclava', category: 'clothing', quantity: adults });
    raw.push({ name: 'Thermal base layer', category: 'clothing', quantity: adults });
    raw.push({ name: 'Wool socks', category: 'clothing', quantity: adults * socks });
    if (hasKids) {
      raw.push({ name: "Kids' down jacket", category: 'clothing', quantity: kids });
      raw.push({ name: "Kids' thermal layer", category: 'clothing', quantity: kids });
      raw.push({ name: "Kids' gloves", category: 'clothing', quantity: kids });
      raw.push({ name: "Kids' wool socks", category: 'clothing', quantity: kids * socks });
    }
  } else {
    raw.push({ name: 'Rain jacket', category: 'clothing', quantity: adults });
    if (isCold) raw.push({ name: 'Fleece', category: 'clothing', quantity: adults });
    raw.push({ name: 'Socks', category: 'clothing', quantity: adults * socks });
    if (hasKids) {
      raw.push({ name: "Kids' rain jacket", category: 'clothing', quantity: kids });
      raw.push({ name: "Kids' socks", category: 'clothing', quantity: kids * socks });
    }
  }

  // ── TOOLS ────────────────────────────────────────────────────────
  raw.push({ name: 'Headlamp', category: 'tools', quantity: ppl });
  if (overnight) raw.push({ name: 'Pocket knife', category: 'tools', quantity: 1 });

  const usingElectric = fuelSource === 'electric';
  if ((isLong || sleepSetup === 'van') && !vHasInverter && !usingElectric) {
    raw.push({ name: 'Power bank', category: 'tools', quantity: isLargeGroup ? 2 : 1 });
  }
  if (isVehicleSleep && !vHasLighting) raw.push({ name: 'LED lantern', category: 'tools', quantity: 1 });
  if (isWinter) {
    raw.push({ name: 'Crampons / microspikes', category: 'tools', quantity: adults });
    raw.push({ name: 'Snow shovel', category: 'tools', quantity: 1 });
  }

  // ── VEHICLE COMFORTS ─────────────────────────────────────────────
  if (isVehicleSleep && !vHasChairsTable) {
    raw.push({ name: 'Folding table', category: 'other', quantity: 1 });
    raw.push({ name: 'Camping chairs', category: 'other', quantity: adults });
  }

  // ── ACTIVITY GEAR ────────────────────────────────────────────────
  if (activities.includes('hiking')) {
    raw.push({ name: 'Trekking poles', category: 'tools', quantity: adults * 2 });
    raw.push({ name: 'Map + compass', category: 'tools', quantity: 1 });
    raw.push({ name: 'Hiking boots', category: 'clothing', quantity: adults });
    if (isWinter) raw.push({ name: 'Gaiters', category: 'clothing', quantity: adults });
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
    raw.push({ name: 'Cycling gloves', category: 'clothing', quantity: adults });
  }
  if (activities.includes('climbing')) {
    raw.push({ name: 'Climbing harness', category: 'tools', quantity: adults });
    raw.push({ name: 'Climbing helmet', category: 'tools', quantity: adults });
    raw.push({ name: 'Chalk bag', category: 'tools', quantity: adults });
    raw.push({ name: 'Climbing shoes', category: 'clothing', quantity: adults });
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
    if (isCold) raw.push({ name: 'Paddling jacket', category: 'clothing', quantity: adults });
  }
  if (activities.includes('trail-running')) {
    raw.push({ name: 'Trail running shoes', category: 'clothing', quantity: adults });
    raw.push({ name: 'Hydration vest', category: 'tools', quantity: adults });
    if (!isWinter) raw.push({ name: 'Running gaiters', category: 'clothing', quantity: adults });
    raw.push({ name: 'Blister pads', category: 'first-aid', quantity: 1 });
  }
  if (activities.includes('photography')) {
    raw.push({ name: 'Camera', category: 'tools', quantity: 1 });
    raw.push({ name: 'Camera bag / case', category: 'tools', quantity: 1 });
    raw.push({ name: 'Extra batteries / charger', category: 'tools', quantity: 1 });
    raw.push({ name: 'Memory cards', category: 'tools', quantity: 2 });
    raw.push({ name: 'Tripod', category: 'tools', quantity: 1 });
  }
  if (activities.includes('yoga')) {
    raw.push({ name: 'Yoga mat', category: 'other', quantity: adults });
  }
  if (activities.includes('stargazing')) {
    raw.push({ name: 'Red-light headlamp', category: 'tools', quantity: adults });
    raw.push({ name: 'Star map / app', category: 'other', quantity: 1 });
    if (isCold) raw.push({ name: 'Warm blanket', category: 'sleeping', quantity: adults });
  }
  if (activities.includes('surfing')) {
    raw.push({ name: 'Wetsuit', category: 'clothing', quantity: adults });
    raw.push({ name: 'Rashguard', category: 'clothing', quantity: adults });
    raw.push({ name: 'Surf wax', category: 'other', quantity: 1 });
    raw.push({ name: 'Dry bag', category: 'other', quantity: 1 });
    raw.push({ name: 'Quick-dry towel', category: 'other', quantity: adults });
  }

  // ── KIDS EXTRAS ──────────────────────────────────────────────────
  if (hasKids) {
    raw.push({ name: "Kids' headlamp", category: 'tools', quantity: kids });
    raw.push({ name: 'Baby wipes', category: 'other', quantity: 2 });
  }

  // ── PET GEAR ─────────────────────────────────────────────────────
  if (hasPet) {
    raw.push({ name: 'Dog leash', category: 'other', quantity: pets });
    raw.push({ name: 'Dog food + bowl', category: 'other', quantity: pets });
    raw.push({ name: 'Pet water bowl', category: 'other', quantity: pets });
    raw.push({ name: 'Poo bags', category: 'other', quantity: pets });
    raw.push({ name: 'Pet towel', category: 'other', quantity: pets });
    raw.push({ name: 'Tick remover', category: 'first-aid', quantity: 1 });
  }

  // ── FIRST AID ────────────────────────────────────────────────────
  if (!vHasFirstAidKit) raw.push({ name: 'First aid kit', category: 'first-aid', quantity: 1 });
  if (!isWinter) raw.push({ name: 'Insect repellent', category: 'first-aid', quantity: 1 });
  if (season === 'summer') raw.push({ name: 'Sunscreen', category: 'first-aid', quantity: 1 });
  if (isWinter) {
    raw.push({ name: 'Emergency blanket', category: 'first-aid', quantity: ppl });
    raw.push({ name: 'Chemical hand warmers', category: 'other', quantity: ppl * 2 });
  }

  const seen = new Set<string>();
  return raw
    .filter((item) => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    })
    .map((item) => ({ ...item, id: generateId() }));
}
