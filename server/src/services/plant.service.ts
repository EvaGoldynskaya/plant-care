import prisma from '../lib/prisma';

interface PlantData {
  commonName?: string;
  name?: string;
}

export const getPlantsByUser = async (userId: number) => {
  return prisma.plant.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const createPlant = async (userId: number, data: PlantData) => {
  const commonName = data.commonName?.trim();
  const plantName = data.name?.trim();

  if (!commonName) {
    throw new Error('Plant common name is required');
  }

  return prisma.plant.create({
    data: {
      commonName,
      name: plantName || null,
      userId,
    },
  });
};

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
    },
  });
};

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