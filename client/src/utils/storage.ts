export const loadFromStorage = <T>(key: string): T | null => {
	const storage = globalThis.localStorage
	if (!storage) return null

	try {
		const saved = storage.getItem(key)
		if (!saved) return null

		return JSON.parse(saved)
	} catch {
		storage.removeItem(key)
		return null
	}
}
