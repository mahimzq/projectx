import { PrismaClient } from '@prisma/client';

console.log('DATABASE_URL from env:', process.env.DATABASE_URL);

const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.count();
  const tasks = await prisma.task.count();
  console.log(`Users: ${users}, Tasks: ${tasks}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
