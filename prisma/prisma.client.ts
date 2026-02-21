import { Prisma, PrismaClient } from "generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type PgPrismaOptions = Prisma.Subset<
  {
    adapter: PrismaPg;
    errorFormat?: Prisma.ErrorFormat;
    log?: Prisma.LogDefinition[];
  },
  Prisma.PrismaClientOptions
>;

export function createPrismaOptions(options?: {
  databaseUrl?: string;
  logging?: boolean;
}): PgPrismaOptions {
  const logging = options?.logging ?? false;

  return {
    adapter: new PrismaPg({
      connectionString: options?.databaseUrl ?? process.env.DATABASE_URL,
    }),
    log: logging ? [{ level: "query", emit: "event" }] : [],
  };
}

export function createPrismaClient(options?: { databaseUrl?: string; logging?: boolean }) {
  return new PrismaClient(createPrismaOptions(options));
}
