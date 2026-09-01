import cors from "cors"
import express, { NextFunction, Request, Response } from "express"
import helmet from "helmet"
import morgan from "morgan"

import routes from "./routes"

const app = express()

const vercelUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: undefined

const allowedOrigins = [
	"http://localhost:5173",
	"http://localhost:3000",
	"https://plant-care-pearl.vercel.app",
	...(vercelUrl ? [vercelUrl] : []),
]

const isVercelPreviewOrigin = (origin: string) =>
	origin.endsWith(".vercel.app")

app.use(helmet())
app.use(
	cors({
		origin: (origin, callback) => {
			if (
				!origin ||
				allowedOrigins.includes(origin) ||
				isVercelPreviewOrigin(origin)
			) {
				callback(null, true)
				return
			}
			callback(new Error("Not allowed by CORS"))
		},
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	})
)
app.use(express.json())
app.use(morgan("dev"))

app.use(routes)

app.get("/health", (_req: Request, res: Response) => {
	res.status(200).json({ status: "ok" })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	console.error(err)
	res.status(500).json({
		message: "Internal server error",
	})
})

export default app
