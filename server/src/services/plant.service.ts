import prisma from "../lib/prisma"

interface PlantMutationData {
	commonName?: string
	name?: string
	roomId?: number
	plantbookPid?: string
}

interface PlantActionData {
	plantId: number
	type: string
	note?: string
}

interface PlantRequestData {
	page?: number
	limit?: number
	name?: string
}

interface PlantActionRequestData {
	page?: number
	limit?: number
	type?: string
	plantId?: number
}

const DEFAULT_PARAMS = {
	page: 1,
	limit: 10,
}

const normalizeParams = (params: any) => {
	let page = params?.page ?? DEFAULT_PARAMS.page
	let limit = params?.limit ?? DEFAULT_PARAMS.limit

	page = Number(page)
	limit = Number(limit)

	if (isNaN(page) || page < 1) page = DEFAULT_PARAMS.page
	if (isNaN(limit) || limit < 1) limit = DEFAULT_PARAMS.limit

	return { page, limit }
}

//Получение всех растений пользователя
export const getPlantsByUser = async (
	userId: number,
	params?: PlantRequestData
) => {
	const { page, limit } = normalizeParams(params)
	const name = params?.name?.trim() || undefined
	const skip = (page - 1) * limit

	const where: any = { userId }
	if (name) {
		where.OR = [
			{ name: { contains: name, mode: "insensitive" } },
			{ commonName: { contains: name, mode: "insensitive" } }
		]
	}

	const [plants, total] = await Promise.all([
		prisma.plant.findMany({
			where: where,
			orderBy: { createdAt: "desc" },
			skip: skip,
			take: limit,
		}),
		prisma.plant.count({
			where: where,
		}),
	])
	const totalPages = total > 0 ? Math.ceil(total / limit) : 0

	return {
		data: plants,
		total,
		page,
		totalPages,
	}
}

//Получение растения по id
export const getPlantByIdUser = async (userId: number, plantId: number) => {
	return prisma.plant.findUnique({
		where: { userId: userId, id: plantId },
	})
}

//Добавление нового растения
export const createNewPlant = async (
	userId: number,
	data: PlantMutationData
) => {
	const commonName = data.commonName?.trim()
	const plantName = data.name?.trim()
	const { roomId, plantbookPid } = data

	if (!commonName) {
		throw new Error("Plant common name is required")
	}

	return prisma.plant.create({
		data: {
			commonName,
			name: plantName || null,
			userId,
			roomId: roomId || null,
			plantbookPid: plantbookPid || null,
		},
	})
}

//Изменение информации о растении
export const updatePlantById = async (
	userId: number,
	plantId: number,
	data: PlantMutationData
) => {
	const plant = await prisma.plant.findFirst({
		where: {
			id: plantId,
			userId,
		},
	})

	if (!plant) {
		throw new Error("Plant not found")
	}

	return prisma.plant.update({
		where: { id: plantId },
		data: {
			commonName: data.commonName?.trim() || plant.commonName,
			name: data.name !== undefined ? data.name.trim() || null : plant.name,
			roomId: data.roomId !== undefined ? data.roomId : plant.roomId,
		},
	})
}

//Удаление растения
export const deletePlantById = async (userId: number, plantId: number) => {
	const plant = await prisma.plant.findFirst({
		where: {
			id: plantId,
			userId,
		},
	})

	if (!plant) {
		throw new Error("Plant not found")
	}

	return prisma.plant.delete({
		where: { id: plantId },
	})
}

//Получение всех действий с растением
export const getPlantActionsByPlant = async (
	params?: PlantActionRequestData
) => {
	const { page, limit } = normalizeParams(params)
	const skip = (page - 1) * limit
	const type = params?.type?.trim() || undefined
	const plantId = params?.plantId

	const where: any = { plantId }
	if (type) {
		where.type = { equals: type }
	}

	try {
		const [plantActions, total] = await Promise.all([
			prisma.plantAction.findMany({
				where: where,
				orderBy: { createdAt: "desc" },
				skip: skip,
				take: limit,
			}),
			prisma.plantAction.count({
				where: where,
			}),
		])

		const totalPages = total > 0 ? Math.ceil(total / limit) : 0
		return {
			data: plantActions,
			total,
			page,
			totalPages,
		}
	} catch (error) {
		console.error("Error fetching plant actions:", error)
	}
}

//Добавление действия с растением (полив, удобрение)
export const createNewPlantAction = async (params: PlantActionData) => {
	const { plantId, type, note } = params
	console.log("params", params)
	if (!type || !plantId) {
		throw new Error("Plant action type&plantId is required")
	}

	return prisma.plantAction.create({
		data: {
			type,
			plantId,
			note: note || null,
		},
	})
}
