import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log('Attempting to connect to database...');
  console.log('URL:', process.env.DATABASE_URL);

  try {
    await prisma.$connect();
    console.log('Successfully connected!');
    const count = await prisma.user.count(); // Try a query
    console.log('User count:', count);
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
