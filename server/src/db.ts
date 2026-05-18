import Datastore from '@seald-io/nedb';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DB_PATH ?? path.join(__dirname, '../../data');

fs.mkdirSync(dbPath, { recursive: true });

export const usersDb = new Datastore({
  filename: path.join(dbPath, 'users.db'),
  autoload: true,
});
usersDb.ensureIndex({ fieldName: 'username', unique: true });

// Single unified store for both spaces (_type:'space') and bookings (_type:'booking').
// Name uniqueness for spaces is enforced at the application level in routes/spaces.ts.
// autoload is disabled — seedSpacesIfEmpty() explicitly loads the DB so it can drop any
// persisted legacy indexes before they interfere with subsequent operations.
const unifiedDb = new Datastore({
  filename: path.join(dbPath, 'spaces.db'),
});

export const spacesDb  = unifiedDb;
export const bookingsDb = unifiedDb;

export const appEventsDb = new Datastore({
  filename: path.join(dbPath, 'app_event.db'),
  autoload: true,
});

export function recordEvent(eventType: string, payload?: Record<string, unknown>): void {
  appEventsDb.insertAsync({ eventType, payload: payload ?? null, createdAt: new Date() }).catch(err => {
    console.error('Failed to record app event:', err);
  });
}

// unavailable format: { "YYYY-MM-DD": number[] }
// Keys are ISO date strings; values are arrays of blocked hours (0–23, integers).
// Example: { "2026-05-20": [9, 10, 14, 15] }
const SEED_SPACES = [
  {
    name: 'Black Box Theatre',
    types: ['Performance Hall'],
    capacity: 120,
    locationEn: 'Mapo-gu, Seoul',
    locationKo: '서울 마포구',
    hourlyRate: 80000,
    emoji: '🎭',
    thumbColor: '#E6FAF9',
    contactEmail: 'blackbox@artspace.kr',
    contactPhone: '02-1234-5678',
    unavailable: {
      '2026-05-20': [10, 11, 14, 15, 16],
      '2026-05-22': [9, 10, 11, 12, 13, 14],
      '2026-05-28': [14, 15, 16, 17, 18],
    },
  },
  {
    name: 'Gallery White',
    types: ['Gallery'],
    capacity: 80,
    locationEn: 'Haeundae-gu, Busan',
    locationKo: '부산 해운대구',
    hourlyRate: 60000,
    emoji: '🖼️',
    thumbColor: '#F0EBFF',
    contactEmail: 'gallery@artspace.kr',
    contactPhone: '051-2345-6789',
    unavailable: {
      '2026-05-19': [13, 14, 15, 16, 17],
      '2026-05-26': [10, 11, 12, 13, 14, 15, 16],
    },
  },
  {
    name: 'Studio A — Hongdae',
    types: ['Rehearsal', 'Studio'],
    capacity: 30,
    locationEn: 'Mapo-gu, Seoul',
    locationKo: '서울 마포구',
    hourlyRate: 25000,
    emoji: '🎵',
    thumbColor: '#FFF4E6',
    contactEmail: 'studioa@artspace.kr',
    contactPhone: '02-3456-7890',
    unavailable: {
      '2026-05-17': [14, 15, 16, 17],
      '2026-05-18': [9, 10, 11],
      '2026-05-21': [10, 11, 12, 13, 14],
    },
  },
  {
    name: 'Dance Studio B',
    types: ['Rehearsal', 'Dance'],
    capacity: 50,
    locationEn: 'Jung-gu, Daegu',
    locationKo: '대구 중구',
    hourlyRate: 30000,
    emoji: '💃',
    thumbColor: '#FFF0F5',
    contactEmail: 'dance@artspace.kr',
    contactPhone: '053-4567-8901',
    unavailable: {
      '2026-05-18': [10, 11, 12, 13, 14, 15],
      '2026-05-23': [9, 10, 11],
    },
  },
  {
    name: 'Grand Hall',
    types: ['Performance Hall'],
    capacity: 500,
    locationEn: 'Yeonsu-gu, Incheon',
    locationKo: '인천 연수구',
    hourlyRate: 200000,
    emoji: '🏛️',
    thumbColor: '#E6FAF9',
    contactEmail: 'grandhall@artspace.kr',
    contactPhone: '032-5678-9012',
    unavailable: {
      '2026-05-24': [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
      '2026-06-01': [10, 11, 12, 13, 14, 15, 16, 17, 18],
    },
  },
  {
    name: 'Open Studio Gwangju',
    types: ['Workshop', 'Studio'],
    capacity: 40,
    locationEn: 'Dong-gu, Gwangju',
    locationKo: '광주 동구',
    hourlyRate: 35000,
    emoji: '🎨',
    thumbColor: '#F0EBFF',
    contactEmail: 'openstudio@artspace.kr',
    contactPhone: '062-6789-0123',
    unavailable: {
      '2026-05-20': [9, 10, 11, 12],
      '2026-05-27': [13, 14, 15, 16, 17, 18],
    },
  },
  {
    name: 'Rooftop Stage Seoul',
    types: ['Performance Hall'],
    capacity: 200,
    locationEn: 'Yongsan-gu, Seoul',
    locationKo: '서울 용산구',
    hourlyRate: 120000,
    emoji: '🎤',
    thumbColor: '#FFF4E6',
    contactEmail: 'rooftop@artspace.kr',
    contactPhone: '02-7890-1234',
    unavailable: {
      '2026-05-22': [18, 19, 20, 21],
      '2026-05-29': [19, 20, 21, 22],
    },
  },
  {
    name: 'Hannam Exhibition Hall',
    types: ['Gallery', 'Workshop'],
    capacity: 150,
    locationEn: 'Yongsan-gu, Seoul',
    locationKo: '서울 용산구',
    hourlyRate: 70000,
    emoji: '🖼️',
    thumbColor: '#FFF0F5',
    contactEmail: 'hannam@artspace.kr',
    contactPhone: '02-8901-2345',
    unavailable: {
      '2026-05-21': [10, 11, 12, 13, 14, 15, 16, 17],
      '2026-06-03': [9, 10, 11, 12],
    },
  },
];

export async function seedSpacesIfEmpty(): Promise<void> {
  // Explicit load (autoload is off) so we can drop any persisted legacy indexes
  // before any other operation touches the in-memory index state.
  await spacesDb.loadDatabaseAsync();

  // Remove the old persisted 'name' unique index if it was written by a previous version.
  // Booking docs have no 'name' field and would violate a non-sparse unique index on it.
  await spacesDb.removeIndexAsync('name').catch(() => {});

  // Tag existing space docs that predate the _type discriminator
  await spacesDb.updateAsync(
    { _type: { $exists: false }, spaceId: { $exists: false } },
    { $set: { _type: 'space' } },
    { multi: true }
  );

  // Seed if no spaces exist yet
  const count = await spacesDb.countAsync({ _type: 'space' });
  if (count === 0) {
    await spacesDb.insertAsync(
      SEED_SPACES.map(s => ({ ...s, _type: 'space', createdAt: new Date() }))
    );
    console.log('Seeded 8 spaces into database');
  }

  // Migrate existing spaces missing newer fields
  await spacesDb.updateAsync(
    { _type: 'space', unavailable: { $exists: false } },
    { $set: { unavailable: {} } },
    { multi: true }
  );
  await spacesDb.updateAsync(
    { _type: 'space', contactEmail: { $exists: false } },
    { $set: { contactEmail: '', contactPhone: '' } },
    { multi: true }
  );
  await spacesDb.updateAsync(
    { _type: 'space', description: { $exists: false } },
    { $set: { description: '' } },
    { multi: true }
  );

  // One-time migration: move bookings.db into spaces.db
  const bookingsFilePath = path.join(dbPath, 'bookings.db');
  if (fs.existsSync(bookingsFilePath)) {
    try {
      const oldDb = new Datastore({ filename: bookingsFilePath, autoload: true });
      const oldBookings = await oldDb.findAsync({});
      if (oldBookings.length > 0) {
        let migrated = 0;
        for (const b of oldBookings as Record<string, unknown>[]) {
          const exists = await spacesDb.findOneAsync({ _id: b._id as string });
          if (!exists) {
            await spacesDb.insertAsync({ ...b, _type: 'booking' });
            migrated++;
          }
        }
        if (migrated > 0) console.log(`Migrated ${migrated} bookings from bookings.db`);
      }
      fs.renameSync(bookingsFilePath, bookingsFilePath + '.migrated');
    } catch (err) {
      console.error('Failed to migrate bookings.db:', err);
    }
  }

  await spacesDb.compactDatafileAsync();
}
