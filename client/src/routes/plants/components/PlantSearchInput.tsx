import React, { useState, useEffect, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { Select, Spin, Empty } from "antd"
import { useDebounce } from "../../../hooks/useDebounce"
import plantbookStore from "../../../store/plantbookStore"
import type { PlantbookSearchPlant } from "../../../types/plantbook.types"
import styles from "../PlantPage.module.css"

interface PlantSearchInputProps {
	onSelect: (plant: PlantbookSearchPlant) => void
	onClear: () => void
	value?: string
}

const PlantSearchInput: React.FC<PlantSearchInputProps> = observer(
	({ onSelect, onClear, value }) => {
		const [searchQuery, setSearchQuery] = useState(value || "")
		const debouncedSearchQuery = useDebounce(searchQuery, 300)

		// Поиск при изменении debounced значения
		useEffect(() => {
			if (debouncedSearchQuery !== undefined) {
				plantbookStore.searchPlants(debouncedSearchQuery)
			}
		}, [debouncedSearchQuery])

		const handleSearch = useCallback((value: string) => {
			setSearchQuery(value)
		}, [])

		const handleSelect = useCallback(
			(pid: string) => {
				const selectedPlant = plantbookStore.searchResults.find(
					p => p.pid === pid
				)
				if (selectedPlant) {
					onSelect(selectedPlant)
				}
			},
			[onSelect]
		)

		const handleClear = useCallback(() => {
			onClear()
		}, [onClear])

		const options = plantbookStore.searchResults.map(plant => ({
			label: (
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<span>{plant.display_pid}</span>
				</div>
			),
			value: plant.pid,
		}))

		const notFoundContent = plantbookStore.isSearching ? (
			<Spin size="small" />
		) : searchQuery ? (
			<Empty description="Ничего не найдено" />
		) : (
			<Empty description="Начните вводить название" />
		)

		return (
			<Select
				placeholder={"Введите название растения"}
				value={value}
				onChange={handleSelect}
				options={options}
				loading={plantbookStore.isSearching}
				className={styles.customInput}
				showSearch={{
					onSearch: handleSearch,
					filterOption: false,
					autoClearSearchValue: false,
				}}
				allowClear
				onClear={handleClear}
				notFoundContent={notFoundContent}
				popupMatchSelectWidth={false}
				listHeight={256}
				status={plantbookStore.searchError ? "error" : undefined}
			/>
		)
	}
)

export default PlantSearchInput
