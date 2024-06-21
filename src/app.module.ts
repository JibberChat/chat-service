import { redisStore } from "cache-manager-redis-store";
import type { RedisClientOptions } from "redis";

import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ClientProxyFactory, ClientsModule, Transport } from "@nestjs/microservices";

import { ConfigurationModule } from "@infrastructure/configuration/configuration.module";
import { USER_SERVICE } from "@infrastructure/configuration/model/user-service.configuration";
import { ConfigurationService } from "@infrastructure/configuration/services/configuration.service";
import { DatabaseModule } from "@infrastructure/database/database.module";

import { ChatModule } from "@modules/chat/chat.module";
import { RoomModule } from "@modules/room/room.module";

@Module({
  imports: [
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

    DatabaseModule,
    ConfigurationModule,
    ChatModule,
    RoomModule,
  ],
  providers: [],
})
export class AppModule {}
