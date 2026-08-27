import axios from 'axios';
import type { PlantbookPlant, PlantbookSearchResponse } from "../types/plantbook.types";


const PLANTBOOK_API_URL = 'https://open.plantbook.io/api/v1';
const PLANTBOOK_TOKEN = 'Token e27209605cd57f9e3f84be7dfe969faaaaeaa622';

const api = axios.create({
  baseURL: PLANTBOOK_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': PLANTBOOK_TOKEN,
  },
});

export const plantbookApi = {
  //список растений при выборе вида
  getPlants: async (alias?: string, limit?: number): Promise<PlantbookSearchResponse> => {
    const res = await api.get<PlantbookSearchResponse>('/plant/search', { params: { alias, limit } });
    return res.data;
  },
  //получение информации о растении по его pid
  getPlantByPid: async (pid: string): Promise<PlantbookPlant> => {
    const res = await api.get<PlantbookPlant>(`/plant/detail/${pid}`);
    return res.data;
  },
}