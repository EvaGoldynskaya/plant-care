import { Request, Response } from 'express';

import {
  createPlant,
  createPlantAction,
  deletePlantById,
  getPlantsByUser,
  updatePlantById,
} from '../services/plant.service';

export const getPlants = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const plants = await getPlantsByUser(userId);

    return res.status(200).json({ plants });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch plants';
    return res.status(400).json({ message });
  }
};

export const addPlant = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const plant = await createPlant(userId, req.body);

    return res.status(201).json({ message: 'Plant created', plant });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create plant';
    return res.status(400).json({ message });
  }
};

export const updatePlant = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const plant = await updatePlantById(userId, Number(id), req.body);

    return res.status(200).json({ message: 'Plant updated', plant });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update plant';
    return res.status(400).json({ message });
  }
};

export const createAction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const plant = await createPlantAction(Number(id), { ...req.body });

    return res.status(200).json({ message: 'Plant action created', plant });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create plant action';
    return res.status(400).json({ message });
  }
};

export const deletePlant = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const plant = await deletePlantById(userId, Number(id));

    return res.status(200).json({ message: 'Plant deleted', plant });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete plant';
    return res.status(404).json({ message });
  }
};