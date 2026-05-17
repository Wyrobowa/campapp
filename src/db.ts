import Dexie, { type EntityTable } from 'dexie';
import { TripArraySchema, TemplateArraySchema } from './schemas';
import type { Trip, Template } from './schemas';

class CampDb extends Dexie {
  trips!: EntityTable<Trip, 'id'>;
  templates!: EntityTable<Template, 'id'>;

  constructor() {
    super('CampApp');
    this.version(1).stores({
      trips: 'id, date, createdAt',
      templates: 'id',
    });
  }
}

export const db = new CampDb();

export async function migrateFromLocalStorage(): Promise<void> {
  const tripsRaw = localStorage.getItem('camp-trips');
  if (tripsRaw) {
    try {
      const result = TripArraySchema.safeParse(JSON.parse(tripsRaw) as unknown);
      if (result.success && result.data.length > 0) {
        await db.trips.bulkPut(result.data);
      }
    } finally {
      localStorage.removeItem('camp-trips');
    }
  }

  const templatesRaw = localStorage.getItem('camp-templates');
  if (templatesRaw) {
    try {
      const result = TemplateArraySchema.safeParse(JSON.parse(templatesRaw) as unknown);
      if (result.success && result.data.length > 0) {
        await db.templates.bulkPut(result.data);
      }
    } finally {
      localStorage.removeItem('camp-templates');
    }
  }
}
