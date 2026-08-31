import { Button, Input,  Space } from "antd"
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface PlantHeaderProps {
	onLogout: () => void
	onAddRoom: (name:string) => void 
}

export default function PlantListHeader({
	onLogout,
	onAddRoom,
}: PlantHeaderProps) {
  const navigate = useNavigate()

  const [roomName, setRoomName] = useState('')

  const handleAddPlant = () => {
		navigate("/plants/add")
	}

  const handleAddRoom = () => {
		onAddRoom(roomName)
    setRoomName('')
	}

	return (
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
        <Space.Compact style={{ width: '100%' }}>
          <Input value={roomName} placeholder="Название комнаты..." onChange={(e) => setRoomName(e.target.value)} />
          <Button type="primary" onClick={handleAddRoom} disabled={!roomName.trim()}><PlusOutlined /></Button>
        </Space.Compact>
      </Space>
      <Space size="middle" wrap>
        <Button onClick={onLogout} color="danger" variant="outlined">
          Выйти
        </Button>
      </Space>
    </div>
	)
}
