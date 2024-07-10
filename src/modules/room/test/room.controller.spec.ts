import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from '../room.controller';
import { RoomService } from '../room.service';
import { CreateRoomDto } from '../dtos/create-room.dto';
import { DeleteRoomDto } from '../dtos/delete-room.dto';
import { GetUnreadUserRoomsDto } from '../dtos/get-unread-user-rooms.dto';
import { GetUserRoomsDto } from '../dtos/get-user-rooms.dto';
import { InviteUserRoomDto } from '../dtos/invite-user-room.dto';
import { LeaveRoomDto } from '../dtos/leave-room.dto';
import { UpdateRoomDto } from '../dtos/update-room.dto';
import { Room, DeleteOrLeaveRoomResponse } from '../interfaces/room.interface';

describe('RoomController', () => {
  let roomController: RoomController;
  let roomService: RoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        {
          provide: RoomService,
          useValue: {
            getUserRooms: jest.fn(),
            getUnreadUserRooms: jest.fn(),
            inviteUserToRoom: jest.fn(),
            createRoom: jest.fn(),
            updateRoom: jest.fn(),
            deleteRoom: jest.fn(),
            leaveRoom: jest.fn(),
          },
        },
      ],
    }).compile();

    roomController = module.get<RoomController>(RoomController);
    roomService = module.get<RoomService>(RoomService);
  });

  it('should be defined', () => {
    expect(roomController).toBeDefined();
  });

  describe('getUserRooms', () => {
    it('should return an array of rooms', async () => {
      const result: Room[] = [{ id: '1', name: 'Room 1' }];
      jest.spyOn(roomService, 'getUserRooms').mockResolvedValue(result);

      expect(await roomController.getUserRooms({ userId: '1' } as GetUserRoomsDto)).toBe(result);
    });
  });

  describe('getUnreadUserRooms', () => {
    it('should return an array of unread rooms', async () => {
      const result: Room[] = [{ id: '1', name: 'Unread Room 1' }];
      jest.spyOn(roomService, 'getUnreadUserRooms').mockResolvedValue(result);

      expect(await roomController.getUnreadUserRooms({ userId: '1' } as GetUnreadUserRoomsDto)).toBe(result);
    });
  });

  describe('inviteUserToRoom', () => {
    it('should invite a user to a room', async () => {
      const result = { success: true };
      jest.spyOn(roomService, 'inviteUserToRoom').mockResolvedValue(result);

      expect(await roomController.inviteUserToRoom({ userEmail: 'test@test.com', roomId: '1' } as InviteUserRoomDto)).toBe(result);
    });
  });

  describe('createRoom', () => {
    it('should create a room', async () => {
      const result: Room = { id: '1', name: 'Room 1' };
      jest.spyOn(roomService, 'createRoom').mockResolvedValue(result);

      expect(await roomController.createRoom({ name: 'Room 1', userId: '1' } as CreateRoomDto)).toBe(result);
    });
  });

  describe('updateRoom', () => {
    it('should update a room', async () => {
      const result: Room = { id: '1', name: 'Updated Room' };
      jest.spyOn(roomService, 'updateRoom').mockResolvedValue(result);

      expect(await roomController.updateRoom({ roomId: '1', name: 'Updated Room' } as UpdateRoomDto)).toBe(result);
    });
  });

  describe('deleteRoom', () => {
    it('should delete a room', async () => {
      const result: DeleteOrLeaveRoomResponse = { success: true, message: 'Room deleted' };
      jest.spyOn(roomService, 'deleteRoom').mockResolvedValue(result);

      expect(await roomController.deleteRoom({ roomId: '1', userId: '1' } as DeleteRoomDto)).toBe(result);
    });
  });

  describe('leaveRoom', () => {
    it('should leave a room', async () => {
      const result: DeleteOrLeaveRoomResponse = { success: true, message: 'Left room' };
      jest.spyOn(roomService, 'leaveRoom').mockResolvedValue(result);

      expect(await roomController.leaveRoom({ roomId: '1', userId: '1' } as LeaveRoomDto)).toBe(result);
    });
  });
});
