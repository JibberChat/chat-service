import { Controller } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";

import { CreateRoomDto } from "./dtos/create-room.dto";
import { DeleteRoomDto } from "./dtos/delete-room.dto";
import { GetUnreadUserRoomsDto } from "./dtos/get-unread-user-rooms.dto";
import { GetUserRoomsDto } from "./dtos/get-user-rooms.dto";
import { InviteUserRoomDto } from "./dtos/invite-user-room.dto";
import { LeaveRoomDto } from "./dtos/leave-room.dto";
import { UpdateRoomDto } from "./dtos/update-room.dto";
import { DeleteOrLeaveRoomResponse, Room } from "./interfaces/room.interface";
import { RoomService } from "./room.service";

@Controller()
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @MessagePattern({ cmd: "getUserRooms" })
  async getUserRooms(data: GetUserRoomsDto): Promise<Room[]> {
    return await this.roomService.getUserRooms(data.userId);
  }

  @MessagePattern({ cmd: "getUnreadUserRooms" })
  async getUnreadUserRooms(data: GetUnreadUserRoomsDto): Promise<Room[]> {
    return await this.roomService.getUnreadUserRooms(data.userId);
  }

  @MessagePattern({ cmd: "inviteUserToRoom" })
  async inviteUserToRoom(data: InviteUserRoomDto): Promise<{ success: boolean }> {
    return await this.roomService.inviteUserToRoom(data);
  }

  @MessagePattern({ cmd: "createRoom" })
  async createRoom(data: CreateRoomDto): Promise<Room> {
    return await this.roomService.createRoom(data);
  }

  @MessagePattern({ cmd: "updateRoom" })
  async updateRoom(data: UpdateRoomDto): Promise<Room> {
    return await this.roomService.updateRoom(data);
  }

  @MessagePattern({ cmd: "deleteRoom" })
  async deleteRoom(data: DeleteRoomDto): Promise<DeleteOrLeaveRoomResponse> {
    return await this.roomService.deleteRoom(data);
  }

  @MessagePattern({ cmd: "leaveRoom" })
  async leaveRoom(data: LeaveRoomDto): Promise<DeleteOrLeaveRoomResponse> {
    return await this.roomService.leaveRoom(data);
  }
}
