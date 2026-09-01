import {
  createPlant,
  deletePlant,
  getPlantActions,
  getPlants,
} from "./plant.controller"
import * as plantService from "../services/plant.service"

jest.mock("../services/plant.service", () => ({
  getPlantsByUser: jest.fn(),
  getPlantByIdUser: jest.fn(),
  createNewPlant: jest.fn(),
  updatePlantById: jest.fn(),
  deletePlantById: jest.fn(),
  getPlantActionsByPlant: jest.fn(),
  createNewPlantAction: jest.fn(),
}))

const makeRes = () => {
  const res: any = {
    statusCode: 200,
    body: undefined,
  }

  res.status = jest.fn((code: number) => {
    res.statusCode = code
    return res
  })
  res.json = jest.fn((payload: any) => {
    res.body = payload
    return res
  })

  return res
}

describe("plant.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns 401 when user is not authenticated for getPlants", async () => {
    const req: any = { user: undefined, query: {} }
    const res = makeRes()

    await getPlants(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ message: "Unauthorized" })
  })

  it("returns plants list on success", async () => {
    const req: any = { user: { id: 5 }, query: { page: "1", limit: "10" } }
    const res = makeRes()

    ;(plantService.getPlantsByUser as jest.Mock).mockResolvedValue({
      data: [{ id: 1, commonName: "Rose" }],
      total: 1,
      page: 1,
      totalPages: 1,
    })

    await getPlants(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      data: [{ id: 1, commonName: "Rose" }],
      total: 1,
      page: 1,
      totalPages: 1,
    })
  })

  it("creates a plant and returns 201", async () => {
    const req: any = {
      user: { id: 5 },
      body: { commonName: "Sunflower", name: "Sunny" },
    }
    const res = makeRes()

    ;(plantService.createNewPlant as jest.Mock).mockResolvedValue({
      id: 12,
      commonName: "Sunflower",
    })

    await createPlant(req, res)

    expect(plantService.createNewPlant).toHaveBeenCalledWith(5, req.body)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({
      message: "Plant created",
      plant: { id: 12, commonName: "Sunflower" },
    })
  })

  it("returns 404 when delete throws an error", async () => {
    const req: any = { user: { id: 5 }, params: { id: "99" } }
    const res = makeRes()

    ;(plantService.deletePlantById as jest.Mock).mockRejectedValue(
      new Error("Plant not found")
    )

    await deletePlant(req, res)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ message: "Plant not found" })
  })

  it("returns plant actions list on success", async () => {
    const req: any = {
      user: { id: 5 },
      query: { page: "1", limit: "10", type: "water", plantId: "4" },
    }
    const res = makeRes()

    ;(plantService.getPlantActionsByPlant as jest.Mock).mockResolvedValue({
      data: [{ id: 1, type: "water" }],
      total: 1,
      page: 1,
      totalPages: 1,
    })

    await getPlantActions(req, res)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      data: [{ id: 1, type: "water" }],
      total: 1,
      page: 1,
      totalPages: 1,
    })
  })
})
