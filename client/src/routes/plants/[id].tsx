import {
	message,
	Skeleton,
	Card,
	Empty,
	Button,
	Space,
	Descriptions,
} from "antd"
import { observer } from "mobx-react-lite"
import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import plantStore from "../../store/plantStore"
import PlantHeader from "./components/PlantHeader"
import PlantActionButtons from "./components/PlantActionButtons"
import type { PlantActionRequest } from "../../types/plant.types"
import PlantActionsTable from "./components/PlantActionsTable"
import plantbookStore from "../../store/plantbookStore"
import roomStore from "../../store/roomStore"
import EditableRoomSelect from "./components/EditableRoomSelect"
import styles from "./PlantPage.module.css"

const PlantDetailsPage = observer(() => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const plantId = id ? parseInt(id, 10) : null

	useEffect(() => {
		console.log("useEffect plantId:", plantId)

		if (plantId && !isNaN(plantId)) {
			const loadData = async () => {
				try {
					const loadedPlant = await plantStore.setCurrentPlant(plantId)
					console.log("Plant loaded:", loadedPlant)

					if (loadedPlant?.plantbookPid) {
						try {
							await plantbookStore.getPlantDetails(loadedPlant.plantbookPid)
							console.log("Plantbook data loaded")
						} catch (plantbookError) {
							console.warn("Failed to load plantbook data:", plantbookError)
						}
					}
				} catch (error) {
					console.error("Failed to load plant:", error)
				}
			}

			loadData()
		}

		return () => {
			plantStore.clearCurrentPlant()
		}
	}, [plantId])

	const { getRoomName } = roomStore

	const {
		currentPlant: plant,
		plantIsLoading: isPlantLoading,
		currentPlantIsLoading: isActionsLoading,
	} = plantStore
	const {
		currentPlantbookPlant: plantbook,
		isLoadingPlantDetails: isPlantbookLoading,
	} = plantbookStore
	const isLoading = isPlantLoading || isActionsLoading || isPlantbookLoading

	const handleDelete = async () => {
		if (!plantId) return
		const result = await plantStore.deletePlant(plantId)
		if (result.success) {
			message.success("Растение удалено")
			navigate("/plants")
		} else {
			message.error(result.error)
		}
	}

	const handleNameUpdate = async (name: string) => {
		if (!plantId || !plant) return
		const result = await plantStore.updatePlant(plantId, { name })
		if (result.success) {
			message.success("Имя растения обновлено")
		} else {
			message.error(result.error)
		}
	}

	const handlePlantAction = async (action: PlantActionRequest) => {
		if (!plantId) return
		const result = await plantStore.createPlantAction(action)
		if (!result.success) {
			message.error(result.error)
		}
	}

	const handleRoomUpdate = async (roomId: number) => {
		if (!plant || !roomId) return
		const result = await plantStore.updatePlant(plant.id, { roomId: roomId })
		if (result.success) {
			message.success("Комната обновлена")
		} else {
			message.error(result.error)
		}
	}

	return (
		<div className={styles.container}>
			<div className={styles.mainLayout}>
				{isLoading || isPlantbookLoading ? (
					<div>
						<Skeleton active avatar paragraph={{ rows: 8 }} />
					</div>
				) : !plant ? (
					<div>
						<Empty description="Растение не найдено" />
					</div>
				) : (
				<Space
					orientation="vertical"
					size="large"
					style={{ width: "100%", height: "100%" }}>
					<PlantHeader
						plant={plant}
						onBack={() => navigate("/plants")}
						onNameUpdate={handleNameUpdate}
						onDelete={handleDelete}
					/>

					<Card style={{ height: 70 }} className={styles.roomCard}>
						<Descriptions column={4}>
							<Descriptions.Item label="Вид" span={1}>
								{plant.commonName}
							</Descriptions.Item>
							{plantbook != null && (
								<>
									<Descriptions.Item label="Семейство" span={1}>
										{plantbook.category}
									</Descriptions.Item>
									<Descriptions.Item label="Происхождение" span={1}>
										{plantbook.origin}
									</Descriptions.Item>
								</>
							)}
							<Descriptions.Item
								label="Комната"
								span={2}
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									minWidth: 210,
								}}>
								<EditableRoomSelect
									roomName={getRoomName(plant.roomId)}
									currentRoomId={plant.roomId}
									onRoomUpdate={handleRoomUpdate}></EditableRoomSelect>
							</Descriptions.Item>
						</Descriptions>
					</Card>
					{plantbook != null && (
						<Card className={styles.roomCard}>
							<Descriptions column={3}>
								<Descriptions.Item label="💡">
									{plantbook.care?.light}{" "}
								</Descriptions.Item>
								<Descriptions.Item label="💧">
									{plantbook.care?.humid}
								</Descriptions.Item>
								<Descriptions.Item label="🌱">
									{plantbook.care?.soil}
								</Descriptions.Item>
							</Descriptions>
						</Card>
					)}
					<Card className={styles.roomCard}>
						<div style={{ display: "flex" }}>
							<div style={{ flex: "0 0 80%" }}>
								<PlantActionsTable plantActions={plant.actions} />
							</div>
							<div>
								<PlantActionButtons
									plantId={plant.id}
									onAction={handlePlantAction}
								/>
							</div>
						</div>
					</Card>
				</Space>
				)}
			</div>
		</div>
	)
})

export default PlantDetailsPage
