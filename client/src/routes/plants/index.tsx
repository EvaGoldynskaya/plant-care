import { Flex, message, Tabs } from "antd"
import { observer } from "mobx-react-lite"
import { useNavigate } from "react-router-dom"
import authStore from "../../store/authStore"
import plantStore from "../../store/plantStore"
import dayjs from "dayjs"
import PlantsList from "./components/PlantsList"
import { useEffect, useState } from "react"
import RoomsList from "./components/RoomsList"
import PlantListHeader from "./components/PlantListHeader"
import roomStore from "../../store/roomStore"
import styles from "./PlantPage.module.css"

const PlantsPage = observer(() => {
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState<string>("plants")

	useEffect(() => {
		const loadPlants = async () => {
			const result = await plantStore.fetchPlants()
			if (!result.success) {
				message.error(result.error)
			}
		}
		const loadRooms = async () => {
			console.log("loadRooms")
			const result = await roomStore.fetchRooms()
			console.log("result", result)
			if (!result.success) {
				message.error(result.error)
			}
		}

		loadPlants()
		loadRooms()
	}, [])

	const handleTabChange = (key: string) => {
		setActiveTab(key)
	}

	const handleLogout = () => {
		plantStore.resetPlants()
		authStore.logout()
		navigate("/auth")
	}

	const handleAddRoom = async (name: string) => {
		const result = await roomStore.createRoom({ name: name })
		console.log("result", result)
		if (!result.success) {
			message.error(result.error)
		} else {
			message.success("Комната добавлена")
		}
	}

	const formatDate = (dateString: string): string => {
		return dayjs(dateString).format("DD-MM-YYYY HH:mm")
	}

	return (
		<div className={styles.container}>
			<Flex className={styles.mainLayout} vertical>
				<div className={styles.headerWrapper}>
					<PlantListHeader
						onLogout={handleLogout}
						onAddRoom={handleAddRoom}></PlantListHeader>
				</div>
				<Tabs
					activeKey={activeTab}
					onChange={handleTabChange}
					className={styles.customTabs}
					items={[
						{
							key: "plants",
							label: "Все растения",
							children: (
								<PlantsList key="plants" formatDate={formatDate}></PlantsList>
							),
						},
						{
							key: "rooms",
							label: "По комнатам",
							children: (
								<RoomsList key="rooms" formatDate={formatDate}></RoomsList>
							),
						},
					]}
				/>
			</Flex>
		</div>
	)
})

export default PlantsPage
