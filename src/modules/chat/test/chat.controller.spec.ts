import { Test, TestingModule } from "@nestjs/testing";

import { ChatController } from "../chat.controller";
import { Message } from "../chat.interface";
import { ChatService } from "../chat.service";
import { SendMessageDto } from "../dtos/send-message.dto";

describe("ChatController", () => {
  let chatController: ChatController;
  let chatService: ChatService;
  const now = new Date();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: {
            getRoomMessages: jest.fn(),
            sendMessageToRoom: jest.fn(),
          },
        },
      ],
    }).compile();

    chatController = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(ChatService);
  });

  describe("getRoomMessages", () => {
    it("should return messages for the given room", async () => {
      const roomId = "1";
      const messages: Message[] = [
        { id: "1", text: "Hello", createdAt: now, user: { name: "User1" } },
        { id: "2", text: "Hi", createdAt: now, user: { name: "User2" } },
      ];
      jest.spyOn(chatService, "getRoomMessages").mockResolvedValue(messages);

      const result = await chatController.getRoomMessages({ roomId });

      expect(result).toEqual(messages);
      expect(chatService.getRoomMessages).toHaveBeenCalledWith(roomId);
    });
  });

  describe("sendMessageToRoom", () => {
    it("should send a message to the given room and return the message", async () => {
      const data: SendMessageDto = { roomId: "1", message: "New Message", userId: "1" };
      const newMessage: Message = { id: "1", text: "New Message", createdAt: now, user: { name: "User1" } };
      jest.spyOn(chatService, "sendMessageToRoom").mockResolvedValue(newMessage);

      const result = await chatController.sendMessageToRoom(data);

      expect(result).toEqual(newMessage);
      expect(chatService.sendMessageToRoom).toHaveBeenCalledWith(data);
    });
  });
});
