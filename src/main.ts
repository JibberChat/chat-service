import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

import { LoggerInterceptor } from '@infrastructure/logger/logger.interceptor';
import { LoggerService } from '@infrastructure/logger/services/logger.service';
import { ConfigurationService } from '@infrastructure/configuration/services/configuration.service';
import { GlobalExceptionFilter } from '@helpers/filter/global-exception.filter';

async function bootstrap() {
  const loggerService = new LoggerService();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: 'localhost',
        port: new ConfigurationService(new ConfigService()).appConfig.port,
      },
    },
  );
  const config = app.get(ConfigurationService);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new GlobalExceptionFilter(httpAdapter, loggerService));
  app.useGlobalInterceptors(new LoggerInterceptor());

  await app.listen();
  console.log('Microservice is running on port: ' + config.appConfig.port);
}
bootstrap();
