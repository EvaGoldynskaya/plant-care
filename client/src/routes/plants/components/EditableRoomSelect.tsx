import { useState } from 'react'
import { Space, Typography, Select, Button } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { observer } from 'mobx-react-lite'
import roomStore from '../../../store/roomStore'
import type { Room } from '../../../types/room.types'
import { CheckOutlined } from '@ant-design/icons';
import styles from "../PlantPage.module.css"

interface EditableRoomSelectProps {
  roomName: string
  currentRoomId: number | null
  onRoomUpdate: (roomId: number) => Promise<void> | void
}

const EditableRoomSelect = observer(({ 
  roomName,
  currentRoomId, 
  onRoomUpdate 
}: EditableRoomSelectProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedRoomId, setSelectedRoomId] = useState<number>()

  const { rooms } = roomStore

  const handleEditClick = () => {
    setIsEditing(true)
    if (currentRoomId) {
      setSelectedRoomId(currentRoomId)
    }
  }

  const handleSave = async () => {
    if (selectedRoomId === currentRoomId) {
      setIsEditing(false)
      return
    }
    if (selectedRoomId){
      onRoomUpdate(selectedRoomId)
    }
    setIsEditing(false)
  }

  const roomOptions = (rooms || []).map((room: Room) => ({
    label: room.name,
    value: room.id,
  }))

  if (isEditing) {
    return (
      <Space.Compact style={{ width: '100%'}}>
        <Select
          size ="small"
          style={{ width: 110}}
          className={styles.customInput}
          placeholder="Комната..."
          value={selectedRoomId}
          onChange={(value) => setSelectedRoomId(value)}
          options={roomOptions}
          showSearch
          autoFocus
        />
        <Button 
          type="primary"
          size ="small"
          className={styles.customButton}
          onClick={handleSave}
        >
          <CheckOutlined />
        </Button>
      </Space.Compact>
    )
  }

  return (
    <Space>
      <Typography.Text>{roomName}</Typography.Text>
      <EditOutlined 
        onClick={handleEditClick}
        className={styles.editIcon}
      />
    </Space>
  )
})

export default EditableRoomSelect