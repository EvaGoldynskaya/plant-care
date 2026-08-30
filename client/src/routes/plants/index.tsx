import { useEffect } from "react"
import {
	Button,
	Empty,
	Flex,
	Listy,
	Space,
	Spin,
	Typography,
	message,
} from "antd"
import { observer } from "mobx-react-lite"
import { useNavigate } from "react-router-dom"
import authStore from "../../store/authStore"
import plantStore from "../../store/plantStore"
import type { Plant } from "../../types/plant.types"
import dayjs from "dayjs"

const PlantsPage = observer(() => {
	const navigate = useNavigate()

	const { plants, plantIsLoading: isLoading } = plantStore

	useEffect(() => {
		const loadPlants = async () => {
			const result = await plantStore.fetchPlants()
			if (!result.success) {
				message.error(result.error)
			}
		}
		loadPlants()
	}, [])

	const handleLogout = () => {
		plantStore.resetPlants()
		authStore.logout()
		navigate("/auth")
	}

	const handleAddPlant = () => {
		navigate("/plants/add")
	}

	const handlePlantClick = (id: number) => {
		//setCurrentPlant(id)
		navigate(`/plants/${id}`)
	}

	const formatDate = (dateString: string): string => {
		return dayjs(dateString).format("DD-MM-YYYY HH:mm")
	}

	return (
		<div style={{ padding: 24, maxWidth: 1300, margin: "0 auto" }}>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-start",
					marginBottom: 24,
				}}>
				<Space size="middle" wrap>
					<Button color="green" variant="solid" onClick={handleAddPlant}>
						Добавить растение
					</Button>
				</Space>
				<Space size="middle" wrap>
					<Button onClick={handleLogout} color="danger" variant="outlined">
						Выйти
					</Button>
				</Space>
			</div>

			{isLoading ? (
				<div style={{ textAlign: "center", padding: 48 }}>
					<Spin size="large" />
				</div>
			) : plants.length === 0 ? (
				<>
					<Empty description="У вас пока нет растений" />
				</>
			) : (
				<Listy<Plant>
					items={plants}
					rowKey="id"
					height={400}
					itemRender={item => (
						<div onClick={() => handlePlantClick(item.id)}>
							<Flex gap="middle" align="flex-start">
								<Flex vertical flex="auto" style={{ minWidth: 0 }}>
									<Flex justify="space-between" gap="small">
										<Typography.Text strong>{item.name}</Typography.Text>
									</Flex>
									<Flex justify="left" gap="small">
										<Typography.Text type="secondary">
											{item.commonName}
										</Typography.Text>
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
			)}
		</div>
	)
})

export default PlantsPage
