import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "generated/prisma/client";
import { LogDefinition } from "generated/prisma/internal/prismaNamespace";
import { EnvConfig } from "src/common/dtos/env-config.dto";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger("Prisma");
  private readonly isLoggingEnabled: boolean;
  private readonly isProduction: boolean;

  constructor(env: ConfigService<EnvConfig>) {
    const isLoggingEnabled = env.get<boolean>("PRISMA_LOGGING");

    const isProduction = ["production", "staging"].includes(env.get("NODE_ENV"));
    const connectionString = env.get<string>("DATABASE_URL");

    let logDefinition: LogDefinition[] = [];

    if (isLoggingEnabled && !isProduction) {
      logDefinition = [
        { level: "query", emit: "event" },
        { level: "info", emit: "event" },
        { level: "warn", emit: "event" },
        { level: "error", emit: "event" },
      ];
    }

    super({
      adapter: new PrismaPg({ connectionString }),
      log: logDefinition,
      transactionOptions: {
        timeout: 30_000,
      },
    });

    this.isLoggingEnabled = isLoggingEnabled;
    this.isProduction = isProduction;
  }

  async onModuleInit() {
    if (this.isLoggingEnabled && !this.isProduction) {
      this.$on("info", (e) => {
        this.logger.debug(e.message);
      });

      this.$on("query", (e) => {
        let logMessage = `Query (${e.duration.toFixed(2)}ms)\n${e.query}\nparams: ${e.params}`;

        if (e.duration > 300) {
          logMessage = `🐢 Slow Query (${e.duration.toFixed(2)}ms)\n\x1b[33m${e.query}\x1b[0m`;
        }

        console.log("");
        this.logger.debug(logMessage);
        console.log("");
      });
    }

    await this.$connect();
    this.logger.debug("Prisma connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
