import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";

import { DeleteOrLeaveRoomResponse, Room } from "./room.interface";

import { PrismaService } from "@infrastructure/database/services/prisma.service";

import MESSAGES from "@helpers/messages/http-messages";
import { prismaCatchNotFound } from "@helpers/prisma/catch-not-found";

@Injectable()
export class RoomService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getUserRooms(userId: string): Promise<Room[]> {
    const cachedRooms = await this.cacheManager.get<Room[]>("rooms-" + userId);
    if (cachedRooms) return cachedRooms;

    const rooms = await this.prismaService.room.findMany({
      where: {
        OR: [
          {
            creatorId: userId,
          },
          {
            members: {
              some: {
                userId,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
      },
    });

    await this.cacheManager.set("rooms-" + userId, rooms);
    return rooms;
  }

  async getUnreadUserRooms(userId: string): Promise<Room> {
    return {
      id: "1",
      name: "Room 1",
    };
  }

  async createRoom(data: { name: string; userId: string }): Promise<Room> {
    const room = await this.prismaService.room.create({
      data: {
        name: data.name,
        creatorId: data.userId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    await this.cacheManager.set("room-" + room.id, room);

    return {
      id: room.id,
      name: room.name,
    };
  }

  async updateRoom(data: { roomId: string; name: string }): Promise<Room> {
    const room = await this.prismaService.room.update({
      where: {
        id: data.roomId,
      },
      data: {
        name: data.name,
      },
      select: {
        id: true,
        name: true,
      },
    });

    await this.cacheManager.set("room-" + room.id, room);

    return {
      id: room.id,
      name: room.name,
    };
  }

  async deleteRoom(roomId: string): Promise<DeleteOrLeaveRoomResponse> {
    await this.prismaService.room.delete({
      where: {
        id: roomId,
      },
    });

    await this.cacheManager.del("room-" + roomId);

    return {
      success: true,
      message: MESSAGES.ROOM_DELETED,
    };
  }

  async leaveRoom(data: { roomId: string; userId: string }): Promise<DeleteOrLeaveRoomResponse> {
    const room = await this.prismaService.room
      .findUniqueOrThrow({
        where: {
          id: data.roomId,
        },
        select: {
          creatorId: true,
          members: {
            select: {
              userId: true,
            },
            take: 1,
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })
      .catch(prismaCatchNotFound(MESSAGES.ROOM_NOT_FOUND));

    if (room.creatorId === data.userId) {
      if (room.members.length > 0) {
        await this.prismaService.room.update({
          where: {
            id: data.roomId,
          },
          data: {
            creatorId: room.members[0].userId,
          },
        });
      } else {
        return await this.deleteRoom(data.roomId);
      }
    } else {
      await this.prismaService.userRoom.delete({
        where: {
          userId_roomId: {
            userId: data.userId,
            roomId: data.roomId,
          },
        },
      });
    }

    await this.cacheManager.del("room-" + data.roomId);

    return {
      success: true,
      message: MESSAGES.ROOM_LEAVE_SUCCESS,
    };
  }
}
