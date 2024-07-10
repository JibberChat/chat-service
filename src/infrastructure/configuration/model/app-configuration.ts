export const APP_NAME = "APP_NAME";
export const APP_VERSION = "APP_VERSION";
export const APP_SERVICE_PORT = "APP_SERVICE_PORT";
export const APP_HTTP_PORT = "APP_HTTP_PORT";
export const NODE_ENV = "NODE_ENV";

export type AppConfiguration = {
  name: string;
  version: string;
  servicePort: number;
  httpPort: number;
  env: string;
};
