import { Request, Response } from "express"

import { loginUser, registerUser } from "../services/user.service"

export const register = async (req: Request, res: Response) => {
	try {
		const { email, password, name } = req.body

		const user = await registerUser({ email, password, name })

		res.status(201).json({
			message: "User registered successfully",
			user,
		})
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Registration failed"
		res.status(400).json({ message })
	}
}

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body

		const user = await loginUser({ email, password })

		res.status(200).json({
			message: "Login successful",
			user,
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : "Login failed"
		res.status(401).json({ message })
	}
}
