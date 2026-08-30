// stores/plantbookStore.ts
import { makeAutoObservable, runInAction } from "mobx"
import { plantbookApi } from "../api/plantbookApi"
import type {
	PlantbookPlant,
	PlantbookSearchPlant,
} from "../types/plantbook.types"
import { generatePlantCare } from "../utils/plantCareGenerator"

class PlantbookStore {
	// Состояние для поиска растений
	searchResults: PlantbookSearchPlant[] = []
	isSearching: boolean = false
	searchError: string | null = null

	// Состояние для детальной информации о растении
	currentPlantbookPlant: PlantbookPlant | null = null
	isLoadingPlantDetails: boolean = false
	plantDetailsError: string | null = null

	// Кеш для детальной информации по pid
	private plantDetailsCache: Map<string, PlantbookPlant> = new Map()

	constructor() {
		makeAutoObservable(this)
	}

	// Очистка кеша (опционально)
	clearCache() {
		this.plantDetailsCache.clear()
	}

	// Метод для поиска растений с debounce (вызывается из хука)
	searchPlants = async (query: string) => {
		if (!query || query.trim().length < 3) {
			runInAction(() => {
				this.searchResults = []
				this.isSearching = false
				this.searchError = null
			})
			return
		}

		runInAction(() => {
			this.isSearching = true
			this.searchError = null
		})

		try {
			const results = await plantbookApi.getPlants(query.trim(), 20)
			runInAction(() => {
				this.searchResults = results.results
				this.isSearching = false
			})
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Не удалось загрузить список растений"
			runInAction(() => {
				this.searchError = errorMessage
				this.searchResults = []
				this.isSearching = false
			})
		}
	}

	getPlantDetails = async (pid: string) => {
		if (!pid) {
			runInAction(() => {
				this.currentPlantbookPlant = null
				this.plantDetailsError = "PID не указан"
			})
			return null
		}

		// Проверяем кеш
		if (this.plantDetailsCache.has(pid)) {
			const cachedPlant = this.plantDetailsCache.get(pid)!
			runInAction(() => {
				this.currentPlantbookPlant = cachedPlant
				this.isLoadingPlantDetails = false
				this.plantDetailsError = null
			})
			return cachedPlant
		}

		runInAction(() => {
			this.isLoadingPlantDetails = true
			this.plantDetailsError = null
		})

		try {
			const plant = await plantbookApi.getPlantByPid(pid)
			const plantCare = generatePlantCare(plant)
			const plantWithCareAdvice = {
				...plant,
				care: plantCare,
			}

			// Сохраняем в кеш
			this.plantDetailsCache.set(pid, plantWithCareAdvice)

			runInAction(() => {
				this.currentPlantbookPlant = plantWithCareAdvice
				this.isLoadingPlantDetails = false
			})

			return plantWithCareAdvice
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Не удалось загрузить список растений"
			runInAction(() => {
				this.plantDetailsError = errorMessage
				this.currentPlantbookPlant = null
				this.isLoadingPlantDetails = false
			})
			return null
		}
	}

	// Очистка результатов поиска
	clearSearchResults = () => {
		runInAction(() => {
			this.searchResults = []
			this.searchError = null
			this.isSearching = false
		})
		localStorage.removeItem("plantbookSearchResults")
	}

	// Очистка детальной информации
	clearPlantDetails = () => {
		runInAction(() => {
			this.currentPlantbookPlant = null
			this.plantDetailsError = null
			this.isLoadingPlantDetails = false
		})
	}

	// Полная очистка стора
	reset = () => {
		this.clearSearchResults()
		this.clearPlantDetails()
		this.plantDetailsCache.clear()
		this.clearError()
	}

	clearError = () => {
		runInAction(() => {
			this.searchError = null
			this.plantDetailsError = null
		})
	}
}

const plantbookStore = new PlantbookStore()
export default plantbookStore
