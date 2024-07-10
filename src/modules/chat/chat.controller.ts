import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";

import { Message } from "./chat.interface";
import { ChatService } from "./chat.service";
import { SendMessageDto } from "./dtos/send-message.dto";

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern({ cmd: "getRoomMessages" })
  async getRoomMessages(data: { roomId: string }): Promise<Message[]> {
    return await this.chatService.getRoomMessages(data.roomId);
  }

  @MessagePattern({ cmd: "sendMessageToRoom" })
  async sendMessageToRoom(data: SendMessageDto): Promise<Message> {
    return await this.chatService.sendMessageToRoom(data);
  }
}
