import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  getMessages(): string {
    return 'Hello World!, Messages';
  }
}
