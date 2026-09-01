import dotenv from "dotenv"

dotenv.config()

import app from "./app"

const PORT = Number(process.env.PORT) || 5000

if (!process.env.VERCEL) {
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`)
	})
}

export default app
