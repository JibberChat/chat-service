import { green, yellow } from "chalk";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { TcpContext } from "@nestjs/microservices";

import { LoggerService } from "./services/logger.service";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly loggerSerivce: LoggerService;

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const now = Date.now();
    const req = context.switchToRpc().getContext<TcpContext>();
    const method = req.getPattern();
    const args = req.getArgs();

    this.loggerSerivce.info(yellow("Request") + JSON.stringify({ method, args }), this.constructor.name);

    return next.handle().pipe(
      tap((data) => {
        this.loggerSerivce.info(
          green("Response") + JSON.stringify({ duration: Date.now() - now, data }),
          this.constructor.name
        );
      })
    );
  }
}
