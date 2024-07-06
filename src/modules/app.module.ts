import { redisStore } from "cache-manager-redis-store";
import type { RedisClientOptions } from "redis";

import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { ConfigurationModule } from "@infrastructure/configuration/configuration.module";
import { NOTIF_SERVICE } from "@infrastructure/configuration/model/notif-service.configuration";
import { USER_SERVICE } from "@infrastructure/configuration/model/user-service.configuration";
import { ConfigurationService } from "@infrastructure/configuration/services/configuration.service";
import { DatabaseModule } from "@infrastructure/database/database.module";
import { LoggerModule } from "@infrastructure/logger/logger.module";

import { ChatModule } from "@modules/chat/chat.module";
import { RoomModule } from "@modules/room/room.module";

@Module({
  imports: [
    ChatModule,
    RoomModule,

    DatabaseModule,
    ConfigurationModule,
    LoggerModule,
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigurationModule],
      useFactory: async (configService: ConfigurationService) => {
        const redisConfig = configService.redisConfig;
        return {
          store: await redisStore({
            socket: {
              host: redisConfig.host,
              port: redisConfig.port,
            },
            // password: redisConfig.password,
            ttl: 30 * 60 * 1000, // milliseconds = 30 minutes
          }),
        };
      },
      inject: [ConfigurationService],
    }),
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: USER_SERVICE,
          useFactory: async (configService: ConfigurationService) => {
            const userServiceOptions = configService.userServiceConfig;
            return {
              transport: Transport.TCP,
              options: {
                host: userServiceOptions.host,
                port: userServiceOptions.port,
              },
            };
          },
          inject: [ConfigurationService],
        },
      ],
    }),
    ClientsModule.registerAsync({
      isGlobal: true,
      clients: [
        {
          name: NOTIF_SERVICE,
          useFactory: async (configService: ConfigurationService) => {
            const notifServiceOptions = configService.notifServiceConfig;
            return {
              transport: Transport.MQTT,
              options: {
                url: "amqp://" + notifServiceOptions.host + ":" + notifServiceOptions.port,
                queue: notifServiceOptions.queue,
              },
            };
          },
          inject: [ConfigurationService],
        },
      ],
    }),
  ],
  providers: [],
})
export class AppModule {}
