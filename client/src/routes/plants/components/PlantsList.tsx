import React from "react"
import {
	Flex,
	Listy,
	message,
	Pagination,
	Typography,
	Spin,
	Empty,
	Input,
} from "antd"
import plantStore from "../../../store/plantStore"
import type { Plant } from "../../../types/plant.types"
import { useNavigate } from "react-router-dom"
import { observer } from "mobx-react-lite"
import { useSearch } from "../../../hooks/useSearch"
import roomStore from "../../../store/roomStore"
import styles from "../PlantPage.module.css"

interface PlantsListProps {
	formatDate: (dateString: string) => string
}

const PlantsList = observer(({ formatDate }: PlantsListProps) => {
	const navigate = useNavigate()

	const {
		plants,
		page: plantPage,
		limit: plantLimit,
		total: totalPlants,
		changePage,
		plantIsLoading,
	} = plantStore
	const { getRoomName } = roomStore
	const { searchTerm, setSearchTerm, filteredItems } = useSearch(plants, [
		"name",
		"commonName",
	])

	const handlePlantClick = (id: number) => {
		navigate(`/plants/${id}`)
	}

	const handlePageChange = async (page: number) => {
		if (plantPage !== page) {
			changePage(page)

			const result = await plantStore.fetchPlants()
			if (!result.success) {
				message.error(result.error)
			}
		}
	}

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value)
		changePage(1)
	}

	if (plantIsLoading) {
		return (
			<div style={{ textAlign: "center", padding: 48 }}>
				<Spin size="large" />
			</div>
		)
	}

	if (plants == undefined || plants.length === 0) {
		return <Empty description="У вас пока нет растений" />
	}

	return (
		<Flex vertical gap="middle">
			<Input
				placeholder="Поиск растения..."
				value={searchTerm}
				onChange={handleSearch}
				className={styles.customInput}
				allowClear
			/>
			<Listy<Plant>
				items={filteredItems}
				rowKey="id"
				height={1000}
				itemRender={item => (
					<div
						onClick={() => handlePlantClick(item.id)}
						className={styles.plantsListItem}>
						<Flex gap="middle" align="flex-start">
							<Flex vertical flex="auto" style={{ minWidth: 0 }}>
								<Flex justify="space-between" gap="small">
									<Typography.Text strong>
										{item.name} - {item.commonName}
									</Typography.Text>
									{item.roomId && (
										<Typography.Text type="secondary">
											Находится в {getRoomName(item.roomId)}
										</Typography.Text>
									)}
								</Flex>
								<Flex justify="left" gap="small">
									{item.lastAction?.createdAt && (
										<Typography.Text type="secondary">
											Последний полив: {formatDate(item.lastAction.createdAt)}
										</Typography.Text>
									)}
								</Flex>
							</Flex>
						</Flex>
					</div>
				)}
			/>
			<Pagination
				current={plantPage}
				pageSize={plantLimit}
				total={totalPlants}
				className={styles.customPagination}
				onChange={handlePageChange}
			/>
		</Flex>
	)
})

export default PlantsList
