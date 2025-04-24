import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const doc = await prisma.document.findFirst();
  console.log(doc?.metadata); // 👈 ça doit exister !
}

main();
