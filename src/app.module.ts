import { Module } from "@nestjs/common";

import { ConfigurationModule } from "@infrastructure/configuration/configuration.module";

import { ChatModule } from "@modules/chat/chat.module";
import { RoomModule } from "@modules/room/room.module";

@Module({
  imports: [ConfigurationModule, ChatModule, RoomModule],
  providers: [],
})
export class AppModule {}
