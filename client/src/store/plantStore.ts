import { makeAutoObservable, runInAction } from "mobx"
import axios from "axios"
import { plantsApi } from "../api"
import {
	type Plant,
	type PlantActionRequest,
	type PlantRequest,
	type PlantAction,
	plantActionType,
} from "../types/plant.types"
import { loadFromStorage } from "../utils/storage"

class PlantStore {
	page = 1
	limit = 10
	total = 0

	plants: Plant[] = []
	currentPlant: Plant | null = null

	plantIsLoading: boolean = false
	currentPlantIsLoading: boolean = false
	lastWateringLoading = new Set<number>()

	error: string | null = null

	constructor() {
		makeAutoObservable(this)
		this.restoreSession()
	}

	private restoreSession() {
		this.plants = loadFromStorage("plants") || []
		this.currentPlant = loadFromStorage("currentPlant") || null
		this.page = loadFromStorage("plantPage") || 1
		this.total = loadFromStorage("plantTotal") || 0
	}

	private persistData = () => {
		if (!globalThis.localStorage) return
		globalThis.localStorage.setItem("plants", JSON.stringify(this.plants))
		globalThis.localStorage.setItem("plantPage", String(this.page))
		globalThis.localStorage.setItem("plantTotal", String(this.total))
	}

	private persistCurrentPlant = () => {
		if (!globalThis.localStorage) return
		if (this.currentPlant) {
			globalThis.localStorage.setItem(
				"currentPlant",
				JSON.stringify(this.currentPlant)
			)
		} else {
			globalThis.localStorage.removeItem("currentPlant")
		}
	}

	private clearStorage = () => {
		if (!globalThis.localStorage) return
		globalThis.localStorage.removeItem("plants")
		globalThis.localStorage.removeItem("currentPlant")
		globalThis.localStorage.removeItem("plantPage")
		globalThis.localStorage.removeItem("plantTotal")
	}

	fetchPlants = async (name?: string) => {
		this.plantIsLoading = true
		this.error = null
		try {
			const response = await plantsApi.getPlants(this.page, this.limit, name)
			runInAction(() => {
				this.plants = response.data
				this.page = response.page
				this.total = response.total
				this.plantIsLoading = false
				this.persistData()
			})
			this.loadLastWatering(response.data)

			return { success: true, data: this.plants }
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Не удалось загрузить растения"
			runInAction(() => {
				this.error = message
				this.plantIsLoading = false
			})
			return { success: false, error: message }
		}
	}

	//Получение последнего полива растений
	loadLastWatering = async (plants: Plant[]) => {
		const plantsWithoutLastAction = plants.filter(
			plant => !this.lastWateringLoading.has(plant.id)
		)
		if (plantsWithoutLastAction.length === 0) {
			return
		}
		plantsWithoutLastAction.forEach(plant => {
			this.lastWateringLoading.add(plant.id)
		})

		try {
			const lastActionsPromises = plantsWithoutLastAction.map(async plant => {
				try {
					const lastAction = await plantsApi.getPlantActions(
						plant.id,
						1,
						1,
						plantActionType.WATER
					)
					return {
						plantId: plant.id,
						lastAction: lastAction.data[0],
						error: null,
					}
				} catch (error) {
					return { plantId: plant.id, lastAction: null, error }
				}
			})

			const results = await Promise.all(lastActionsPromises)

			runInAction(() => {
				results.forEach(({ plantId, lastAction }) => {
					const index = this.plants.findIndex(p => p.id === plantId)
					if (index !== -1) {
						this.plants[index] = {
							...this.plants[index],
							lastAction: lastAction || undefined,
						}
					}
					this.lastWateringLoading.delete(plantId)
				})
				this.persistData()
			})
		} catch (_error) {
			plantsWithoutLastAction.forEach(plant => {
				this.lastWateringLoading.delete(plant.id)
			})
		}
	}

	setCurrentPlant = async (plantId: number) => {
		runInAction(() => {
			this.currentPlantIsLoading = true
		})

		let plantById = this.plants.find(p => p.id === plantId) || null

		if (plantById?.actions && plantById.actions.length > 0) {
			runInAction(() => {
				this.currentPlant = plantById
				this.persistCurrentPlant()
				this.currentPlantIsLoading = false
			})

			return this.currentPlant
		}

		try {
			const plant = await plantsApi.getPlantById(plantId)

			let actionsData: PlantAction[] = []
			try {
				const actionsResponse = await plantsApi.getPlantActions(plantId, 1, 5)
				actionsData = actionsResponse.data || []
			} catch (actionsError) {
				console.log(
					"No actions found for plant:",
					plantId,
					"Error:",
					actionsError
				)
				actionsData = []
			}

			runInAction(() => {
				const index = this.plants.findIndex(p => p.id === plantId)
				if (index !== -1) {
					this.plants[index] = { ...plant, actions: actionsData }
					plantById = this.plants[index]
				} else {
					plantById = { ...plant, actions: actionsData }
				}
				this.currentPlant = plantById
				this.persistData()
				this.persistCurrentPlant()
				this.currentPlantIsLoading = false
			})

			return this.currentPlant
		} catch (error) {
			const message =
				axios.isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Не удалось загрузить информацию о растении"
			runInAction(() => {
				this.error = message
				this.currentPlantIsLoading = false
			})
			return this.currentPlant
		}
	}

	createPlant = async (plant: PlantRequest) => {
		this.plantIsLoading = true
		this.error = null

		try {
			const newPlant = await plantsApi.createPlant(plant)
			runInAction(() => {
				this.plants.push(newPlant)
				this.plantIsLoading = false
				this.total += 1
				this.persistData()
			})
			return { success: true, data: newPlant }
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Не удалось создать растение"
			runInAction(() => {
				this.error = message
				this.plantIsLoading = false
			})
			return { success: false, error: message }
		}
	}

	updatePlant = async (id: number, plant: PlantRequest) => {
		this.plantIsLoading = true
		this.error = null

		try {
			const updatedPlant = await plantsApi.updatePlant(id, plant)
			runInAction(() => {
				const index = this.plants.findIndex(p => p.id === id)
				if (index !== -1) {
					this.plants[index] = updatedPlant
				}
				if (this.currentPlant?.id === id) {
					this.currentPlant = updatedPlant
				}
				this.plantIsLoading = false
				this.persistData()
				this.persistCurrentPlant()
			})
			return { success: true, data: updatedPlant }
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Не удалось обновить растение"
			runInAction(() => {
				this.error = message
				this.plantIsLoading = false
			})
			return { success: false, error: message }
		}
	}

	createPlantAction = async (action: PlantActionRequest) => {
		try {
			const createdAction = await plantsApi.createPlantAction(action)
			runInAction(() => {
				if (this.currentPlant?.id === action.plantId) {
					let updatedActions = [
						...(this.currentPlant.actions || []),
						createdAction,
					]
					updatedActions = updatedActions.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					)
					updatedActions = updatedActions.slice(0, 5)

					this.currentPlant = {
						...this.currentPlant,
						actions: updatedActions,
						...(action.type === plantActionType.WATER && {
							lastAction: createdAction,
						}),
					}

					const index = this.plants.findIndex(p => p.id === action.plantId)
					if (index !== -1) {
						this.plants[index] = {
							...this.plants[index],
							actions: updatedActions,
							...(action.type === plantActionType.WATER && {
								lastAction: createdAction,
							}),
						}
						this.persistData()
						this.persistCurrentPlant()
					}
				}
			})
			return { success: true, data: createdAction }
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Не удалось сохранить действие"
			return { success: false, error: message }
		}
	}

	deletePlant = async (id: number) => {
		this.plantIsLoading = true
		this.error = null

		try {
			await plantsApi.deletePlant(id)
			runInAction(() => {
				this.plants = this.plants.filter(p => p.id !== id)
				if (this.currentPlant?.id === id) {
					this.clearCurrentPlant()
				}
				this.plantIsLoading = false
				this.persistData()
			})
			return { success: true }
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Не удалось удалить растение"
			runInAction(() => {
				this.error = message
				this.plantIsLoading = false
			})
			return { success: false, error: message }
		}
	}

	clearCurrentPlant = () => {
		this.currentPlant = null
		this.persistCurrentPlant()
	}

	resetPlants = () => {
		this.plants = []
		this.currentPlant = null
		this.page = 1
		this.total = 0
		this.error = null
		this.clearStorage()
	}

	clearError = () => {
		this.error = null
	}

	changePage = (page: number) => {
		console.log("changePage page", page)
		this.page = page
		console.log("changePage this.plantPage", this.page)
	}
}

const plantStore = new PlantStore()
export default plantStore
