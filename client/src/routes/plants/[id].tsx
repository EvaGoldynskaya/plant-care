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
	console.log("Plantbook details:", plantbook)

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
		console.log("handlePlantAction result:", result)
		if (!result.success) {
			message.error(result.error)
		}
	}

	if (isLoading || isPlantbookLoading) {
		return (
			<div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
				<Skeleton active avatar paragraph={{ rows: 8 }} />
			</div>
		)
	}

	if (!plant) {
		return (
			<div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
				<Card>
					<Empty description="Растение не найдено">
						<Button type="primary" onClick={() => navigate("/plants")}>
							Вернуться к списку
						</Button>
					</Empty>
				</Card>
			</div>
		)
	}

	return (
		<div style={{ padding: 24, maxWidth: 1300, margin: "0 auto" }}>
			<Space orientation="vertical" size="large" style={{ width: "100%" }}>
				<PlantHeader
					plant={plant}
					onBack={() => navigate("/plants")}
					onNameUpdate={handleNameUpdate}
					onDelete={handleDelete}
				/>

				<Card>
					<Descriptions column={3}>
						<Descriptions.Item label="Вид">
							{plant.commonName}
						</Descriptions.Item>
						{plantbook != null && (
							<>
								<Descriptions.Item label="Семейство">
									{plantbook.category}
								</Descriptions.Item>
								<Descriptions.Item label="Происхождение">
									{plantbook.origin}
								</Descriptions.Item>
							</>
						)}
					</Descriptions>
				</Card>
				{plantbook != null && (
					<Card>
						<Descriptions column={3}>
							<Descriptions.Item label="💡">
								{" "}
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
				<div style={{ display: "flex", gap: "0px", alignItems: "flex-start" }}>
					<div style={{ flex: "0 0 80%" }}>
						<PlantActionsTable plantActions={plant.actions} />
					</div>
					<div style={{ flex: "0 0 20%" }}>
						<PlantActionButtons
							plantId={plant.id}
							onAction={handlePlantAction}
						/>
					</div>
				</div>
			</Space>
		</div>
	)
})

export default PlantDetailsPage
