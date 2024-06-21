export const NOTIF_SERVICE = "NOTIF_SERVICE";
export const NOTIF_SERVICE_PORT = "NOTIF_SERVICE_PORT";
export const NOTIF_SERVICE_HOST = "NOTIF_SERVICE_HOST";
export const NOTIF_SERVICE_QUEUE = "NOTIF_SERVICE_QUEUE";

export type NotifServiceConfiguration = {
  port: number;
  host: string;
  queue: string;
};
