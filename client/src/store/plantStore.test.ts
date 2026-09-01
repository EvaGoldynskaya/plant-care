import axios from "axios"
import { beforeEach, describe, expect, it, vi } from "vitest"
import plantStore from "./plantStore"
import { plantsApi } from "../api"

vi.mock("../api", () => ({
  plantsApi: {
    getPlants: vi.fn(),
    getPlantActions: vi.fn(),
    getPlantById: vi.fn(),
    createPlant: vi.fn(),
    updatePlant: vi.fn(),
    deletePlant: vi.fn(),
    createPlantAction: vi.fn(),
  },
}))

describe("plantStore", () => {
  beforeEach(() => {
    plantStore.resetPlants()
    vi.clearAllMocks()
  })

  it("fetches plants and stores paginated results", async () => {
    vi.mocked(plantsApi.getPlants).mockResolvedValue({
      data: [{ id: 1, commonName: "Rose", name: "Ruby", userId: 3, plantbookPid: "p1", roomId: 2, createdAt: "2024-01-01", updatedAt: "2024-01-02", actions: [], plantbook: {} as any }],
      total: 1,
      page: 1,
      totalPages: 1,
    })

    const result = await plantStore.fetchPlants("rose")

    expect(result.success).toBe(true)
    expect(plantStore.plants).toHaveLength(1)
    expect(plantStore.page).toBe(1)
    expect(plantStore.total).toBe(1)
    expect(plantsApi.getPlants).toHaveBeenCalledWith(1, 10, "rose")
  })

  it("sets current plant and loads actions when not already present", async () => {
    const plant = {
      id: 12,
      commonName: "Fern",
      name: "Greeny",
      userId: 3,
      plantbookPid: "p2",
      roomId: 1,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-02",
      actions: [],
      plantbook: {} as any,
    }

    vi.mocked(plantsApi.getPlantById).mockResolvedValue(plant)
    vi.mocked(plantsApi.getPlantActions).mockResolvedValue({
      data: [{ id: 55, type: "ПОЛИВ", note: "Watered", createdAt: "2024-01-03" }],
      total: 1,
      page: 1,
      totalPages: 1,
    })

    const result = await plantStore.setCurrentPlant(12)

    expect(result).toEqual(expect.objectContaining({ id: 12, commonName: "Fern" }))
    expect(plantStore.currentPlant?.actions).toHaveLength(1)
    expect(plantsApi.getPlantById).toHaveBeenCalledWith(12)
  })

  it("creates a plant and increments total", async () => {
    const payload = { commonName: "Sunflower", name: "Sunny", roomId: 4 }
    const newPlant = {
      id: 44,
      commonName: "Sunflower",
      name: "Sunny",
      userId: 3,
      plantbookPid: "p3",
      roomId: 4,
      createdAt: "2024-01-03",
      updatedAt: "2024-01-03",
      actions: [],
      plantbook: {} as any,
    }

    vi.mocked(plantsApi.createPlant).mockResolvedValue(newPlant)

    const result = await plantStore.createPlant(payload)

    expect(result.success).toBe(true)
    expect(plantStore.plants).toContainEqual(newPlant)
    expect(plantStore.total).toBe(1)
  })

  it("updates a plant and keeps current plant in sync", async () => {
    const existing = {
      id: 6,
      commonName: "Old",
      name: "Old name",
      userId: 3,
      plantbookPid: "p4",
      roomId: 1,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-02",
      actions: [],
      plantbook: {} as any,
    }

    plantStore.plants = [existing]
    plantStore.currentPlant = { ...existing }

    const updated = {
      ...existing,
      commonName: "New",
      name: "New name",
      roomId: 5,
      updatedAt: "2024-01-04",
    }

    vi.mocked(plantsApi.updatePlant).mockResolvedValue(updated)

    const result = await plantStore.updatePlant(6, {
      commonName: "New",
      name: "New name",
      roomId: 5,
    })

    expect(result.success).toBe(true)
    expect(plantStore.plants[0].commonName).toBe("New")
    expect(plantStore.currentPlant?.commonName).toBe("New")
  })

  it("deletes a plant and clears current plant if it matches", async () => {
    const plant = {
      id: 9,
      commonName: "Cactus",
      name: "Spike",
      userId: 3,
      plantbookPid: "p5",
      roomId: 7,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-02",
      actions: [],
      plantbook: {} as any,
    }

    plantStore.plants = [plant]
    plantStore.currentPlant = { ...plant }
    vi.mocked(plantsApi.deletePlant).mockResolvedValue(undefined)

    const result = await plantStore.deletePlant(9)

    expect(result.success).toBe(true)
    expect(plantStore.plants).toHaveLength(0)
    expect(plantStore.currentPlant).toBeNull()
  })

  it("stores an error when fetch plants fails", async () => {
    vi.spyOn(axios, "isAxiosError").mockReturnValue(true)
    vi.mocked(plantsApi.getPlants).mockRejectedValue({
      response: { data: { message: "Server error" } },
    })

    const result = await plantStore.fetchPlants()

    expect(result.success).toBe(false)
    expect(result.error).toBe("Server error")
    expect(plantStore.error).toBe("Server error")
  })

  it("adds a newly created plant action to the current plant", async () => {
    const currentPlant = {
      id: 2,
      commonName: "Aloe",
      name: "Aly",
      userId: 3,
      plantbookPid: "p6",
      roomId: 2,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-02",
      actions: [{ id: 1, type: "ПОЛИВ", note: "Old", createdAt: "2024-01-01" }],
      plantbook: {} as any,
    }

    plantStore.currentPlant = { ...currentPlant }
    plantStore.plants = [{ ...currentPlant }]

    vi.mocked(plantsApi.createPlantAction).mockResolvedValue({
      id: 2,
      type: "ПОЛИВ",
      note: "New watering",
      createdAt: "2024-01-04",
    })

    const result = await plantStore.createPlantAction({
      plantId: 2,
      type: "ПОЛИВ",
      note: "New watering",
    })

    expect(result.success).toBe(true)
    expect(plantStore.currentPlant?.actions).toHaveLength(2)
    expect(plantStore.currentPlant?.lastAction?.note).toBe("New watering")
  })
})
