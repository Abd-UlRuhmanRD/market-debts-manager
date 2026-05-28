import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const rows = await prisma.debtPerson.findMany({ take: 1 });
  console.log('OK debtPerson rows:', rows.length);
  process.exitCode = 0;
} catch (error) {
  console.error('FAIL', error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}

