import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL!;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🌱 Seeding database...');

  // Create default contest
  const contest = await prisma.contest.upsert({
    where: { id: 'c1' },
    update: {},
    create: {
      id: 'c1',
      title: 'Unity Summit & Awards 2026',
      description: 'Celebrating the voices, bridge-builders, and future leaders shaping our diverse community.',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      status: 'active',
      bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=2000',
    },
  });

  // Create categories
  const categories = [
    {
      id: 'cat1',
      name: 'Brobyggerprisen 2026',
      description: 'For de som bygger broer mellom mennesker og kulturer',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=2000',
      icon: '🌉',
      displayOrder: 1,
      contestId: 'c1',
    },
    {
      id: 'cat2',
      name: 'Inkluderingsprisen 2026',
      description: 'For de som skaper rom for alle',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&q=80&w=2000',
      icon: '🤝',
      displayOrder: 2,
      contestId: 'c1',
    },
    {
      id: 'cat3',
      name: 'Fremtidens stemme 2026',
      description: 'For unge som former morgendagens samfunn',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=2000',
      icon: '🎙️',
      displayOrder: 3,
      contestId: 'c1',
    },
    {
      id: 'cat4',
      name: 'Kommunikasjonskraft 2026',
      description: 'For de som formidler med kraft og klarhet',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=2000',
      icon: '💬',
      displayOrder: 4,
      contestId: 'c1',
    },
    {
      id: 'cat5',
      name: 'Gjennomslagskraft 2026',
      description: 'For de som får ting til å skje',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=2000',
      icon: '⚡',
      displayOrder: 5,
      contestId: 'c1',
    },
  ];

  for (const categoryData of categories) {
    await prisma.category.upsert({
      where: { id: categoryData.id },
      update: {},
      create: categoryData,
    });
  }

  console.log('✅ Seeding completed!');
  console.log(`\n🏆 Contest Created: ${contest.title}`);
  console.log(`\n📋 ${categories.length} Award Categories Created:`);
  categories.forEach((cat) => {
    console.log(`   ${cat.icon} ${cat.name}`);
  });
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
