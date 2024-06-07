import { Module } from '@nestjs/common';
import { ConfigurationModule } from '@infrastructure/configuration/configuration.module';
import { ChatModule } from '@modules/chat.module';

@Module({
  imports: [ConfigurationModule, ChatModule],
  providers: [],
})
export class AppModule {}
