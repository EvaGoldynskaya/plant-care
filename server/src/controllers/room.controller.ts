import { Request, Response } from 'express';
import { createRoom, deleteRoomById, getRoomsByUser, updateRoomById } from '../services/room.service';

export const getRooms = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const rooms = await getRoomsByUser(userId);

    return res.status(200).json({ rooms });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch rooms';
    return res.status(400).json({ message });
  }
};

export const addRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const room = await createRoom(userId, req.body);

    return res.status(201).json({ message: 'Room created', room });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create room';
    return res.status(400).json({ message });
  }
};

export const updateRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const room = await updateRoomById(userId, Number(id), req.body);

    return res.status(200).json({ message: 'Room updated', room });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update room';
    return res.status(400).json({ message });
  }
};

export const deleteRoom = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const room = await deleteRoomById(userId, Number(id));

    return res.status(200).json({ message: 'Room deleted', room });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete room';
    return res.status(404).json({ message });
  }
};