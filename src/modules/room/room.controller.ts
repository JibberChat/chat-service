import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";

import { DeleteOrLeaveRoomResponse, Room } from "./room.interface";
import { RoomService } from "./room.service";

@Controller()
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @MessagePattern({ cmd: "getUserRooms" })
  async getUserRooms(userId: string): Promise<Room[]> {
    return await this.roomService.getUserRooms(userId);
  }

  @MessagePattern({ cmd: "getUnreadUserRooms" })
  async getUnreadUserRooms(userId: string): Promise<Room> {
    return await this.roomService.getUnreadUserRooms(userId);
  }

  @MessagePattern({ cmd: "createRoom" })
  async createRoom(data: { name: string; userId: string }): Promise<Room> {
    return await this.roomService.createRoom(data);
  }

  @MessagePattern({ cmd: "updateRoom" })
  async updateRoom(data: { roomId: string; name: string }): Promise<Room> {
    return await this.roomService.updateRoom(data);
  }

  @MessagePattern({ cmd: "deleteRoom" })
  async deleteRoom(roomId: string): Promise<DeleteOrLeaveRoomResponse> {
    return await this.roomService.deleteRoom(roomId);
  }

  @MessagePattern({ cmd: "leaveRoom" })
  async leaveRoom(data: { roomId: string; userId: string }): Promise<DeleteOrLeaveRoomResponse> {
    return await this.roomService.leaveRoom(data);
  }
}
