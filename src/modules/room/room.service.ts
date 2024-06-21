import { Injectable } from "@nestjs/common";

import { DeleteOrLeaveRoomResponse, Room } from "./room.interface";

@Injectable()
export class RoomService {
  async getUserRooms(userId: string): Promise<Room> {
    return {
      id: "1",
      name: "Room 1",
      messages: [
        {
          id: "1",
          text: "Hello World!",
          user: {
            name: "User 1",
          },
        },
      ],
    };
  }

  async getUnreadUserRooms(userId: string): Promise<Room> {
    return {
      id: "1",
      name: "Room 1",
      messages: [
        {
          id: "1",
          text: "Hello World!",
          user: {
            name: "User 1",
          },
        },
      ],
    };
  }

  async createRoom(data: { name: string; userId: string }): Promise<Room> {
    return {
      id: "1",
      name: data.name,
      messages: [],
    };
  }

  async updateRoom(data: { roomId: string; name: string }): Promise<Room> {
    return {
      id: data.roomId,
      name: data.name,
      messages: [],
    };
  }

  async deleteRoom(roomId: string): Promise<DeleteOrLeaveRoomResponse> {
    return {
      success: true,
      message: "Room deleted successfully",
    };
  }

  async leaveRoom(data: { roomId: string; userId: string }): Promise<DeleteOrLeaveRoomResponse> {
    return {
      success: true,
      message: "Room deleted successfully",
    };
  }
}
