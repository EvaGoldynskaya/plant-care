import prisma from '../lib/prisma';

interface PlantData {
  commonName?: string;
  name?: string;
  roomId?: number;
}

interface PlantActionData {
  type: string;
  note?: string;
}

//Получение всех растений пользователя
export const getPlantsByUser = async (userId: number) => {
  return prisma.plant.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};
 
//Получение всех растений пользователя по комнате
export const getPlantsByRoom = async (userId: number, roomId: number) => {
  return prisma.plant.findMany({
    where: { userId, roomId },
    orderBy: { createdAt: 'desc' },
  });
};

//Добавление нового растения
export const createPlant = async (userId: number, data: PlantData) => {
  const commonName = data.commonName?.trim();
  const plantName = data.name?.trim();
  const roomId = data.roomId;

  if (!commonName) {
    throw new Error('Plant common name is required');
  }

  return prisma.plant.create({
    data: {
      commonName,
      name: plantName || null,
      userId,
      roomId: roomId || null,
    },
  });
};

//Изменение информации о растении
export const updatePlantById = async (userId: number, plantId: number, data: PlantData) => {
  const plant = await prisma.plant.findFirst({
    where: {
      id: plantId,
      userId,
    },
  });

  if (!plant) {
    throw new Error('Plant not found');
  }

  return prisma.plant.update({
    where: { id: plantId },
    data: {
      commonName: data.commonName?.trim() || plant.commonName,
      name: data.name !== undefined ? data.name.trim() || null : plant.name,
      roomId: data.roomId !== undefined ? data.roomId : plant.roomId,
    },
  });
};

//Добавление действия с растением (полив, удобрение)
export const createPlantAction = async (plantId: number, data: PlantActionData) => {
  const { type, note } = data;

  if (!type) {
    throw new Error('Plant action type is required');
  }

  return prisma.plantAction.create({
    data: {
      type,
      note: note || null,
      plantId,
    },
  });
};

//Удаление растения
export const deletePlantById = async (userId: number, plantId: number) => {
  const plant = await prisma.plant.findFirst({
    where: {
      id: plantId,
      userId,
    },
  });

  if (!plant) {
    throw new Error('Plant not found');
  }

  return prisma.plant.delete({
    where: { id: plantId },
  });
};