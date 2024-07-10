import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";

import { ChatService } from "./chat.service";
import { GetMessagesDto } from "./dtos/get-messages.dto";
import { SendMessageDto } from "./dtos/send-message.dto";
import { Message } from "./interfaces/chat.interface";

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern({ cmd: "getRoomMessages" })
  async getRoomMessages(data: GetMessagesDto): Promise<Message[]> {
    return await this.chatService.getRoomMessages(data.roomId);
  }

  @MessagePattern({ cmd: "sendMessageToRoom" })
  async sendMessageToRoom(data: SendMessageDto): Promise<Message> {
    return await this.chatService.sendMessageToRoom(data);
  }
}
