import { describe, it, expect } from 'vitest';
import { generateItems } from './templateGenerator';
import type { CreatorAnswers } from './templateGenerator';

function base(overrides: Partial<CreatorAnswers> = {}): CreatorAnswers {
  return {
    sleepSetup: 'tent',
    eatingSetup: ['stove'],
    fuelSource: 'gas',
    vehicleEquipment: [],
    activities: [],
    duration: 'short',
    group: { adults: 2, kids: 0, pets: 0 },
    weather: [],
    ...overrides,
  };
}

function findByName(items: ReturnType<typeof generateItems>, name: string) {
  return items.find((i) => i.name === name);
}

describe('generateItems – tent count', () => {
  it('2 adults in a 2-person tent → 1 tent', () => {
    const items = generateItems(base({ tentCapacity: '2' }));
    expect(findByName(items, 'Tent')?.quantity).toBe(1);
  });

  it('3 adults in a 2-person tent → 2 tents', () => {
    const items = generateItems(
      base({ tentCapacity: '2', group: { adults: 3, kids: 0, pets: 0 } })
    );
    expect(findByName(items, 'Tent')?.quantity).toBe(2);
  });

  it('4 adults in a 4-person tent → 1 tent', () => {
    const items = generateItems(
      base({ tentCapacity: '4', group: { adults: 4, kids: 0, pets: 0 } })
    );
    expect(findByName(items, 'Tent')?.quantity).toBe(1);
  });

  it('5 adults in a 4-person tent → 2 tents', () => {
    const items = generateItems(
      base({ tentCapacity: '4', group: { adults: 5, kids: 0, pets: 0 } })
    );
    expect(findByName(items, 'Tent')?.quantity).toBe(2);
  });
});

describe('generateItems – tent pegs scale with tent count and wind', () => {
  it('1 tent, no wind → 6 pegs', () => {
    const items = generateItems(base({ tentCapacity: '2' }));
    expect(findByName(items, 'Tent pegs')?.quantity).toBe(6);
  });

  it('1 tent, wind → 12 pegs', () => {
    const items = generateItems(base({ tentCapacity: '2', weather: ['wind'] }));
    expect(findByName(items, 'Tent pegs')?.quantity).toBe(12);
  });

  it('2 tents, no wind → 12 pegs', () => {
    const items = generateItems(
      base({ tentCapacity: '1', group: { adults: 2, kids: 0, pets: 0 } })
    );
    expect(findByName(items, 'Tent pegs')?.quantity).toBe(12);
  });

  it('2 tents, wind → 24 pegs', () => {
    const items = generateItems(
      base({ tentCapacity: '1', group: { adults: 2, kids: 0, pets: 0 }, weather: ['wind'] })
    );
    expect(findByName(items, 'Tent pegs')?.quantity).toBe(24);
  });
});

describe('generateItems – winter gear', () => {
  it('snow → 4-season tent, not regular tent', () => {
    const items = generateItems(base({ weather: ['snow'] }));
    expect(findByName(items, '4-season tent')).toBeDefined();
    expect(findByName(items, 'Tent')).toBeUndefined();
  });

  it('snow → winter sleeping bag', () => {
    const items = generateItems(base({ weather: ['snow'] }));
    expect(findByName(items, 'Winter sleeping bag (-20°C)')).toBeDefined();
    expect(findByName(items, 'Sleeping bag')).toBeUndefined();
  });

  it('cold (not snow) → 3-season sleeping bag', () => {
    const items = generateItems(base({ weather: ['cold'] }));
    expect(findByName(items, '3-season sleeping bag')).toBeDefined();
  });
});

describe('generateItems – day trip excludes shelter/sleeping', () => {
  it('duration=day → no tent', () => {
    const items = generateItems(base({ duration: 'day' }));
    expect(findByName(items, 'Tent')).toBeUndefined();
    expect(findByName(items, '4-season tent')).toBeUndefined();
  });

  it('duration=day → no sleeping bag', () => {
    const items = generateItems(base({ duration: 'day' }));
    expect(findByName(items, 'Sleeping bag')).toBeUndefined();
  });
});

describe('generateItems – deduplication', () => {
  it('campfire + BBQ both need Lighter → only one Lighter in output', () => {
    const items = generateItems(base({ eatingSetup: ['campfire', 'bbq'] }));
    const lighters = items.filter((i) => i.name === 'Lighter');
    expect(lighters).toHaveLength(1);
  });

  it('every item has a unique id', () => {
    const items = generateItems(
      base({ activities: ['hiking', 'swimming', 'cycling'], weather: ['snow', 'wind'] })
    );
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
