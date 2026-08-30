import { Flex, Listy, message, Pagination, Typography, Spin, Empty, Input } from "antd";
import plantStore from "../../../store/plantStore"
import type { Plant } from "../../../types/plant.types";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useSearch } from "../../../hooks/useSearch";

interface AllPlantsListProps {
  formatDate: (dateString: string) => string
}

const AllPlantsList = observer(({ formatDate }: AllPlantsListProps) => {
  const navigate = useNavigate()

  const { plants, plantPage, plantLimit, totalPlants, changePage, plantIsLoading } = plantStore
  const { searchTerm, setSearchTerm, filteredItems } = useSearch(plants,['name', 'commonName'])
  console.log("totalPlants", totalPlants)

  const handlePlantClick = (id: number) => {
    navigate(`/plants/${id}`)
  }

  const handlePageChange = async (page: number) => {
    if (plantPage !== page) {
      changePage(page) 
      
      const result = await plantStore.fetchPlants()
      if (!result.success) {
        message.error(result.error)
      }
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    changePage(1)
  }

  if (plantIsLoading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin size="large" />
      </div>
    )
  }

  if (plants.length === 0) {
    return <Empty description="У вас пока нет растений" />
  }

  return (
    <Flex vertical gap="middle">
      <Input
        placeholder="Поиск растения..."
        value={searchTerm}
        onChange={handleSearch}
        variant="underlined"
        allowClear
      />
      <Listy<Plant>
        items={filteredItems}
        rowKey="id"
        height={1000}
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
      <Pagination
        current={plantPage}
        pageSize={plantLimit}
        total={totalPlants}
        onChange={handlePageChange}
      />
    </Flex>
  )
})

export default AllPlantsList