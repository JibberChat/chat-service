import { catchError, firstValueFrom, of, timeout } from "rxjs";

// import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy, RpcException } from "@nestjs/microservices";

import { CreateRoomDto } from "./dtos/create-room.dto";
import { DeleteRoomDto } from "./dtos/delete-room.dto";
import { InviteUserRoomDto } from "./dtos/invite-user-room.dto";
import { LeaveRoomDto } from "./dtos/leave-room.dto";
import { UpdateRoomDto } from "./dtos/update-room.dto";
import { DeleteOrLeaveRoomResponse, Room } from "./interfaces/room.interface";

import { USER_SERVICE } from "@infrastructure/configuration/model/user-service.configuration";
import { PrismaService } from "@infrastructure/database/services/prisma.service";

import { User } from "@entities/user.entity";

import MESSAGES from "@helpers/messages/http-messages";
import { prismaCatchNotFound } from "@helpers/prisma/catch-not-found";

@Injectable()
export class RoomService {
  constructor(
    private readonly prismaService: PrismaService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(USER_SERVICE) private userService: ClientProxy
  ) {}

  async getUserRooms(userId: string): Promise<Room[]> {
    // const cachedRooms = await this.cacheManager.get<Room[]>("rooms-" + userId);
    // if (cachedRooms) return cachedRooms;

    const user = await firstValueFrom(this.userService.send({ cmd: "getUserProfile" }, { userId }).pipe(timeout(5000)));
    if (!user) throw new RpcException(MESSAGES.NOT_FOUND);

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

    // await this.cacheManager.set("rooms-" + userId, rooms);
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

  async inviteUserToRoom(data: InviteUserRoomDto): Promise<{ success: boolean }> {
    const user: User | null = await firstValueFrom(
      this.userService.send({ cmd: "getUserByEmail" }, { userEmail: data.userEmail }).pipe(
        timeout(5000),
        catchError(() => of(null))
      )
    );
    if (!user) return { success: false };

    await this.prismaService.userRoom.create({
      data: {
        userId: user.id,
        roomId: data.roomId,
      },
    });

    // await this.cacheManager.del("rooms-" + user.id);

    return { success: true };
  }

  async createRoom(data: CreateRoomDto): Promise<Room> {
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

    // await this.cacheManager.set("room-" + room.id, room);
    // await this.cacheManager.del("rooms-" + data.userId);

    return {
      id: room.id,
      name: room.name,
    };
  }

  async updateRoom(data: UpdateRoomDto): Promise<Room> {
    await this.prismaService.room
      .findUniqueOrThrow({
        where: {
          id: data.roomId,
        },
      })
      .catch(prismaCatchNotFound(MESSAGES.ROOM_NOT_FOUND));

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

    // await this.cacheManager.set("room-" + room.id, room);

    return {
      id: room.id,
      name: room.name,
    };
  }

  async deleteRoom(data: DeleteRoomDto): Promise<DeleteOrLeaveRoomResponse> {
    await this.prismaService.room
      .findUniqueOrThrow({
        where: {
          id: data.roomId,
          creatorId: data.userId,
        },
      })
      .catch(prismaCatchNotFound(MESSAGES.ROOM_NOT_FOUND));

    await this.prismaService.room.delete({
      where: {
        id: data.roomId,
      },
    });

    // await this.cacheManager.del("room-" + data.id);
    // await this.cacheManager.del("rooms-" + data.userId);

    return {
      success: true,
      message: MESSAGES.ROOM_DELETED,
    };
  }

  async leaveRoom(data: LeaveRoomDto): Promise<DeleteOrLeaveRoomResponse> {
    const room = await this.prismaService.room
      .findUniqueOrThrow({
        where: {
          id: data.roomId,
        },
        select: {
          id: true,
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
            id: room.id,
          },
          data: {
            creatorId: room.members[0].userId,
          },
        });
        await this.prismaService.userRoom.delete({
          where: {
            userId_roomId: {
              userId: room.members[0].userId,
              roomId: room.id,
            },
          },
        });
      } else {
        return await this.deleteRoom({ roomId: room.id, userId: data.userId });
      }
    } else {
      await this.prismaService.userRoom.delete({
        where: {
          userId_roomId: {
            userId: data.userId,
            roomId: room.id,
          },
        },
      });
    }

    // await this.cacheManager.del("room-" + data.id);
    // await this.cacheManager.del("rooms-" + data.userId);

    return {
      success: true,
      message: MESSAGES.ROOM_LEAVE_SUCCESS,
    };
  }
}
