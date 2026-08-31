import { Button, Input,  Space, Tooltip } from "antd"
import { PlusOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styles from "../PlantPage.module.css"

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
        <Button className={styles.customButton} variant="solid" onClick={handleAddPlant}>
          Добавить растение
        </Button>
        <Space.Compact style={{ width: '100%' }}>
          <Input value={roomName} className={styles.customInput} placeholder="Добавить комнату..." onChange={(e) => setRoomName(e.target.value)} />
          <Button type="primary" className={styles.customButton} onClick={handleAddRoom} disabled={!roomName.trim()}><PlusOutlined /></Button>
        </Space.Compact>
      </Space>
      <Space size="middle" wrap>
        <Tooltip placement="left" title="Выйти" color="#ffffff">
          <Button onClick={onLogout} color="danger" variant="outlined">
            <LogoutOutlined />
          </Button>
        </Tooltip>
      </Space>
    </div>
	)
}
