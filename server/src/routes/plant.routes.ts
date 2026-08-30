import { Router } from "express"

import {
	createPlant,
	createPlantAction,
	deletePlant,
	getPlantActions,
	getPlantById,
	getPlants,
	updatePlant,
} from "../controllers/plant.controller"
import { authenticate } from "../middleware/auth"

const router = Router()

router.use(authenticate)
router.get("/plants", getPlants)
router.get("/plants/:id", getPlantById)
router.post("/createPlant", createPlant)
router.put("/updatePlant/:id", updatePlant)
router.delete("/deletePlant/:id", deletePlant)

router.get("/plantActions", getPlantActions)
router.post("/createPlantAction", createPlantAction)

export default router
