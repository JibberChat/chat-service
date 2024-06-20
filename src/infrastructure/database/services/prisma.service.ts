import { PrismaClient } from "@prisma/client";

import { INestApplication, INestMicroservice, Injectable, OnModuleDestroy, OnModuleInit, Scope } from "@nestjs/common";

import { LoggerService } from "@infrastructure/logger/services/logger.service";

@Injectable({ scope: Scope.DEFAULT })
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new LoggerService();

  async onModuleInit() {
    try {
      this.logger.log("Connecting to the database", this.constructor.name);
      await this.$connect();
    } catch (error) {
      this.logger.error("Error connecting to the database", String(error), this.constructor.name);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async enableShutdownHooks(app: INestMicroservice) {
    process.on("beforeExit", async () => {
      this.logger.log("Disconnecting from the database", this.constructor.name);
      await app.close();
    });
  }
}
