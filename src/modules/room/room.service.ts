import { firstValueFrom, timeout } from "rxjs";

import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

import { DeleteOrLeaveRoomResponse, Room } from "./room.interface";

import { USER_SERVICE } from "@infrastructure/configuration/model/user-service.configuration";
import { PrismaService } from "@infrastructure/database/services/prisma.service";

import MESSAGES from "@helpers/messages/http-messages";
import { prismaCatchNotFound } from "@helpers/prisma/catch-not-found";

@Injectable()
export class RoomService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(USER_SERVICE) private userService: ClientProxy
  ) {}

  async getUserRooms(userId: string): Promise<Room[]> {
    const cachedRooms = await this.cacheManager.get<Room[]>("rooms-" + userId);
    if (cachedRooms) return cachedRooms;

    console.log("Fetching from DB");

    // check if user exists
    const user = await firstValueFrom(
      this.userService.send({ cmd: "getUserProfile" }, { id: userId }).pipe(timeout(5000))
    );
    if (!user) throw new NotFoundException(MESSAGES.NOT_FOUND);

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

  async getUnreadUserRooms(userId: string): Promise<Room[]> {
    return [
      {
        id: userId,
        name: "Room 1",
      },
    ];
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
    await this.cacheManager.del("rooms-" + data.userId);

    return {
      id: room.id,
      name: room.name,
    };
  }

  async updateRoom(data: { id: string; name: string }): Promise<Room> {
    // check if room exists
    await this.prismaService.room
      .findUniqueOrThrow({
        where: {
          id: data.id,
        },
      })
      .catch(prismaCatchNotFound(MESSAGES.ROOM_NOT_FOUND));

    const room = await this.prismaService.room.update({
      where: {
        id: data.id,
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

  async deleteRoom(data: { id: string; userId: string }): Promise<DeleteOrLeaveRoomResponse> {
    await this.prismaService.room
      .findUniqueOrThrow({
        where: {
          id: data.id,
          creatorId: data.userId,
        },
      })
      .catch(prismaCatchNotFound(MESSAGES.ROOM_NOT_FOUND));

    await this.prismaService.room.delete({
      where: {
        id: data.id,
      },
    });

    await this.cacheManager.del("room-" + data.id);
    await this.cacheManager.del("rooms-" + data.userId);

    return {
      success: true,
      message: MESSAGES.ROOM_DELETED,
    };
  }

  async leaveRoom(data: { id: string; userId: string }): Promise<DeleteOrLeaveRoomResponse> {
    const room = await this.prismaService.room
      .findUniqueOrThrow({
        where: {
          id: data.id,
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
            id: data.id,
          },
          data: {
            creatorId: room.members[0].userId,
          },
        });
      } else {
        return await this.deleteRoom(data);
      }
    } else {
      await this.prismaService.userRoom.delete({
        where: {
          userId_roomId: {
            userId: data.userId,
            roomId: data.id,
          },
        },
      });
    }

    await this.cacheManager.del("room-" + data.id);
    await this.cacheManager.del("rooms-" + data.userId);

    return {
      success: true,
      message: MESSAGES.ROOM_LEAVE_SUCCESS,
    };
  }
}
