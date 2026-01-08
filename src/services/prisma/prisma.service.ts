import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "generated/prisma/client";
import { EnvConfig } from "src/common/dtos/env-config.dto";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger("Prisma");
  private readonly isLoggingEnabled: boolean;

  constructor(private readonly env: ConfigService<EnvConfig>) {
    const isLoggingEnabled = env.get<string>("PRISMA_LOGGING") === "true";

    super({
      adapter: new PrismaPg({
        connectionString: env.get<string>("DATABASE_URL"),
      }),
      log: isLoggingEnabled ? [{ level: "query", emit: "event" }] : [],
    });

    this.isLoggingEnabled = isLoggingEnabled;
  }

  async onModuleInit() {
    this.logger.log("PrismaService initialized. Logging enabled: " + this.isLoggingEnabled);

    if (this.isLoggingEnabled) {
      this.$on("query", (e) => {
        let logMessage = `Query (${e.duration.toFixed(2)}ms)\n${e.query}\nparams: ${e.params}`;

        if (e.duration > 300) {
          logMessage = `🐢 Slow Query (${e.duration.toFixed(2)}ms)\n\x1b[33m${e.query}\x1b[0m`;
        }

        this.logger.debug(logMessage);
        this.logger.log("");
      });
    }

    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
