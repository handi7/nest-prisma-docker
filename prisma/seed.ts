import { PrismaPg } from "@prisma/adapter-pg";
import { createHash } from "crypto";
import "dotenv/config";
import { PrismaClient } from "generated/prisma/client";

import { seeders } from "./seeders";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

export type Seeder = (prisma: PrismaClient) => Promise<void>;

async function runSeeder(seeder: Seeder) {
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
