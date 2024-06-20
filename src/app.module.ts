import { redisStore } from "cache-manager-redis-store";
import type { RedisClientOptions } from "redis";

import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";

import { ConfigurationModule } from "@infrastructure/configuration/configuration.module";
import { ConfigurationService } from "@infrastructure/configuration/services/configuration.service";

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

    ConfigurationModule,
    ChatModule,
    RoomModule,
  ],
  providers: [],
})
export class AppModule {}
