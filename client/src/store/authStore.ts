import { makeAutoObservable, runInAction } from "mobx"
import { authApi } from "../api"
import type { LoginData, RegisterData, AuthResponse } from "../types/auth.types"
import axios from "axios"

class AuthStore {
	user: AuthResponse["user"] | null = null
	token: string | null = localStorage.getItem("token")
	isLoading = false
	error: string | null = null

	constructor() {
		makeAutoObservable(this)
		this.restoreSession()
	}

	private restoreSession() {
		if (!this.token) return

		axios.defaults.headers.common["Authorization"] = `Bearer ${this.token}`

		const savedUser = localStorage.getItem("user")
		if (savedUser) {
			try {
				this.user = JSON.parse(savedUser)
			} catch {
				localStorage.removeItem("user")
			}
		}
	}

	setAuthData = (data: AuthResponse) => {
		this.user = data.user
		this.token = data.token
		localStorage.setItem("token", data.token)
		localStorage.setItem("user", JSON.stringify(data.user))
		axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`
	}

	clearAuthData = () => {
		this.user = null
		this.token = null
		localStorage.removeItem("token")
		localStorage.removeItem("user")
		delete axios.defaults.headers.common["Authorization"]
	}

	register = async (data: RegisterData) => {
		runInAction(() => {
			this.isLoading = true
			this.error = null
		})

		try {
			const response = await authApi.register(data)
			runInAction(() => {
				this.setAuthData(response)
				this.isLoading = false
			})
			return { success: true, data: response }
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Ошибка регистрации"
			runInAction(() => {
				this.error = message
				this.isLoading = false
			})
			return { success: false, error: message }
		}
	}

	login = async (data: LoginData) => {
		runInAction(() => {
			this.isLoading = true
			this.error = null
		})

		try {
			const response = await authApi.login(data)
			runInAction(() => {
				this.setAuthData(response)
				this.isLoading = false
			})
			return { success: true, data: response }
		} catch (error: unknown) {
			const message =
				axios.isAxiosError(error) && error.response?.data?.message
					? error.response.data.message
					: "Ошибка входа"
			runInAction(() => {
				this.error = message
				this.isLoading = false
			})
			return { success: false, error: message }
		}
	}

	logout = () => {
		this.clearAuthData()
	}

	get isAuthenticated(): boolean {
		return !!this.token
	}

	clearError = () => {
		this.error = null
	}
}

const authStore = new AuthStore()
export default authStore
