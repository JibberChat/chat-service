import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";

import { Message } from "./chat.interface";
import { ChatService } from "./chat.service";

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern({ cmd: "getRoomMessages" })
  async getRoomMessages(data: { roomId: string }): Promise<Message[]> {
    return await this.chatService.getRoomMessages(data.roomId);
  }

  @MessagePattern({ cmd: "sendMessageToRoom" })
  async sendMessageToRoom(data: { roomId: string; message: string; userId: string }): Promise<Message> {
    return await this.chatService.sendMessageToRoom(data);
  }
}
