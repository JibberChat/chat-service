import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";

import { ChatService } from "./chat.service";

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern({ cmd: "getMessages" })
  getUsers(): string {
    return this.chatService.getMessages();
  }

  @MessagePattern({ cmd: "sendMessageToRoom" })
  async sendMessageToRoom(data: { roomId: string; message: string }): Promise<string> {
    return await this.chatService.sendMessageToRoom(data);
  }
}
