import { Router } from "express"

import userRoutes from "./user.routes"
import plantRoutes from "./plant.routes"
import roomRoutes from "./room.routes"

const router = Router()

router.use("/api", userRoutes)
router.use("/api", plantRoutes)
router.use("/api", roomRoutes)

export default router
