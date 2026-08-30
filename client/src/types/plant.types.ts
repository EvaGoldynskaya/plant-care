import type { PlantbookPlant } from "./plantbook.types"

export interface PlantRequest {
	commonName?: string | null
	name?: string | null
	roomId?: number | null
	plantbookPid?: string | null
}

export interface PlantActionRequest {
	plantId: number
	type: string
	note?: string
}

export interface Plant {
	id: number
	commonName: string
	name: string | null
	userId: number
	plantbookPid: string
	roomId: number | null
	createdAt: string
	updatedAt: string
	actions: PlantAction[] | []
	lastAction?: PlantAction | null
	plantbook: PlantbookPlant
}

export interface PlantAction {
	id: number
	type: string
	note?: string | null
	createdAt: string
}

export const plantActionType = {
	WATER: "ПОЛИВ",
	FERTILIZER: "УДОБРЕНИЕ",
} as const
