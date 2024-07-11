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
    const contextType = context.getType();
    const now = Date.now();

    if (contextType === "http") {
      const req = context.switchToHttp().getRequest();
      const { url, method, params, query, body } = req;

      this.loggerService.info(
        yellow("Request ") + JSON.stringify({ url, method, params, query, body }),
        this.constructor.name
      );
    } else if (contextType === "rpc") {
      const req = context.switchToRpc().getContext<TcpContext>();
      const method = req.getPattern();
      const socketAddress = req.getSocketRef().socket.remoteAddress;

      this.loggerService.info(yellow("Request ") + JSON.stringify({ method, socketAddress }), this.constructor.name);
    }

    console.log("contextType", contextType);

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
