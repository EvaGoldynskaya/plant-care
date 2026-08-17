import prisma from '../lib/prisma';

interface RoomData {
  name: string;
  userId: number;
}

//Получение всех комнат пользователя
export const getRoomsByUser = async (userId: number) => {
  return prisma.room.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

//Добавление новой комнаты
export const createRoom = async (userId: number, data: RoomData) => {
  const name = data.name?.trim();

  if (!name) {
    throw new Error('Room name is required');
  }

  return prisma.room.create({
    data: {
      name,
      userId,
    },
  });
};

//Изменение информации о комнате
export const updateRoomById = async (userId: number, roomId: number, data: RoomData) => {
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      userId,
    },
  });

  if (!room) {
    throw new Error('Room not found');
  }

  return prisma.room.update({
    where: { id: roomId },
    data: {
      name: data.name?.trim() || room.name,
    },
  });
};

//Удаление комнаты
export const deleteRoomById = async (userId: number, roomId: number) => {
  const room = await prisma.room.findFirst({
    where: {
      id: roomId,
      userId,
    },
  });

  if (!room) {
    throw new Error('Room not found');
  }

  return prisma.room.delete({
    where: { id: roomId },
  });
};