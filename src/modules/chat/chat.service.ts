import { Cache } from "cache-manager";
import { firstValueFrom, timeout } from "rxjs";

import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

import { Message } from "./chat.interface";

import { NOTIF_SERVICE } from "@infrastructure/configuration/model/notif-service.configuration";
import { USER_SERVICE } from "@infrastructure/configuration/model/user-service.configuration";
import { PrismaService } from "@infrastructure/database/services/prisma.service";

import { User } from "@entities/user.entity";

@Injectable()
export class ChatService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(USER_SERVICE) private userService: ClientProxy,
    @Inject(NOTIF_SERVICE) private notifService: ClientProxy
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const userIds = [...new Set(messages.map((message) => message.userId))];

    const users: User[] = await firstValueFrom(
      this.userService.send({ cmd: "getUsers" }, { userIds }).pipe(timeout(5000))
    );

    const tab = messages.map((message) => {
      const userFind = users.find((user) => user.id === message.userId);
      return {
        id: message.id,
        text: message.text,
        user: {
          name: userFind.name,
        },
      };
    });

    await this.cacheManager.set("messages-" + roomId, tab);
    return tab;
  }

  async sendMessageToRoom(data: { roomId: string; message: string }): Promise<Message> {
    await this.cacheManager.del("messages-" + data.roomId);

    const messageRegister = await this.prismaService.message.create({
      data: {
        text: data.message,
        roomId: data.roomId,
        userId: "1",
      },
    });

    // this.notifService.send({ cmd: "sendNotifications" }, { pushTokens: "", title: "JibberChat", body: "New message" });

    return {
      id: messageRegister.id,
      text: messageRegister.text,
      user: {
        name: "1",
      },
    };
  }
}
