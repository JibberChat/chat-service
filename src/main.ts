import { ConfigService } from "@nestjs/config";
import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";

import { AppModule } from "./app.module";

import { ConfigurationService } from "@infrastructure/configuration/services/configuration.service";
import { PrismaService } from "@infrastructure/database/services/prisma.service";
import { GlobalExceptionFilter } from "@infrastructure/filter/global-exception.filter";
import { LoggerInterceptor } from "@infrastructure/logger/logger.interceptor";
import { LoggerService } from "@infrastructure/logger/services/logger.service";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: "localhost",
      port: new ConfigurationService(new ConfigService()).appConfig.port,
    },
  });
  const configService = app.get(ConfigurationService);
  const loggerService = app.get(LoggerService);

  // Prisma
  const dbService: PrismaService = app.get(PrismaService);
  dbService.enableShutdownHooks(app);

  // Logger
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter, loggerService));
  app.useGlobalInterceptors(new LoggerInterceptor());

  await app.listen();
  loggerService.info("Microservice is running on port: " + configService.appConfig.port, "Bootstrap");
}
bootstrap();
