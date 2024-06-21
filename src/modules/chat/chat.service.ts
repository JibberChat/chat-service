import { Cache } from "cache-manager";
import { firstValueFrom, timeout } from "rxjs";
import { User } from "src/entities/user.entity";

// import { User } from "src/entities/user.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

import { Message } from "./chat.interface";

import { USER_SERVICE } from "@infrastructure/configuration/model/user-service.configuration";
import { PrismaService } from "@infrastructure/database/services/prisma.service";

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(USER_SERVICE) private userService: ClientProxy
  ) {}

  async getRoomMessages(roomId: string): Promise<Message[]> {
    const cachedMessages = await this.cacheManager.get<Message[]>("messages-" + roomId);
    if (cachedMessages) return cachedMessages;

    const messages = await this.prismaService.message.findMany({
      where: {
        roomId,
      },
      select: {
        id: true,
        text: true,
        userId: true,
        // createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const userIds = [...new Set(messages.map((message) => message.userId))];

    const users: User[] = await firstValueFrom(
      this.userService.send({ cmd: "getUsers" }, { userIds }).pipe(timeout(5000))
    );
    console.log("users", users);

    const tab = messages.map((message) => {
      const user = users.find((user) => user.id === message.userId);
      return {
        id: message.id,
        text: message.text,
        user: {
          name: user.name,
        },
      };
    });

    await this.cacheManager.set("messages-" + roomId, tab);
    return tab;
  }

  async sendMessageToRoom(data: { roomId: string; message: string }): Promise<string> {
    await this.cacheManager.del("messages-" + data.roomId);

    await this.prismaService.message.create({
      data: {
        text: data.message,
        userId: "1",
        roomId: data.roomId,
      },
    });

    return "Message sent successfully";
  }
}
