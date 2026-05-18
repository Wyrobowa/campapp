import { describe, it, expect } from 'vitest';
import { generateTemplateName } from './templateGenerator';
import type { CreatorAnswers } from './templateGenerator';

function base(overrides: Partial<CreatorAnswers> = {}): CreatorAnswers {
  return {
    sleepSetup: 'tent',
    eatingSetup: ['stove'],
    vehicleEquipment: [],
    activities: [],
    duration: 'short',
    group: { adults: 1, kids: 0, pets: 0 },
    weather: [],
    ...overrides,
  };
}

describe('generateTemplateName – day trip', () => {
  it('solo day trip with no activities', () => {
    expect(generateTemplateName(base({ duration: 'day' }))).toBe('Day trip');
  });

  it('solo day trip with one activity', () => {
    expect(generateTemplateName(base({ duration: 'day', activities: ['hiking'] }))).toBe(
      'Day trip — hiking'
    );
  });

  it('day trip with two activities uses both', () => {
    expect(
      generateTemplateName(base({ duration: 'day', activities: ['hiking', 'swimming'] }))
    ).toBe('Day trip — hiking & swimming');
  });

  it('day trip with more than two activities uses only first two', () => {
    const name = generateTemplateName(
      base({ duration: 'day', activities: ['hiking', 'swimming', 'cycling'] })
    );
    expect(name).toBe('Day trip — hiking & swimming');
  });

  it('day trip with 2 adults appends group suffix', () => {
    expect(
      generateTemplateName(base({ duration: 'day', group: { adults: 2, kids: 0, pets: 0 } }))
    ).toBe('Day trip (2 adults)');
  });

  it('day trip with kids includes kids count', () => {
    expect(
      generateTemplateName(base({ duration: 'day', group: { adults: 2, kids: 1, pets: 0 } }))
    ).toBe('Day trip (2 adults, 1 kid)');
  });
});

describe('generateTemplateName – overnight trips', () => {
  it('short fair-weather tent camping, solo', () => {
    expect(generateTemplateName(base({ duration: 'short' }))).toBe(
      '1–2 night fair-weather tent camping'
    );
  });

  it('medium cold-weather car camping', () => {
    expect(
      generateTemplateName(base({ sleepSetup: 'car', duration: 'medium', weather: ['cold'] }))
    ).toBe('3–5 night cold-weather car camping');
  });

  it('long winter van trip', () => {
    expect(
      generateTemplateName(base({ sleepSetup: 'van', duration: 'long', weather: ['snow'] }))
    ).toBe('Week-long winter van trip');
  });

  it('rainy car-tent camping', () => {
    expect(generateTemplateName(base({ sleepSetup: 'car-tent', weather: ['rain'] }))).toBe(
      '1–2 night rainy car tent camping'
    );
  });

  it('summer heat short trip', () => {
    expect(generateTemplateName(base({ weather: ['extreme-heat'] }))).toBe(
      '1–2 night summer heat tent camping'
    );
  });

  it('appends activity to overnight trip', () => {
    expect(generateTemplateName(base({ activities: ['fishing'] }))).toBe(
      '1–2 night fair-weather tent camping + fishing'
    );
  });

  it('group suffix added for multiple adults', () => {
    expect(generateTemplateName(base({ group: { adults: 3, kids: 0, pets: 0 } }))).toContain(
      '(3 adults)'
    );
  });

  it('solo trips have no group suffix', () => {
    expect(generateTemplateName(base({ group: { adults: 1, kids: 0, pets: 0 } }))).not.toContain(
      '('
    );
  });

  it('pet adds dog to group description', () => {
    expect(generateTemplateName(base({ group: { adults: 1, kids: 0, pets: 1 } }))).toContain(
      '+ dog'
    );
  });
});
