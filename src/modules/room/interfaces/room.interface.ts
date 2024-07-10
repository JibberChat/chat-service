// import { Message } from "@modules/chat/chat.interface";

export interface Room {
  id: string;
  name: string;
  // messages: Message[]; // last 10 messages
}

export interface DeleteOrLeaveRoomResponse {
  success: boolean;
  message: string;
}
