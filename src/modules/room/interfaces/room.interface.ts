export interface Room {
  id: string;
  name: string;
}

export interface DeleteOrLeaveRoomResponse {
  success: boolean;
  message: string;
}
