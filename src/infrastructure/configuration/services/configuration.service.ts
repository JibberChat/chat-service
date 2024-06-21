import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { APP_NAME, APP_PORT, APP_VERSION, AppConfiguration, NODE_ENV } from "../model/app-configuration";
import { NOTIF_SERVICE_QUEUE, NotifServiceConfiguration } from "../model/notif-service.configuration";
import { REDIS_HOST, REDIS_PORT, RedisConfiguration } from "../model/redis-configuration";
import { USER_SERVICE_HOST, USER_SERVICE_PORT, UserServiceConfiguration } from "../model/user-service.configuration";

import { LoggerService } from "@infrastructure/logger/services/logger.service";

@Injectable()
export class ConfigurationService {
  private logger = new LoggerService();

  private _appConfig!: AppConfiguration;
  private _redisConfig!: RedisConfiguration;
  private _userServiceConfig!: UserServiceConfiguration;
  private _notifServiceConfig!: NotifServiceConfiguration;

  public isProd!: boolean;

  get appConfig(): AppConfiguration {
    return this._appConfig;
  }

  get redisConfig(): RedisConfiguration {
    return this._redisConfig;
  }

  get userServiceConfig(): UserServiceConfiguration {
    return this._userServiceConfig;
  }

  get notifServiceConfig(): NotifServiceConfiguration {
    return this._notifServiceConfig;
  }

  constructor(private nestConfigService: ConfigService) {
    this.setupEnvironment();
    this.logger.log("Configuration service initialized.", this.constructor.name);
    this.logger.log(`App name: ${this._appConfig.name}`, this.constructor.name);
  }

  private setupEnvironment(): void {
    // APP
    const appEnv = this.getVariableFromEnvFile(NODE_ENV);

    this._appConfig = {
      name: this.getVariableFromEnvFile(APP_NAME),
      version: this.getVariableFromEnvFile(APP_VERSION),
      port: parseInt(this.getVariableFromEnvFile(APP_PORT)),
      env: appEnv,
    };

    this.isProd = appEnv.includes("prod");

    // REDIS
    this._redisConfig = {
      host: this.getVariableFromEnvFile(REDIS_HOST),
      port: parseInt(this.getVariableFromEnvFile(REDIS_PORT)),
    };

    // USER SERVICE
    this._userServiceConfig = {
      host: this.getVariableFromEnvFile(USER_SERVICE_HOST),
      port: parseInt(this.getVariableFromEnvFile(USER_SERVICE_PORT)),
    };

    // NOTIF SERVICE
    this._notifServiceConfig = {
      host: this.getVariableFromEnvFile(USER_SERVICE_HOST),
      port: parseInt(this.getVariableFromEnvFile(USER_SERVICE_PORT)),
      queue: this.getVariableFromEnvFile(NOTIF_SERVICE_QUEUE),
    };
  }

  private getVariableFromEnvFile(key: string): string {
    const variable = this.nestConfigService.get<string>(key);
    if (!variable) {
      this.logger.error(`No ${key} could be found from env file.`, this.constructor.name);
      throw new Error(`No ${key} could be found from env file.`);
    }
    return variable;
  }
}
