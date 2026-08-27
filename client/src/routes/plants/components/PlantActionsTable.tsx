import { Flex, Table, Tag  } from "antd";
import dayjs from 'dayjs';
import type { PlantAction } from "../../../types/plant.types";

interface PlantActionsTableProps {
  plantActions: PlantAction[];
}

const formatDate = (dateString: string): string => {
  return dayjs(dateString).format('DD-MM-YYYY HH:mm');
};

const columns = [
  {
    title: 'Действие',
    dataIndex: 'type',
    key: 'type',
    width: 150,
    render: (tag: string) => {
      let color = tag === 'ПОЛИВ'? 'geekblue' : 'green';
      return (
        <Flex gap="small" align="center" wrap>
          <Tag color={color} key={tag}>
            {tag.toUpperCase()}
          </Tag>
        </Flex>
      );
    },
    sorter: (a:PlantAction, b:PlantAction) => a.type.localeCompare(b.type),
  },
  {
    title: 'Дата',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150,
    render: (value: string) => {
      return formatDate(value);
    },
    sorter: (a:PlantAction, b:PlantAction) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    defaultSortOrder: 'descend' as const
  },
  {
    title: 'Заметка',
    dataIndex: 'note',
    key: 'note',
  },
]

export default function PlantActionsTable({plantActions}: PlantActionsTableProps) {
	return (  
    <Table dataSource={plantActions} rowKey="id" columns={columns} style={{ width: '80%' }} pagination={false}/>
	);
}
