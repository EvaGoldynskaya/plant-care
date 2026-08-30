import {
	Button,
	message,
	Space,
} from "antd"
import { observer } from "mobx-react-lite"
import { useNavigate } from "react-router-dom"
import authStore from "../../store/authStore"
import plantStore from "../../store/plantStore"
import dayjs from "dayjs"
import AllPlantsList from "./components/AllPlantsList"
import { useEffect } from "react"

const PlantsPage = observer(() => {
	const navigate = useNavigate()

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

	const handleAddRoom = () => {
		navigate("/plants/add")
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
					<Button color="blue" variant="solid" onClick={handleAddRoom}>
						Добавить команту
					</Button>
				</Space>
				<Space size="middle" wrap>
					<Button onClick={handleLogout} color="danger" variant="outlined">
						Выйти
					</Button>
				</Space>
			</div>
			<AllPlantsList formatDate={formatDate}></AllPlantsList>
		</div>
	)
})

export default PlantsPage
