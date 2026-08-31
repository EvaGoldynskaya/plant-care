import { useState, useMemo } from "react"

export const useSearch = <T>(
	items: T[],
	searchFields: (keyof T)[],
	initialSearch?: string
) => {
	const [searchTerm, setSearchTerm] = useState(initialSearch || "")

	const filteredItems = useMemo(() => {
		if (!searchTerm.trim()) {
			return items
		}

		const lowerSearch = searchTerm.toLowerCase().trim()
		return items.filter(item =>
			searchFields.some(field => {
				const value = item[field]
				return value && String(value).toLowerCase().includes(lowerSearch)
			})
		)
	}, [items, searchTerm, searchFields])

	return {
		searchTerm,
		setSearchTerm,
		filteredItems,
	}
}
