import { Flex, Listy, Typography, Spin, Empty, Collapse } from "antd";
import plantStore from "../../../store/plantStore"
import type { Plant } from "../../../types/plant.types";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import roomStore from "../../../store/roomStore";
import { EditOutlined } from "@ant-design/icons"

const { Panel } = Collapse

interface RoomListProps {
  formatDate: (dateString: string) => string
}

const RoomsList = observer(({ formatDate }: RoomListProps) => {
  const navigate = useNavigate()

  const {rooms, isLoading, updateRoom}  = roomStore
  const { plants, plantIsLoading } = plantStore

  const handlePlantClick = (id: number) => {
    navigate(`/plants/${id}`)
  }

  const handleRoomUpdate = (roomId: number, name: string) => {
    updateRoom(roomId,  {"name": name})
  }


  const getPlantsByRoom = (roomId: number) => {
    return plants.filter(plant => plant.roomId === roomId)
  }

  if (isLoading || plantIsLoading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!rooms || rooms.length === 0) {
    return <Empty description="У вас пока нет комнат" />
  }

  return (
     <Collapse accordion>
      {rooms.map(room => {
        const filteredPlants = getPlantsByRoom(room.id)

        return (
          <Panel
            key={room.id}
            header={
              <Flex justify="space-between" align="center">
                <Typography.Text
                  style={{ margin: 0 }}
                  editable={{
                    icon: <EditOutlined />,
                    tooltip: "Редактировать название комнаты",
                    onChange: value => {
                      const nextName = value.trim()
                      if (nextName && nextName !== (room.name ?? "")) {
                        handleRoomUpdate(room.id, nextName)
                      }
                    },
                  }}>
                  {room.name}
                </Typography.Text>
                <Typography.Text type="secondary">{filteredPlants.length} растений </Typography.Text>
              </Flex>
            }
          >
          <Flex vertical gap="middle">              
            <Listy<Plant>
              items={filteredPlants}
              rowKey="id"
              height={1000}
              itemRender={item => (
                <div onClick={() => handlePlantClick(item.id)}>
                  <Flex gap="middle" align="flex-start">
                    <Flex vertical flex="auto" style={{ minWidth: 0 }}>
                      <Flex justify="space-between" gap="small">
                        <Typography.Text strong>{item.name} - {item.commonName}</Typography.Text>
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
          </Flex>
        </Panel>
        )
      })}
    </Collapse>
  )
})

export default RoomsList