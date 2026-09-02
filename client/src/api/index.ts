import axios from "axios"
import type {
	LoginData,
	RegisterData,
	AuthResponse,
	AuthApiResponse,
} from "../types/auth.types"
import type {
	Plant,
	PlantAction,
	PlantActionRequest,
	PlantRequest,
} from "../types/plant.types"
import type { Room, RoomRequest } from "../types/room.types"

interface PlantMutationResponse {
	message: string
	plant: Plant
}

interface RoomMutationResponse {
	message: string
	room: Room
}

interface RoomsResponse {
	message: string
	rooms: Room[]
}

interface PlantActionResponse {
	message: string
	plantAction: PlantAction
}

interface PaginatedResponse<T> {
	data: T[]
	total: number
	page: number
	totalPages: number
}

const baseApiUrl =
	(import.meta.env.VITE_API_URL as string | undefined) ||
	"https://plant-care-server.vercel.app"

const API_URL = `${baseApiUrl.replace(/\/$/, "")}/api`

const api = axios.create({
	baseURL: API_URL,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: false,
})

api.interceptors.request.use(config => {
	const token = localStorage.getItem("token")
	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

function mapAuthResponse(data: AuthApiResponse): AuthResponse {
	const { token, id, email, name } = data.user
	return { token, user: { id, email, name } }
}

export const authApi = {
	register: async (data: RegisterData): Promise<AuthResponse> => {
		const { confirmPassword: _, ...payload } = data
		const res = await api.post<AuthApiResponse>("/register", payload)
		return mapAuthResponse(res.data)
	},

	login: async (data: LoginData): Promise<AuthResponse> => {
		const res = await api.post<AuthApiResponse>("/login", data)
		return mapAuthResponse(res.data)
	},
}

export const roomApi = {
	getRooms: async (page?: number, limit?: number): Promise<Room[]> => {
		const res = await api.get<RoomsResponse>("/rooms", {
			params: { page, limit },
		})
		return res.data.rooms
	},
	createRoom: async (room: RoomRequest): Promise<Room> => {
		const res = await api.post<RoomMutationResponse>("/createRoom", room)
		console.log("createRoom res ", res)
		return res.data.room
	},
	updateRoom: async (id: number, room: RoomRequest): Promise<Room> => {
		const res = await api.put<RoomMutationResponse>(`/updateRoom/${id}`, room)
		return res.data.room
	},
	deleteRoom: async (id: number): Promise<Room> => {
		const res = await api.post<RoomMutationResponse>(`/deleteRoom/${id}`)
		return res.data.room
	},
}

export const plantsApi = {
	getPlants: async (
		page?: number,
		limit?: number,
		name?: string
	): Promise<PaginatedResponse<Plant>> => {
		const res = await api.get<PaginatedResponse<Plant>>("/plants", {
			params: { page, limit, name },
		})
		return res.data
	},
	getPlantById: async (id: number): Promise<Plant> => {
		const res = await api.get<Plant>(`/plants/${id}`)
		return res.data
	},
	createPlant: async (plant: PlantRequest): Promise<Plant> => {
		const res = await api.post<PlantMutationResponse>("/createPlant", plant)
		return res.data.plant
	},
	updatePlant: async (id: number, plant: PlantRequest): Promise<Plant> => {
		const res = await api.put<PlantMutationResponse>(
			`/updatePlant/${id}`,
			plant
		)
		return res.data.plant
	},
	deletePlant: async (id: number): Promise<void> => {
		await api.delete(`/deletePlant/${id}`)
	},
	getPlantActions: async (
		plantId: number,
		page?: number,
		limit?: number,
		type?: string
	): Promise<PaginatedResponse<PlantAction>> => {
		const res = await api.get<PaginatedResponse<PlantAction>>("/plantActions", {
			params: { plantId, page, limit, type },
		})
		return res.data
	},
	createPlantAction: async (
		action: PlantActionRequest
	): Promise<PlantAction> => {
		const res = await api.post<PlantActionResponse>(
			`/createPlantAction`,
			action
		)
		return res.data.plantAction
	},
}
