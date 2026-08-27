import { makeAutoObservable, runInAction } from 'mobx';
import axios from 'axios';
import { plantsApi } from '../api';
import { type Plant, type PlantActionRequest, type PlantRequest, type PlantAction, plantActionType } from '../types/plant.types';

class PlantStore {
  plantPage = 1;
  plantLimit = 10;
  totalPlants = 0;

  plants: Plant[] = [];
  currentPlant: Plant | null = null;

  plantIsLoading: boolean = false;
  currentPlantIsLoading: boolean = false;
  lastWateringLoading = new Set<number>();

  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.restoreSession();
  }

  private restoreSession() {
    const savedPlants = localStorage.getItem('plants');
    if (savedPlants) {
      try {
        this.plants = JSON.parse(savedPlants);
      } catch {
        localStorage.removeItem('plants');
      }
    }

    const savedCurrentPlant = localStorage.getItem('currentPlant');
    if (savedCurrentPlant) {
      try {
        this.currentPlant = JSON.parse(savedCurrentPlant);
      } catch {
        localStorage.removeItem('currentPlant');
      }
    }

    const savedPage = localStorage.getItem('plantPage');
    if (savedPage) {
      const page = Number(savedPage);
      if (!Number.isNaN(page) && page > 0) {
        this.plantPage = page;
      } else {
        localStorage.removeItem('plantPage');
      }
    }

    const savedTotal = localStorage.getItem('totalPlants');
    if (savedTotal) {
      const total = Number(savedTotal);
      if (!Number.isNaN(total) && total >= 0) {
        this.totalPlants = total;
      } else {
        localStorage.removeItem('totalPlants');
      }
    }
  }

  private persistPlants = () => {
    localStorage.setItem('plants', JSON.stringify(this.plants));
    localStorage.setItem('plantPage', String(this.plantPage));
    localStorage.setItem('totalPlants', String(this.totalPlants));
  };

  private persistCurrentPlant = () => {
    if (this.currentPlant) {
      localStorage.setItem('currentPlant', JSON.stringify(this.currentPlant));
    } else {
      localStorage.removeItem('currentPlant');
    }
  };

  private clearPlantStorage = () => {
    localStorage.removeItem('plants');
    localStorage.removeItem('currentPlant');
    localStorage.removeItem('plantPage');
    localStorage.removeItem('totalPlants');
  };

  fetchPlants = async () => {
    if (this.plants.length > 0 && !this.plantIsLoading) {
      return { success: true, data: this.plants };
    }

    this.plantIsLoading = true;
    this.error = null;  
    try {
      const response = await plantsApi.getPlants(this.plantPage, this.plantLimit);
      runInAction(() => {
        this.plants = response.data;
        this.plantPage = response.page;
        this.totalPlants = response.total;
        this.plantIsLoading = false;
        this.persistPlants();
      });
      this.loadLastWatering(response.data);

      return { success: true, data: this.plants };
    } catch (error: unknown) {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message
          : 'Не удалось загрузить растения';
      runInAction(() => {
        this.error = message;
        this.plantIsLoading = false;
      });
      return { success: false, error: message };
    }
  };

  //Получение последнего полива растений
  loadLastWatering = async (plants: Plant[]) => {
    const plantsWithoutLastAction = plants.filter(plant => !this.lastWateringLoading.has(plant.id));
    if (plantsWithoutLastAction.length === 0) {
      return;
    }
    plantsWithoutLastAction.forEach(plant => {
      this.lastWateringLoading.add(plant.id);
    });

    try {
      const lastActionsPromises = plantsWithoutLastAction.map(async (plant) => {
        try {
          const lastAction = await plantsApi.getPlantActions(plant.id, 1, 1, plantActionType.WATER);
          return { plantId: plant.id, lastAction: lastAction.data[0], error: null };
        } catch (error) {
          return { plantId: plant.id, lastAction: null, error };
        }
      });

      const results = await Promise.all(lastActionsPromises);

      runInAction(() => {
        results.forEach(({ plantId, lastAction }) => {
          const index = this.plants.findIndex(p => p.id === plantId);
          if (index !== -1) {
            this.plants[index] = {...this.plants[index],lastAction: lastAction || undefined};
          }
          this.lastWateringLoading.delete(plantId);
        });
        this.persistPlants();
      });
    } catch (error) {
      plantsWithoutLastAction.forEach(plant => {
        this.lastWateringLoading.delete(plant.id);
      });
    }
  };


  setCurrentPlant = async (plantId: number) => {
    runInAction(() => {
      this.currentPlantIsLoading = true;
    });

    let plantById = this.plants.find(p => p.id === plantId) || null;
    
    if (plantById?.actions && plantById.actions.length > 0) {
      runInAction(() => {
        this.currentPlant = plantById;
        this.persistCurrentPlant();
        this.currentPlantIsLoading = false;
      });
      
      return this.currentPlant;
    }

    try {
      const plant = await plantsApi.getPlantById(plantId);

      let actionsData: PlantAction[] = [];
      try {
        const actionsResponse = await plantsApi.getPlantActions(plantId, 1, 5);
        actionsData = actionsResponse.data || [];
      } catch (actionsError) {
        console.log('No actions found for plant:', plantId);
        actionsData = [];
      }

      runInAction(() => {
        const index = this.plants.findIndex(p => p.id === plantId);
        if (index !== -1) {
          this.plants[index] = {...plant, actions: actionsData };
          plantById = this.plants[index];
        }
        this.currentPlant = plantById;
        this.persistPlants();
        this.persistCurrentPlant();
        this.currentPlantIsLoading = false;
      });

      console.log('setCurrentPlant this.currentPlant', this.currentPlant);
      return this.currentPlant;

    } catch (error) {
      const message = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message
        : 'Не удалось загрузить информацию о растении';
      runInAction(() => {
        this.error = message;
        this.currentPlantIsLoading = false;
      });
      return this.currentPlant;
    }
  };

  createPlant = async (plant: PlantRequest) => {
    this.plantIsLoading = true;
    this.error = null;

    try {
      console.log('createPlant plant', plant)
      const newPlant = await plantsApi.createPlant(plant);
      console.log('createPlant newPlant', newPlant)
      runInAction(() => {
        this.plants.push(newPlant);
        this.plantIsLoading = false;
        this.persistPlants();
      });
      return { success: true, data: newPlant };
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message
        :'Не удалось создать растение';
      runInAction(() => {
        this.error = message;
        this.plantIsLoading = false;
      });
      console.log('createPlant error message', message)
      return { success: false, error: message };
    }
  };

  updatePlant = async (id: number, plant: PlantRequest) => {
    this.plantIsLoading = true;
    this.error = null;

    try {
      const updatedPlant = await plantsApi.updatePlant(id, plant);
      runInAction(() => {
        // Обновляем в списке
        const index = this.plants.findIndex(p => p.id === id);
        if (index !== -1) {
          this.plants[index] = updatedPlant;
        }
        // Обновляем текущее растение
        if (this.currentPlant?.id === id) {
          this.currentPlant = updatedPlant;
        }
        this.plantIsLoading = false;
        this.persistPlants();
        this.persistCurrentPlant();
      });
      return { success: true, data: updatedPlant };
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message 
          :'Не удалось обновить растение';
      runInAction(() => {
        this.error = message;
        this.plantIsLoading = false;
      });
      return { success: false, error: message };
    }
  };

  createPlantAction = async ( action: PlantActionRequest) => {
    try {
      const createdAction = await plantsApi.createPlantAction(action);
      runInAction(() => {
        if (this.currentPlant?.id === action.plantId) {
          
          let updatedActions = [...(this.currentPlant.actions || []), createdAction];
          updatedActions = updatedActions.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          updatedActions = updatedActions.slice(0, 5);
          
          this.currentPlant = {...this.currentPlant,actions: updatedActions,};

          const index = this.plants.findIndex(p => p.id === action.plantId);
          if (index !== -1) {
            this.plants[index] = {...this.plants[index], actions: updatedActions,};
          }
          this.persistPlants();
          this.persistCurrentPlant();
        }
      });
      return { success: true, data: createdAction };
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message
          :'Не удалось сохранить действие';
      return { success: false, error: message };
    }
  };

  deletePlant = async (id: number) => {
    this.plantIsLoading = true;
    this.error = null;

    try {
      await plantsApi.deletePlant(id);
      runInAction(() => {
        this.plants = this.plants.filter(p => p.id !== id);
        if (this.currentPlant?.id === id) {
          this.clearCurrentPlant();
        }
        this.plantIsLoading = false;
        this.persistPlants();
      });
      return { success: true };
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) && error.response?.data?.message ? error.response.data.message
        :'Не удалось удалить растение';
      runInAction(() => {
        this.error = message;
        this.plantIsLoading = false;
      });
      return { success: false, error: message };
    }
  };

  clearCurrentPlant = () => {
    this.currentPlant = null;
    this.persistCurrentPlant();
  };

  resetPlants = () => {
    this.plants = [];
    this.currentPlant = null;
    this.plantPage = 1;
    this.totalPlants = 0;
    this.error = null;
    this.clearPlantStorage();
  };

  clearError = () => {
    this.error = null;
  };
}

const plantStore = new PlantStore();
export default plantStore;