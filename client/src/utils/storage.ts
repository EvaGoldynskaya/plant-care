export const loadFromStorage = <T>(key: string): T | null => {
	try {
		const saved = localStorage.getItem(key)
		if (!saved) return null

		return JSON.parse(saved)
	} catch {
		localStorage.removeItem(key)
		return null
	}
}
