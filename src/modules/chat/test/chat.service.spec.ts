import { Cache } from "cache-manager";
import { of } from "rxjs";

import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { ClientProxy } from "@nestjs/microservices";
import { Test, TestingModule } from "@nestjs/testing";

import { ChatService } from "../chat.service";
import { SendMessageDto } from "../dtos/send-message.dto";
import { Message } from "../interfaces/chat.interface";

import { NOTIF_SERVICE } from "@infrastructure/configuration/model/notif-service.configuration";
import { USER_SERVICE } from "@infrastructure/configuration/model/user-service.configuration";
import { PrismaService } from "@infrastructure/database/services/prisma.service";

describe("ChatService", () => {
  let chatService: ChatService;
  let cacheManager: Cache;
  let userService: ClientProxy;
  // let notifService: ClientProxy;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: USER_SERVICE,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: NOTIF_SERVICE,
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            message: {
              findMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    chatService = module.get<ChatService>(ChatService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    userService = module.get<ClientProxy>(USER_SERVICE);
    // notifService = module.get<ClientProxy>(NOTIF_SERVICE);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe("getRoomMessages", () => {
    it("should return cached messages if available", async () => {
      const roomId = "1";
      const cachedMessages: Message[] = [{ id: "1", text: "Hello", createdAt: new Date(), user: { name: "User1" } }];
      jest.spyOn(cacheManager, "get").mockResolvedValue(cachedMessages);

      const result = await chatService.getRoomMessages(roomId);

      expect(result).toEqual(cachedMessages);
      expect(cacheManager.get).toHaveBeenCalledWith("messages-" + roomId);
    });

    it("should fetch messages from database and cache them if not in cache", async () => {
      const now = new Date();
      const roomId = "1";
      const messagesFromDb = [
        { id: "1", text: "Hello", userId: "1", roomId: "1", createdAt: now, updatedAt: now },
        { id: "2", text: "Hi", userId: "2", roomId: "1", createdAt: now, updatedAt: now },
      ];
      const users = [
        { id: "1", name: "User1" },
        { id: "2", name: "User2" },
      ];
      jest.spyOn(cacheManager, "get").mockResolvedValue(null);
      jest.spyOn(prismaService.message, "findMany").mockResolvedValue(messagesFromDb);
      jest.spyOn(userService, "send").mockReturnValue(of(users));

      const result = await chatService.getRoomMessages(roomId);

      expect(result).toEqual([
        { id: "1", text: "Hello", createdAt: now, user: { name: "User1" } },
        { id: "2", text: "Hi", createdAt: now, user: { name: "User2" } },
      ]);
      expect(cacheManager.set).toHaveBeenCalledWith("messages-" + roomId, result);
    });
  });

  describe("sendMessageToRoom", () => {
    it("should delete cache and create a new message", async () => {
      const now = new Date();
      const data: SendMessageDto = { roomId: "1", message: "New Message", userId: "1" };
      const createdMessage = {
        id: "1",
        text: "New Message",
        roomId: "1",
        userId: "1",
        createdAt: now,
        updatedAt: now,
      };
      jest.spyOn(cacheManager, "del").mockResolvedValue(null);
      jest.spyOn(prismaService.message, "create").mockResolvedValue(createdMessage);

      const result = await chatService.sendMessageToRoom(data);

      expect(result).toEqual({ id: "1", text: "New Message", createdAt: now, user: { name: "1" } });
      expect(cacheManager.del).toHaveBeenCalledWith("messages-" + data.roomId);
      expect(prismaService.message.create).toHaveBeenCalledWith({
        data: {
          text: data.message,
          roomId: data.roomId,
          userId: "1",
        },
      });
    });
  });
});
