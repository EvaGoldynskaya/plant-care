import {
	Menu,
	message,
	type MenuProps,
} from "antd"
import { observer } from "mobx-react-lite"
import { useNavigate } from "react-router-dom"
import authStore from "../../store/authStore"
import plantStore from "../../store/plantStore"
import dayjs from "dayjs"
import PlantsList from "./components/PlantsList"
import { useEffect, useState } from "react"
import RoomsList from "./components/RoomsList"
import { Content } from "antd/es/layout/layout"
import PlantListHeader from "./components/PlantListHeader"
import roomStore from "../../store/roomStore"

const PlantsPage = observer(() => {
	const navigate = useNavigate()
	const [selectedKey, setSelectedKey] = useState('1')

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

	const handleLogout = () => {
		plantStore.resetPlants()
		authStore.logout()
		navigate("/auth")
	}

	const handleAddRoom = async (name: string) => {
		const result = await roomStore.createRoom({"name": name})
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

	const handleMenuClick: MenuProps['onClick'] = (e) => {
    setSelectedKey(e.key)
  }

  const renderContent = () => {
    switch (selectedKey) {
      case '1':
        return <PlantsList key="plants" formatDate={formatDate}></PlantsList>
      case '2':
        return <RoomsList key="rooms" formatDate={formatDate}></RoomsList>
      default:
        return <PlantsList key="plants" formatDate={formatDate}></PlantsList>
    }
  }

	const items: MenuProps['items'] = [
    {
      key: '1',
      label: 'Все растения',
    },
    {
      key: '2',
      label: 'По комнатам',
    },
  ]

	return (
		<div style={{ padding: 24, maxWidth: 1300, margin: "0 auto" }}>
			<PlantListHeader onLogout={handleLogout} onAddRoom={handleAddRoom}></PlantListHeader>
			<Menu
        mode="horizontal"
        items={items}
        selectedKeys={[selectedKey]}
        onClick={handleMenuClick}
      />
      <Content style={{ padding: 24 }}>
        {renderContent()}
      </Content>
		</div>
	)
})

export default PlantsPage
