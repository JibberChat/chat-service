import { Injectable } from "@nestjs/common";

@Injectable()
export class ChatService {
  getMessages(): string {
    return "Hello World!, Messages";
  }

  // createMessage(data: { message: string; userId: string }): string {
  //   return `Message: ${data.message}, User: ${data.userId}`;
  // }

  async sendMessageToRoom(data: { roomId: string; message: string }): Promise<string> {
    return `Message: ${data.message}, Room: ${data.roomId}`;
  }
}
