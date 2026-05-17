import type { GearCategory } from '../types';
import { generateId } from '../utils/id';

export type SleepSetup = 'tent' | 'car' | 'car-tent' | 'van';
export type EatingSetup =
  | 'stove'
  | 'campfire'
  | 'bbq'
  | 'cold-food'
  | 'freeze-dried'
  | 'restaurants';
export type FuelSource = 'gas' | 'alcohol' | 'electric' | 'campfire';
export type VehicleEquipment =
  | 'fridge'
  | 'stove'
  | 'inverter'
  | 'chairs-table'
  | 'lighting'
  | 'first-aid-kit'
  | 'awning'
  | 'water-tank'
  | 'cookware'
  | 'multi-tool'
  | 'navigation'
  | 'roof-box';
export type Activity =
  | 'hiking'
  | 'swimming'
  | 'cycling'
  | 'climbing'
  | 'fishing'
  | 'paddling'
  | 'trail-running'
  | 'photography'
  | 'yoga'
  | 'stargazing'
  | 'surfing';
export type Duration = 'day' | 'short' | 'medium' | 'long';
export type WeatherCondition =
  | 'cold'
  | 'cold-nights'
  | 'snow'
  | 'rain'
  | 'wind'
  | 'extreme-heat'
  | 'high-uv'
  | 'humid';

export type TentCapacity = '1' | '2' | '3' | '4';

export interface GroupComposition {
  adults: number;
  kids: number;
  pets: number;
}

export interface CreatorAnswers {
  sleepSetup: SleepSetup;
  tentCapacity?: TentCapacity;
  eatingSetup: EatingSetup[];
  fuelSource?: FuelSource;
  vehicleEquipment: VehicleEquipment[];
  activities: Activity[];
  duration: Duration;
  startDate?: string;
  endDate?: string;
  group: GroupComposition;
  weather: WeatherCondition[];
}

export interface GeneratedItem {
  id: string;
  name: string;
  category: GearCategory;
  quantity: number;
}

type RawItem = Omit<GeneratedItem, 'id'>;

// ── SHARED CONTEXT ────────────────────────────────────────────────

interface Ctx {
  sleepSetup: SleepSetup;
  fuelSource?: FuelSource;
  activities: Activity[];
  adults: number;
  kids: number;
  pets: number;
  ppl: number;
  hasKids: boolean;
  hasPet: boolean;
  nights: number;
  overnight: boolean;
  isLong: boolean;
  isLargeGroup: boolean;
  socks: number;
  hasSnow: boolean;
  isCold: boolean;
  hasColdNights: boolean;
  expectsRain: boolean;
  expectsWind: boolean;
  isHot: boolean;
  highUV: boolean;
  isVehicleSleep: boolean;
  tentsNeeded: number;
  vHasFridge: boolean;
  vHasStove: boolean;
  vHasInverter: boolean;
  vHasChairsTable: boolean;
  vHasLighting: boolean;
  vHasFirstAidKit: boolean;
  vHasCookware: boolean;
  vHasMultiTool: boolean;
  vHasNavigation: boolean;
  hasStoveCooking: boolean;
  hasCampfire: boolean;
  hasBBQ: boolean;
  hasColdFood: boolean;
  hasFreezeDried: boolean;
  hasRealCooking: boolean;
  needsHotWater: boolean;
}

function buildCtx(answers: CreatorAnswers): Ctx {
  const {
    sleepSetup,
    tentCapacity,
    eatingSetup,
    fuelSource,
    vehicleEquipment,
    activities,
    duration,
    startDate,
    endDate,
    group,
    weather,
  } = answers;

  const adults = group.adults;
  const kids = group.kids;
  const pets = group.pets;
  const ppl = adults + kids;

  const nights =
    startDate && endDate
      ? Math.max(
          0,
          Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000)
        )
      : duration === 'day'
        ? 0
        : duration === 'short'
          ? 2
          : duration === 'medium'
            ? 4
            : 8;

  const hasSnow = weather.includes('snow');
  const isCold = hasSnow || weather.includes('cold') || weather.includes('cold-nights');

  const capacityMap: Record<TentCapacity, number> = { '1': 1, '2': 2, '3': 3, '4': 4 };
  const tentCap = tentCapacity ? capacityMap[tentCapacity] : 2;
  const tentsNeeded = sleepSetup === 'tent' ? Math.ceil(adults / tentCap) : 1;

  const hasStoveCooking = eatingSetup.includes('stove');
  const hasCampfire = eatingSetup.includes('campfire');
  const hasBBQ = eatingSetup.includes('bbq');
  const hasColdFood = eatingSetup.includes('cold-food');
  const hasFreezeDried = eatingSetup.includes('freeze-dried');

  return {
    sleepSetup,
    fuelSource,
    activities,
    adults,
    kids,
    pets,
    ppl,
    hasKids: kids > 0,
    hasPet: pets > 0,
    nights,
    overnight: nights > 0,
    isLong: nights >= 3,
    isLargeGroup: ppl >= 6,
    socks: Math.min(Math.max(3, nights + 1), 10),
    hasSnow,
    isCold,
    hasColdNights: weather.includes('cold-nights'),
    expectsRain: weather.includes('rain'),
    expectsWind: weather.includes('wind'),
    isHot: weather.includes('extreme-heat'),
    highUV: weather.includes('high-uv'),
    isVehicleSleep: sleepSetup === 'car' || sleepSetup === 'van' || sleepSetup === 'car-tent',
    tentsNeeded,
    vHasFridge: vehicleEquipment.includes('fridge'),
    vHasStove: vehicleEquipment.includes('stove'),
    vHasInverter: vehicleEquipment.includes('inverter'),
    vHasChairsTable: vehicleEquipment.includes('chairs-table'),
    vHasLighting: vehicleEquipment.includes('lighting'),
    vHasFirstAidKit: vehicleEquipment.includes('first-aid-kit'),
    vHasCookware: vehicleEquipment.includes('cookware'),
    vHasMultiTool: vehicleEquipment.includes('multi-tool'),
    vHasNavigation: vehicleEquipment.includes('navigation'),
    hasStoveCooking,
    hasCampfire,
    hasBBQ,
    hasColdFood,
    hasFreezeDried,
    hasRealCooking: hasStoveCooking || hasCampfire || hasBBQ,
    needsHotWater: hasStoveCooking || hasFreezeDried,
  };
}

// ── SECTION BUILDERS ─────────────────────────────────────────────

function buildShelterItems(ctx: Ctx): RawItem[] {
  const {
    sleepSetup,
    adults,
    kids,
    hasKids,
    hasSnow,
    isCold,
    hasColdNights,
    expectsWind,
    tentsNeeded,
    overnight,
  } = ctx;
  if (!overnight) return [];
  const items: RawItem[] = [];

  if (sleepSetup === 'tent') {
    items.push({
      name: hasSnow ? '4-season tent' : 'Tent',
      category: 'shelter',
      quantity: tentsNeeded,
    });
    items.push({
      name: 'Tent pegs',
      category: 'shelter',
      quantity: (expectsWind ? 12 : 6) * tentsNeeded,
    });
    items.push({
      name: hasSnow
        ? 'Winter sleeping bag (-20°C)'
        : isCold
          ? '3-season sleeping bag'
          : 'Sleeping bag',
      category: 'sleeping',
      quantity: adults,
    });
    items.push({
      name: hasSnow ? 'Insulating mat' : 'Self-inflating sleeping mat',
      category: 'sleeping',
      quantity: adults,
    });
    if (!hasSnow) items.push({ name: 'Pillow', category: 'sleeping', quantity: adults });
  } else if (sleepSetup === 'car') {
    items.push({
      name: hasSnow ? 'Winter sleeping bag' : 'Sleeping bag',
      category: 'sleeping',
      quantity: adults,
    });
    items.push({ name: 'Blanket', category: 'sleeping', quantity: adults });
    items.push({ name: 'Pillow', category: 'sleeping', quantity: adults });
    items.push({ name: 'Window sun shades', category: 'sleeping', quantity: 1 });
  } else if (sleepSetup === 'car-tent') {
    items.push({ name: 'Car / roof tent', category: 'shelter', quantity: 1 });
    items.push({
      name: hasSnow ? 'Winter sleeping bag (-20°C)' : 'Sleeping bag',
      category: 'sleeping',
      quantity: adults,
    });
    items.push({ name: 'Sleeping mat', category: 'sleeping', quantity: adults });
  } else {
    items.push({
      name: hasSnow ? 'Winter sleeping bag' : 'Sleeping bag',
      category: 'sleeping',
      quantity: adults,
    });
    items.push({ name: 'Pillow', category: 'sleeping', quantity: adults });
    if (!hasSnow)
      items.push({ name: 'Lightweight blanket', category: 'sleeping', quantity: adults });
  }

  if (hasSnow && sleepSetup !== 'car')
    items.push({ name: 'Mat underlay', category: 'sleeping', quantity: adults });
  if (hasColdNights && !hasSnow)
    items.push({ name: 'Sleeping bag liner', category: 'sleeping', quantity: adults });
  if (hasKids) {
    items.push({
      name: hasSnow ? "Kids' winter sleeping bag" : "Kids' sleeping bag",
      category: 'sleeping',
      quantity: kids,
    });
    items.push({ name: "Kids' sleeping mat", category: 'sleeping', quantity: kids });
  }

  return items;
}

function buildCookingItems(ctx: Ctx): RawItem[] {
  const {
    adults,
    ppl,
    nights,
    isLong,
    hasSnow,
    isCold,
    isHot,
    fuelSource,
    vHasFridge,
    vHasStove,
    vHasInverter,
    vHasCookware,
    vHasMultiTool,
    hasCampfire,
    hasBBQ,
    hasColdFood,
    hasFreezeDried,
    hasRealCooking,
    hasStoveCooking,
    needsHotWater,
  } = ctx;
  const items: RawItem[] = [];

  if (needsHotWater && !vHasStove) {
    const fuel = fuelSource ?? 'gas';
    if (fuel === 'gas') {
      items.push({
        name: hasSnow ? 'Cold-weather gas stove' : 'Gas stove',
        category: 'cooking',
        quantity: 1,
      });
      items.push({
        name: hasSnow ? 'Winter gas canister' : 'Gas canister',
        category: 'cooking',
        quantity: Math.max(1, Math.ceil(nights / 2.5)),
      });
    } else if (fuel === 'alcohol') {
      items.push({ name: 'Alcohol stove', category: 'cooking', quantity: 1 });
      items.push({
        name: 'Alcohol fuel bottle',
        category: 'cooking',
        quantity: Math.max(1, Math.ceil(nights / 4)),
      });
    } else if (fuel === 'electric') {
      items.push({ name: 'Portable induction cooktop', category: 'cooking', quantity: 1 });
      if (!vHasInverter)
        items.push({ name: 'Portable power station', category: 'tools', quantity: 1 });
    }
  }

  if (hasCampfire) {
    items.push({ name: 'Grill grate / tripod', category: 'cooking', quantity: 1 });
    items.push({ name: 'Lighter', category: 'cooking', quantity: 1 });
    items.push({ name: 'Fire starter', category: 'cooking', quantity: 1 });
  }
  if (hasBBQ) {
    items.push({ name: 'Portable BBQ / grill', category: 'cooking', quantity: 1 });
    items.push({ name: 'Charcoal / briquettes', category: 'cooking', quantity: isLong ? 3 : 1 });
    if (!vHasCookware) items.push({ name: 'BBQ tongs', category: 'cooking', quantity: 1 });
    items.push({ name: 'Lighter', category: 'cooking', quantity: 1 });
  }
  if (hasColdFood) {
    if (!vHasFridge) items.push({ name: 'Camping cooler', category: 'cooking', quantity: 1 });
    if (!vHasMultiTool && !vHasCookware)
      items.push({ name: 'Folding knife', category: 'cooking', quantity: 1 });
  }

  if (hasRealCooking) {
    if (!vHasCookware) {
      items.push({ name: 'Pot', category: 'cooking', quantity: 1 });
      if (hasStoveCooking || hasBBQ) items.push({ name: 'Pan', category: 'cooking', quantity: 1 });
      items.push({ name: 'Plate', category: 'cooking', quantity: ppl });
      items.push({ name: 'Cutlery', category: 'cooking', quantity: ppl });
      items.push({ name: 'Mug', category: 'cooking', quantity: ppl });
    }
    if (isCold) items.push({ name: 'Thermos', category: 'cooking', quantity: adults });
  } else if (hasFreezeDried) {
    if (!vHasCookware) {
      items.push({ name: 'Mug / bowl', category: 'cooking', quantity: ppl });
      items.push({ name: 'Spork', category: 'cooking', quantity: ppl });
    }
  } else if (hasColdFood) {
    if (!vHasCookware) {
      items.push({ name: 'Plate', category: 'cooking', quantity: ppl });
      items.push({ name: 'Cutlery', category: 'cooking', quantity: ppl });
    }
  }

  items.push({
    name: 'Reusable water bottle',
    category: 'cooking',
    quantity: isHot ? ppl * 2 : ppl,
  });
  return items;
}

function buildClothingItems(ctx: Ctx): RawItem[] {
  const { adults, kids, ppl, hasKids, socks, hasSnow, isCold, isHot } = ctx;
  const items: RawItem[] = [];

  if (hasSnow) {
    items.push({ name: 'Down jacket', category: 'clothing', quantity: adults });
    items.push({ name: 'Ski pants', category: 'clothing', quantity: adults });
    items.push({ name: 'Gloves', category: 'clothing', quantity: adults });
    items.push({ name: 'Balaclava', category: 'clothing', quantity: adults });
    items.push({ name: 'Thermal base layer', category: 'clothing', quantity: adults });
    items.push({ name: 'Wool socks', category: 'clothing', quantity: adults * socks });
    if (hasKids) {
      items.push({ name: "Kids' down jacket", category: 'clothing', quantity: kids });
      items.push({ name: "Kids' thermal layer", category: 'clothing', quantity: kids });
      items.push({ name: "Kids' gloves", category: 'clothing', quantity: kids });
      items.push({ name: "Kids' wool socks", category: 'clothing', quantity: kids * socks });
    }
  } else {
    items.push({ name: 'Rain jacket', category: 'clothing', quantity: adults });
    if (isCold) {
      items.push({ name: 'Fleece', category: 'clothing', quantity: adults });
      items.push({ name: 'Gloves', category: 'clothing', quantity: adults });
    }
    items.push({ name: 'Socks', category: 'clothing', quantity: adults * socks });
    if (hasKids) {
      items.push({ name: "Kids' rain jacket", category: 'clothing', quantity: kids });
      items.push({ name: "Kids' socks", category: 'clothing', quantity: kids * socks });
    }
  }

  if (isHot) {
    items.push({ name: 'Sun hat', category: 'clothing', quantity: adults });
    items.push({ name: 'Cooling towel', category: 'other', quantity: ppl });
  }
  return items;
}

function buildToolsItems(ctx: Ctx): RawItem[] {
  const {
    sleepSetup,
    fuelSource,
    adults,
    ppl,
    overnight,
    isLong,
    isLargeGroup,
    hasSnow,
    expectsRain,
    expectsWind,
    isVehicleSleep,
    vHasMultiTool,
    vHasInverter,
    vHasLighting,
    vHasChairsTable,
  } = ctx;
  const items: RawItem[] = [];

  items.push({ name: 'Headlamp', category: 'tools', quantity: ppl });
  if (overnight && !vHasMultiTool)
    items.push({ name: 'Pocket knife', category: 'tools', quantity: 1 });

  const usingElectric = fuelSource === 'electric';
  if ((isLong || sleepSetup === 'van') && !vHasInverter && !usingElectric) {
    items.push({ name: 'Power bank', category: 'tools', quantity: isLargeGroup ? 2 : 1 });
  }
  if (isVehicleSleep && !vHasLighting)
    items.push({ name: 'LED lantern', category: 'tools', quantity: 1 });
  if (hasSnow) {
    items.push({ name: 'Crampons / microspikes', category: 'tools', quantity: adults });
    items.push({ name: 'Snow shovel', category: 'tools', quantity: 1 });
  }
  if (expectsWind && sleepSetup === 'tent')
    items.push({ name: 'Guy lines', category: 'tools', quantity: 1 });
  if (expectsRain) {
    items.push({ name: 'Dry bag / pack cover', category: 'other', quantity: 1 });
    items.push({ name: 'Waterproof bag liners', category: 'other', quantity: 1 });
  }
  if (isVehicleSleep && !vHasChairsTable) {
    items.push({ name: 'Folding table', category: 'other', quantity: 1 });
    items.push({ name: 'Camping chairs', category: 'other', quantity: adults });
  }

  return items;
}

function buildActivityItems(ctx: Ctx): RawItem[] {
  const { activities, adults, kids, ppl, hasKids, hasPet, pets, hasSnow, isCold, vHasNavigation } =
    ctx;
  const items: RawItem[] = [];

  if (activities.includes('hiking')) {
    items.push({ name: 'Trekking poles', category: 'tools', quantity: adults * 2 });
    if (!vHasNavigation) items.push({ name: 'Map + compass', category: 'tools', quantity: 1 });
    items.push({ name: 'Hiking boots', category: 'clothing', quantity: adults });
    if (hasSnow) items.push({ name: 'Gaiters', category: 'clothing', quantity: adults });
    items.push({ name: 'Blister pads', category: 'first-aid', quantity: 1 });
  }
  if (activities.includes('swimming')) {
    items.push({ name: 'Swimwear', category: 'clothing', quantity: ppl });
    items.push({ name: 'Quick-dry towel', category: 'other', quantity: ppl });
    items.push({ name: 'Water shoes', category: 'clothing', quantity: ppl });
    items.push({ name: 'Dry bag', category: 'other', quantity: 1 });
  }
  if (activities.includes('cycling')) {
    items.push({ name: 'Helmet', category: 'tools', quantity: ppl });
    items.push({ name: 'Bike repair kit', category: 'tools', quantity: 1 });
    items.push({ name: 'Bike pump', category: 'tools', quantity: 1 });
    items.push({ name: 'Bike lights', category: 'tools', quantity: ppl });
    items.push({ name: 'Cycling gloves', category: 'clothing', quantity: adults });
  }
  if (activities.includes('climbing')) {
    items.push({ name: 'Climbing harness', category: 'tools', quantity: adults });
    items.push({ name: 'Climbing helmet', category: 'tools', quantity: adults });
    items.push({ name: 'Chalk bag', category: 'tools', quantity: adults });
    items.push({ name: 'Climbing shoes', category: 'clothing', quantity: adults });
  }
  if (activities.includes('fishing')) {
    items.push({ name: 'Fishing rod', category: 'tools', quantity: 1 });
    items.push({ name: 'Tackle box', category: 'tools', quantity: 1 });
    items.push({ name: 'Fishing license', category: 'other', quantity: 1 });
  }
  if (activities.includes('paddling')) {
    items.push({ name: 'Life jacket (PFD)', category: 'tools', quantity: ppl });
    items.push({ name: 'Dry bag', category: 'other', quantity: ppl });
    items.push({ name: 'Water shoes', category: 'clothing', quantity: ppl });
    if (isCold) items.push({ name: 'Paddling jacket', category: 'clothing', quantity: adults });
  }
  if (activities.includes('trail-running')) {
    items.push({ name: 'Trail running shoes', category: 'clothing', quantity: adults });
    items.push({ name: 'Hydration vest', category: 'tools', quantity: adults });
    if (!hasSnow) items.push({ name: 'Running gaiters', category: 'clothing', quantity: adults });
    items.push({ name: 'Blister pads', category: 'first-aid', quantity: 1 });
  }
  if (activities.includes('photography')) {
    items.push({ name: 'Camera', category: 'tools', quantity: 1 });
    items.push({ name: 'Camera bag / case', category: 'tools', quantity: 1 });
    items.push({ name: 'Extra batteries / charger', category: 'tools', quantity: 1 });
    items.push({ name: 'Memory cards', category: 'tools', quantity: 2 });
    items.push({ name: 'Tripod', category: 'tools', quantity: 1 });
  }
  if (activities.includes('yoga'))
    items.push({ name: 'Yoga mat', category: 'other', quantity: adults });
  if (activities.includes('stargazing')) {
    items.push({ name: 'Red-light headlamp', category: 'tools', quantity: adults });
    items.push({ name: 'Star map / app', category: 'other', quantity: 1 });
    if (isCold) items.push({ name: 'Warm blanket', category: 'sleeping', quantity: adults });
  }
  if (activities.includes('surfing')) {
    items.push({ name: 'Wetsuit', category: 'clothing', quantity: adults });
    items.push({ name: 'Rashguard', category: 'clothing', quantity: adults });
    items.push({ name: 'Surf wax', category: 'other', quantity: 1 });
    items.push({ name: 'Dry bag', category: 'other', quantity: 1 });
    items.push({ name: 'Quick-dry towel', category: 'other', quantity: adults });
  }

  if (hasKids) {
    items.push({ name: "Kids' headlamp", category: 'tools', quantity: kids });
    items.push({ name: 'Baby wipes', category: 'other', quantity: 2 });
  }
  if (hasPet) {
    items.push({ name: 'Dog leash', category: 'other', quantity: pets });
    items.push({ name: 'Dog food + bowl', category: 'other', quantity: pets });
    items.push({ name: 'Pet water bowl', category: 'other', quantity: pets });
    items.push({ name: 'Poo bags', category: 'other', quantity: pets });
    items.push({ name: 'Pet towel', category: 'other', quantity: pets });
    items.push({ name: 'Tick remover', category: 'first-aid', quantity: 1 });
  }

  return items;
}

function buildFirstAidItems(ctx: Ctx): RawItem[] {
  const { ppl, overnight, hasSnow, isCold, isHot, highUV, vHasFirstAidKit } = ctx;
  const items: RawItem[] = [];

  if (!vHasFirstAidKit) items.push({ name: 'First aid kit', category: 'first-aid', quantity: 1 });
  if (!hasSnow) items.push({ name: 'Insect repellent', category: 'first-aid', quantity: 1 });
  if (isHot || highUV) items.push({ name: 'Sunscreen', category: 'first-aid', quantity: 1 });
  if (hasSnow || (isCold && overnight))
    items.push({ name: 'Emergency blanket', category: 'first-aid', quantity: ppl });
  if (hasSnow) items.push({ name: 'Chemical hand warmers', category: 'other', quantity: ppl * 2 });

  return items;
}

// ── HELPERS ───────────────────────────────────────────────────────

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

// ── PUBLIC API ────────────────────────────────────────────────────

export function generateTemplateName(answers: CreatorAnswers): string {
  const { sleepSetup, duration, weather, activities, group } = answers;

  const sleepLabel: Record<SleepSetup, string> = {
    tent: 'tent camping',
    car: 'car camping',
    'car-tent': 'car tent camping',
    van: 'van trip',
  };
  const durationLabel: Record<Duration, string> = {
    day: 'Day trip',
    short: '1–2 night',
    medium: '3–5 night',
    long: 'Week-long',
  };
  const activityLabel: Record<Activity, string> = {
    hiking: 'hiking',
    swimming: 'swimming',
    cycling: 'cycling',
    climbing: 'climbing',
    fishing: 'fishing',
    paddling: 'paddling',
    'trail-running': 'trail running',
    photography: 'photography',
    yoga: 'yoga',
    stargazing: 'stargazing',
    surfing: 'surfing',
  };

  const weatherLabel = weather.includes('snow')
    ? 'winter'
    : weather.includes('cold')
      ? 'cold-weather'
      : weather.includes('extreme-heat')
        ? 'summer heat'
        : weather.includes('rain')
          ? 'rainy'
          : 'fair-weather';

  const activityStr =
    activities.length > 0
      ? ` + ${activities
          .slice(0, 2)
          .map((a) => activityLabel[a])
          .join(' & ')}`
      : '';
  const groupStr = formatGroupStr(group);
  const groupSuffix = groupStr !== 'solo' ? ` (${groupStr})` : '';

  if (duration === 'day') {
    return activities.length > 0
      ? `Day trip — ${activities
          .slice(0, 2)
          .map((a) => activityLabel[a])
          .join(' & ')}${groupSuffix}`
      : `Day trip${groupSuffix}`;
  }

  return `${durationLabel[duration]} ${weatherLabel} ${sleepLabel[sleepSetup]}${activityStr}${groupSuffix}`;
}

export function generateItems(answers: CreatorAnswers): GeneratedItem[] {
  const ctx = buildCtx(answers);

  const raw = [
    ...buildShelterItems(ctx),
    ...buildCookingItems(ctx),
    ...buildClothingItems(ctx),
    ...buildToolsItems(ctx),
    ...buildActivityItems(ctx),
    ...buildFirstAidItems(ctx),
  ];

  const seen = new Set<string>();
  return raw
    .filter((item) => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    })
    .map((item) => ({ ...item, id: generateId() }));
}
