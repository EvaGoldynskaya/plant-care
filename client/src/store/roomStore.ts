import { makeAutoObservable, runInAction } from "mobx"
import type { Room, RoomRequest } from "../types/room.types"
import { roomApi } from "../api"
import axios from "axios"
import { loadFromStorage } from "../utils/storage"


class RoomStore {

  currentPage = 1
  limit = 10
  total = 0

  rooms: Room[] = []
  isLoading: boolean = false
  error: string | null = null
  
  constructor() {
    makeAutoObservable(this)
    this.restoreSession()
  }


  private restoreSession() {
    this.rooms = loadFromStorage("rooms") || []
    this.currentPage = loadFromStorage("roomsPage") || 1
    this.total = loadFromStorage("roomsTotal") || 0
  }

  private persistData = () => {
    localStorage.setItem("rooms", JSON.stringify(this.rooms))
    localStorage.setItem("roomsPage", String(this.currentPage))
    localStorage.setItem("roomsTotal", String(this.total))
  }

  private clearStorage = () => {
    localStorage.removeItem("rooms")
    localStorage.removeItem("roomsPage")
    localStorage.removeItem("roomsTotal")
	}

  fetchRooms = async () => {
    console.log("fetchRooms")
		this.isLoading = true
		this.error = null
		try {
			const response = await roomApi.getRooms(
				this.currentPage,
				this.limit,
			)

      console.log("fetchRooms response", response)
			runInAction(() => {
				this.rooms = response
				this.isLoading = false
				this.persistData()
			})

      console.log("fetchRooms this.rooms", this.rooms)

			return { success: true, data: this.rooms }
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Не удалось загрузить комнаты"
			runInAction(() => {
				this.error = message
				this.isLoading = false
			})
			return { success: false, error: message }
		}
	}

  createRoom = async (room:RoomRequest) => {
		this.isLoading = true
		this.error = null

		try {
			const newRoom = await roomApi.createRoom(room)
      console.log("createRoom newRoom", newRoom)
			runInAction(() => {
				this.rooms.push(newRoom)
				this.isLoading = false
				this.total +=1
				this.persistData()
			})
			return { success: true, data: newRoom }
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Не удалось создать комнату"
			runInAction(() => {
				this.error = message
				this.isLoading = false
			})
			return { success: false, error: message }
		}
	}


  updateRoom = async (id: number, room:RoomRequest) => {
		this.isLoading = true
		this.error = null

		try {
			const updatedPlant = await roomApi.updateRoom(id, room)
			runInAction(() => {
				const index = this.rooms.findIndex(p => p.id === id)
				if (index !== -1) {
					this.rooms[index] = updatedPlant
				}
				this.isLoading = false
				this.persistData()
			})
			return { success: true, data: updatedPlant }
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Не удалось обновить комнату"
			runInAction(() => {
				this.error = message
				this.isLoading = false
			})
			return { success: false, error: message }
		}
	}

  deleteRoom = async (id: number) => {
		this.isLoading = true
		this.error = null

		try {
			await roomApi.deleteRoom(id)
			runInAction(() => {
				this.rooms = this.rooms.filter(p => p.id !== id)
				this.isLoading = false
				this.persistData()
			})
			return { success: true }
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Не удалось удалить комнату"
			runInAction(() => {
				this.error = message
				this.isLoading = false
			})
			return { success: false, error: message }
		}
	}

  getRoomName = (id: number | null | undefined): string => {
    if (!id) return 'Не указана'
    const room = this.rooms.find(r => r.id === id)
    return room?.name || String(id)
  }

}

const roomStore = new RoomStore()
export default roomStore