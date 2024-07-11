import { of } from "rxjs";

import { ClientProxy } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";

import { CreateRoomDto } from "../dtos/create-room.dto";
import { DeleteRoomDto } from "../dtos/delete-room.dto";
import { InviteUserRoomDto } from "../dtos/invite-user-room.dto";
import { LeaveRoomDto } from "../dtos/leave-room.dto";
import { UpdateRoomDto } from "../dtos/update-room.dto";
import { DeleteOrLeaveRoomResponse, Room } from "../interfaces/room.interface";
import { RoomService } from "../room.service";

import { USER_SERVICE } from "@infrastructure/configuration/model/user-service.configuration";
import { PrismaService } from "@infrastructure/database/services/prisma.service";

describe("RoomService", () => {
  let service: RoomService;
  let prismaService: PrismaService;
  let userService: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: PrismaService,
          useValue: {
            room: {
              findMany: jest.fn(),
              create: jest.fn(),
              findUniqueOrThrow: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            userRoom: {
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: USER_SERVICE,
          useValue: {
            send: jest.fn(() => of({ id: "1", email: "test@test.com" })),
          },
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
    prismaService = module.get<PrismaService>(PrismaService);
    userService = module.get<ClientProxy>(USER_SERVICE);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getUserRooms", () => {
    it("should return an array of rooms", async () => {
      const result: Room[] = [{ id: "1", name: "Room 1" }];
      jest.spyOn(prismaService.room, "findMany").mockResolvedValue(result as any);

      expect(await service.getUserRooms("1")).toStrictEqual(result);
    });
  });

  describe("getUnreadUserRooms", () => {
    it("should return an array of unread rooms", async () => {
      const result: Room[] = [{ id: "1", name: "Unread Room 1" }];
      jest.spyOn(service, "getUnreadUserRooms").mockResolvedValue(result);

      expect(await service.getUnreadUserRooms("1")).toStrictEqual(result);
    });
  });

  describe("inviteUserToRoom", () => {
    it("should invite a user to a room", async () => {
      const result = { success: true };
      jest.spyOn(prismaService.userRoom, "create").mockResolvedValue(undefined);
      jest.spyOn(userService, "send").mockReturnValue(of({ id: "1" }));

      expect(
        await service.inviteUserToRoom({ userEmail: "test@test.com", roomId: "1" } as InviteUserRoomDto)
      ).toStrictEqual(result);
    });

    it("should return false if user not found", async () => {
      const result = { success: false };
      jest.spyOn(userService, "send").mockReturnValue(of(undefined));

      expect(
        await service.inviteUserToRoom({ userEmail: "test@test.com", roomId: "1" } as InviteUserRoomDto)
      ).toStrictEqual(result);
    });
  });

  describe("createRoom", () => {
    it("should create a room", async () => {
      const result: Room = { id: "1", name: "Room 1" };
      jest.spyOn(prismaService.room, "create").mockResolvedValue(result as any);

      expect(await service.createRoom({ name: "Room 1", userId: "1" } as CreateRoomDto)).toStrictEqual(result);
    });
  });

  describe("updateRoom", () => {
    it("should update a room", async () => {
      const result: Room = { id: "1", name: "Updated Room" };
      jest.spyOn(prismaService.room, "findUniqueOrThrow").mockResolvedValue(result as any);
      jest.spyOn(prismaService.room, "update").mockResolvedValue(result as any);

      expect(await service.updateRoom({ roomId: "1", name: "Updated Room" } as UpdateRoomDto)).toStrictEqual(result);
    });
  });

  describe("deleteRoom", () => {
    it("should delete a room", async () => {
      const result: DeleteOrLeaveRoomResponse = { success: true, message: "Room deleted successfully" };
      jest.spyOn(prismaService.room, "findUniqueOrThrow").mockResolvedValue({} as any);
      jest.spyOn(prismaService.room, "delete").mockResolvedValue({} as any);

      expect(await service.deleteRoom({ roomId: "1", userId: "1" } as DeleteRoomDto)).toStrictEqual(result);
    });
  });

  describe("leaveRoom", () => {
    it("should leave a room", async () => {
      const result: DeleteOrLeaveRoomResponse = { success: true, message: "Room deleted successfully" };
      jest.spyOn(prismaService.userRoom, "delete").mockResolvedValue({} as any);
      jest.spyOn(prismaService.room, "findUniqueOrThrow").mockResolvedValue({
        id: "1",
        creatorId: "1",
        members: [],
      } as any);

      expect(await service.leaveRoom({ roomId: "1", userId: "1" } as LeaveRoomDto)).toStrictEqual(result);
    });
  });
});
