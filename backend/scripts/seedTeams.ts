/**
 * Seeds sample Teams into MongoDB.
 * Uses the same Team mongoose model as the production backend.
 *
 * Usage (from /backend):
 *   npm run db:seed:teams
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import Team from '../src/models/mongo/Team';

const MONGODB_URI = process.env.MONGODB_URI;

async function seedTeams() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is missing from backend/.env — cannot seed Teams.');
    process.exit(1);
  }

  console.log('🍃 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  console.log('✅ Connected to MongoDB');

  // Wipe existing sample teams
  await Team.deleteMany({});
  console.log('🧹 Cleared existing teams');

  const now = new Date();

  const teams = await Team.insertMany([
    {
      name: 'Platform Engineering',
      description: 'Core microservices, developer tools, and API gateways.',
      ownerId: '00000000-0000-0000-0000-000000000001',
      projectIds: [],
      members: [
        {
          userId: '00000000-0000-0000-0000-000000000001',
          name: 'Alex Vance',
          email: 'alex.vance@acme-labs.io',
          role: 'owner',
          joinedAt: now,
        },
        {
          userId: '00000000-0000-0000-0000-000000000002',
          name: 'Marcus Chen',
          email: 'marcus.chen@acme-labs.io',
          role: 'admin',
          joinedAt: now,
        },
      ],
    },
    {
      name: 'Cloud Infrastructure',
      description: 'Kubernetes, multi-region deployments, and observability pipelines.',
      ownerId: '00000000-0000-0000-0000-000000000002',
      projectIds: [],
      members: [
        {
          userId: '00000000-0000-0000-0000-000000000002',
          name: 'Marcus Chen',
          email: 'marcus.chen@acme-labs.io',
          role: 'owner',
          joinedAt: now,
        },
        {
          userId: '00000000-0000-0000-0000-000000000003',
          name: 'Elena Rostova',
          email: 'elena.rostova@acme-labs.io',
          role: 'member',
          joinedAt: now,
        },
      ],
    },
    {
      name: 'Frontend Guild',
      description: 'Next.js applications, design systems, and performance budgets.',
      ownerId: '00000000-0000-0000-0000-000000000003',
      projectIds: [],
      members: [
        {
          userId: '00000000-0000-0000-0000-000000000003',
          name: 'Elena Rostova',
          email: 'elena.rostova@acme-labs.io',
          role: 'owner',
          joinedAt: now,
        },
      ],
    },
  ]);

  console.log(`✅ Seeded ${teams.length} teams into MongoDB`);
  await mongoose.disconnect();
  console.log('\n🎉 MongoDB team seed complete!');
  process.exit(0);
}

seedTeams().catch((err) => {
  console.error('❌ MongoDB team seed failed:', err);
  process.exit(1);
});
