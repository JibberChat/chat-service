import { green, yellow } from "chalk";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { TcpContext } from "@nestjs/microservices";

import { LoggerService } from "./services/logger.service";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const now = Date.now();
    const req = context.switchToRpc().getContext<TcpContext>();
    const method = req.getPattern();
    const socketAddress = req.getSocketRef().socket.remoteAddress;

    this.loggerService.info(yellow("Request ") + JSON.stringify({ method, socketAddress }), this.constructor.name);

    return next.handle().pipe(
      tap((data) => {
        this.loggerService.log(
          green("Response ") + JSON.stringify({ duration: Date.now() - now, data }),
          this.constructor.name
        );
      })
    );
  }
}
