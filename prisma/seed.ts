import { createHash } from "crypto";
import { PrismaClient } from "generated/prisma/client";
import { createPrismaOptions } from "./prisma.client";
import { seeders } from "./seeders";

export type SeederFunc = (prisma: PrismaClient) => Promise<void>;

const prisma = new PrismaClient(createPrismaOptions({ logging: true }));

async function runSeeder(seeder: SeederFunc) {
  const checksum = createHash("md5").update(seeder.toString()).digest("hex");

  const exists = await prisma.seeder.findUnique({
    where: { file_name: seeder.name },
  });

  if (exists) {
    console.info(`⏭️  Seeder ${seeder.name} skipped`);
    return;
  }

  console.info(`▶️  Running ${seeder.name}`);
  await seeder(prisma);

  await prisma.seeder.create({
    data: {
      file_name: seeder.name,
      checksum,
    },
  });

  console.info(`✅ Seeder ${seeder.name} done`);
}

async function main() {
  for (const seeder of seeders) {
    await runSeeder(seeder);
  }

  await prisma.$disconnect();
}

main();
