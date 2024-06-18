import { Injectable } from "@nestjs/common";

import { Message } from "./chat.interface";

@Injectable()
export class ChatService {
  async getRoomMessages(roomId: string): Promise<Message[]> {
    return [
      {
        id: "1",
        message: "Hello World",
        userId: "1",
      },
    ];
  }

  // createMessage(data: { message: string; userId: string }): string {
  //   return `Message: ${data.message}, User: ${data.userId}`;
  // }

  async sendMessageToRoom(data: { roomId: string; message: string }): Promise<string> {
    return `Message: ${data.message}, Room: ${data.roomId}`;
  }
}
