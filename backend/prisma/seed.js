const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo data...');

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@novatrace.io' },
    update: {},
    create: {
      email: 'admin@novatrace.io',
      username: 'admin',
      displayName: 'Admin User',
      passwordHash: adminPassword,
      role: 'admin',
      plan: 'enterprise',
    },
  });

  // Create Workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'admin-workspace' },
    update: {},
    create: {
      name: "Admin's Workspace",
      slug: 'admin-workspace',
      ownerId: admin.id,
      members: {
        create: { userId: admin.id, role: 'owner' }
      }
    },
  });

  // Create URLs
  const urls = [
    { title: 'Google', slug: 'google', originalUrl: 'https://google.com' },
    { title: 'NovaTrace GitHub', slug: 'nt-repo', originalUrl: 'https://github.com/novatrace' },
    { title: 'Product Launch', slug: 'launch-2026', originalUrl: 'https://novatrace.io/launch' },
  ];

  for (const u of urls) {
    const url = await prisma.shortenedUrl.upsert({
      where: { slug: u.slug },
      update: {},
      create: {
        ...u,
        userId: admin.id,
        workspaceId: workspace.id,
      },
    });

    // Create some fake clicks
    await prisma.click.createMany({
      data: Array.from({ length: 10 }).map(() => ({
        urlId: url.id,
        device: ['mobile', 'desktop', 'tablet'][Math.floor(Math.random() * 3)],
        country: 'United States',
        clickedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      })),
    });
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
