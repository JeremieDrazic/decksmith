import { faker } from '@faker-js/faker';

import { prisma } from '../src/client.js';

// ---------------------------------------------------------------------------
// Deterministic IDs — easy to copy-paste for curl testing
// ---------------------------------------------------------------------------

// WARNING: these User rows have no corresponding auth.users entry in Supabase.
// The seed creates orphaned profiles intentionally for local DB exploration.
// Auth routes (register/login) will not work for these users.
// To fix: create Supabase auth users with these IDs via the Supabase dashboard
// or supabase.auth.admin.createUser() before running this seed.
const ALICE_ID = '00000000-0000-4000-8000-000000000001';
const BOB_ID = '00000000-0000-4000-8000-000000000002';

// ---------------------------------------------------------------------------
// Reproducible randomness — same fake data on every run
// ---------------------------------------------------------------------------

faker.seed(42);

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

async function main() {
  const alice = await prisma.user.upsert({
    where: { id: ALICE_ID },
    update: {},
    create: {
      id: ALICE_ID,
      email: faker.internet.email({ firstName: 'alice' }),
      username: 'alice',
      displayName: faker.person.fullName({ firstName: 'Alice' }),
      avatarUrl: faker.image.avatar(),
    },
  });

  await prisma.userPreferences.upsert({
    where: { userId: ALICE_ID },
    update: {},
    create: {
      userId: ALICE_ID,
      language: 'fr',
      theme: 'dark',
      defaultCurrency: 'eur',
      // collectionViewConfig fields must match CollectionViewConfigSchema
      collectionViewConfig: { sortBy: 'name', sortDirection: 'asc', viewMode: 'grid' },
      // notificationPreferences fields must match NotificationPreferencesSchema
      notificationPreferences: { emailOnPdfReady: true },
    },
  });

  const bob = await prisma.user.upsert({
    where: { id: BOB_ID },
    update: {},
    create: {
      id: BOB_ID,
      email: faker.internet.email({ firstName: 'bob' }),
      username: 'bob',
      displayName: faker.person.fullName({ firstName: 'Bob' }),
      avatarUrl: faker.image.avatar(),
    },
  });

  await prisma.userPreferences.upsert({
    where: { userId: BOB_ID },
    update: {},
    create: {
      userId: BOB_ID,
      language: 'en',
      theme: 'system',
      defaultCurrency: 'usd',
      units: 'inches',
    },
  });

  console.log(`Seeded ${String([alice, bob].length)} users`);
}

try {
  await main();
} catch (error: unknown) {
  console.error('Seed failed:', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
