import { Router } from "express"
import {
	getRooms,
	addRoom,
	updateRoom,
	deleteRoom,
} from "../controllers/room.controller"
import { authenticate } from "../middleware/auth"

const router = Router()

router.use(authenticate)
router.get("/rooms", getRooms)
router.post("/createRoom", addRoom)
router.put("/updateRoom/:id", updateRoom)
router.delete("/deleteRoom/:id", deleteRoom)

export default router
