import prisma from "../lib/prisma"
import {
	createNewPlant,
	createNewPlantAction,
	deletePlantById,
	getPlantActionsByPlant,
	getPlantByIdUser,
	getPlantsByUser,
	updatePlantById,
} from "./plant.service"

jest.mock("../lib/prisma", () => ({
	__esModule: true,
	default: {
		plant: {
			findMany: jest.fn(),
			count: jest.fn(),
			findUnique: jest.fn(),
			create: jest.fn(),
			findFirst: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
		plantAction: {
			findMany: jest.fn(),
			count: jest.fn(),
			create: jest.fn(),
		},
	},
}))

describe("plant.service", () => {
	const mockedPrisma = prisma as any

	beforeEach(() => {
		jest.clearAllMocks()
	})

	it("returns paginated plants for a user with search filter", async () => {
		mockedPrisma.plant.findMany.mockResolvedValue([
			{ id: 1, commonName: "Rose" },
		])
		mockedPrisma.plant.count.mockResolvedValue(1)

		const result = await getPlantsByUser(7, {
			page: 2,
			limit: 5,
			name: " Rose ",
		})

		expect(result).toEqual({
			data: [{ id: 1, commonName: "Rose" }],
			total: 1,
			page: 2,
			totalPages: 1,
		})

		expect(mockedPrisma.plant.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: {
					userId: 7,
					OR: [
						{ name: { contains: "Rose", mode: "insensitive" } },
						{ commonName: { contains: "Rose", mode: "insensitive" } },
					],
				},
				orderBy: { createdAt: "desc" },
				skip: 5,
				take: 5,
			})
		)
	})

	it("returns a single plant for a user by id", async () => {
		mockedPrisma.plant.findUnique.mockResolvedValue({
			id: 3,
			commonName: "Fern",
		})

		const result = await getPlantByIdUser(7, 3)

		expect(result).toEqual({ id: 3, commonName: "Fern" })
		expect(mockedPrisma.plant.findUnique).toHaveBeenCalledWith({
			where: { userId: 7, id: 3 },
		})
	})

	it("creates a plant with trimmed values and null fallbacks", async () => {
		mockedPrisma.plant.create.mockResolvedValue({ id: 10, commonName: "Rose" })

		await createNewPlant(7, {
			commonName: " Rose ",
			name: "   ",
			roomId: 2,
			plantbookPid: "pid-1",
		})

		expect(mockedPrisma.plant.create).toHaveBeenCalledWith({
			data: {
				commonName: "Rose",
				name: null,
				userId: 7,
				roomId: 2,
				plantbookPid: "pid-1",
			},
		})
	})

	it("throws when common name is missing while creating a plant", async () => {
		await expect(createNewPlant(5, { commonName: "   " })).rejects.toThrow(
			"Plant common name is required"
		)
	})

	it("updates a plant and preserves existing values when fields are empty", async () => {
		mockedPrisma.plant.findFirst.mockResolvedValue({
			id: 4,
			commonName: "Old name",
			name: "Old nickname",
			roomId: 9,
			userId: 7,
		})
		mockedPrisma.plant.update.mockResolvedValue({
			id: 4,
			commonName: "New name",
		})

		await updatePlantById(7, 4, {
			commonName: " New name ",
			name: "   ",
			roomId: 12,
		})

		expect(mockedPrisma.plant.update).toHaveBeenCalledWith({
			where: { id: 4 },
			data: {
				commonName: "New name",
				name: null,
				roomId: 12,
			},
		})
	})

	it("throws when updating a plant that does not belong to the user", async () => {
		mockedPrisma.plant.findFirst.mockResolvedValue(null)

		await expect(
			updatePlantById(7, 99, { commonName: "New plant" })
		).rejects.toThrow("Plant not found")
	})

	it("deletes a plant for the user", async () => {
		mockedPrisma.plant.findFirst.mockResolvedValue({ id: 22, userId: 7 })
		mockedPrisma.plant.delete.mockResolvedValue({ id: 22 })

		const result = await deletePlantById(7, 22)

		expect(result).toEqual({ id: 22 })
		expect(mockedPrisma.plant.delete).toHaveBeenCalledWith({
			where: { id: 22 },
		})
	})

	it("returns plant actions with filtering and pagination", async () => {
		mockedPrisma.plantAction.findMany.mockResolvedValue([
			{ id: 1, type: "water" },
		])
		mockedPrisma.plantAction.count.mockResolvedValue(1)

		const result = await getPlantActionsByPlant({
			page: 1,
			limit: 10,
			type: " water ",
			plantId: 4,
		})

		expect(result).toEqual({
			data: [{ id: 1, type: "water" }],
			total: 1,
			page: 1,
			totalPages: 1,
		})

		expect(mockedPrisma.plantAction.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { plantId: 4, type: { equals: "water" } },
				orderBy: { createdAt: "desc" },
				skip: 0,
				take: 10,
			})
		)
	})

	it("creates a plant action with required fields", async () => {
		mockedPrisma.plantAction.create.mockResolvedValue({ id: 7, type: "water" })

		await createNewPlantAction({ plantId: 4, type: "water", note: "  " })

		expect(mockedPrisma.plantAction.create).toHaveBeenCalledWith({
			data: {
				type: "water",
				plantId: 4,
				note: null,
			},
		})
	})

	it("throws when creating a plant action without required data", async () => {
		await expect(
			createNewPlantAction({ plantId: 0, type: "" })
		).rejects.toThrow("Plant action type&plantId is required")
	})
})
