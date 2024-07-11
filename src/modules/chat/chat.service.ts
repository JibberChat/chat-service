import { Cache } from "cache-manager";
import { firstValueFrom, timeout } from "rxjs";

import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy, ClientProxyFactory, RpcException, Transport } from "@nestjs/microservices";

import { GetMessagesDto } from "./dtos/get-messages.dto";
import { SendMessageDto } from "./dtos/send-message.dto";
import { Message } from "./interfaces/chat.interface";

import { USER_SERVICE } from "@infrastructure/configuration/model/user-service.configuration";
import { PrismaService } from "@infrastructure/database/services/prisma.service";

import { User } from "@entities/user.entity";

import MESSAGES from "@helpers/messages/http-messages";

@Injectable()
export class ChatService {
  private client: ClientProxy;

  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(USER_SERVICE) private userService: ClientProxy
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ["amqp://localhost:5672"],
        queue: "notification_queue",
        queueOptions: {
          durable: false,
        },
      },
    });
  }

  async getRoomMessages(roomId: GetMessagesDto["roomId"]): Promise<Message[]> {
    const cachedMessages = await this.cacheManager.get<Message[]>("messages-" + roomId);
    if (cachedMessages) return cachedMessages;

    const messages = await this.prismaService.message.findMany({
      where: {
        roomId,
      },
      select: {
        id: true,
        text: true,
        createdAt: true,
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
        createdAt: message.createdAt,
        user: {
          id: userFind.id,
          name: userFind.name,
        },
      };
    });

    await this.cacheManager.set("messages-" + roomId, tab);
    return tab;
  }

  async sendMessageToRoom(data: SendMessageDto): Promise<Message> {
    const user = await firstValueFrom(
      this.userService.send({ cmd: "getMe" }, { userId: data.userId }).pipe(timeout(5000))
    );
    if (!user) throw new RpcException(MESSAGES.NOT_FOUND);

    await this.cacheManager.del("messages-" + data.roomId);

    const messageRegister = await this.prismaService.message.create({
      data: {
        text: data.message,
        roomId: data.roomId,
        userId: data.userId,
      },
    });

    await this.sendNotif({ pushTokens: [""], title: "JibberChat", body: "New message" });

    return {
      id: messageRegister.id,
      text: messageRegister.text,
      createdAt: messageRegister.createdAt,
      user: {
        id: data.userId,
        name: user.name,
      },
    };
  }

  async sendNotif(data: { pushTokens: string[]; title: string; body: string }) {
    return await this.client.emit({ cmd: "sendNotifications" }, data).toPromise();
  }
}
