import { Controller } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern({ cmd: 'getMessages' })
  getUsers(): string {
    return this.chatService.getMessages();
  }
}
