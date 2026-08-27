import { Button, Popconfirm, Space, Typography } from 'antd';
import {
	ArrowLeftOutlined,
	DeleteOutlined,
	EditOutlined,
} from '@ant-design/icons';
import type { Plant } from '../../../types/plant.types';

const { Title } = Typography;

interface PlantHeaderProps {
	plant: Plant;
	onBack: () => void;
	onNameUpdate: (name: string) => void | Promise<void>;
	onDelete: () => void | Promise<void>;
}

export default function PlantHeader({ plant, onBack, onNameUpdate, onDelete }: PlantHeaderProps) {
	return (
		<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
			<Space>
				<Button
					type="text"
					icon={<ArrowLeftOutlined />}
					onClick={onBack}
				>
				</Button>

				<Title
					level={2}
					style={{ margin: 0 }}
					editable={{
						icon: <EditOutlined />,
						tooltip: 'Редактировать имя растения',
						onChange: (value) => {
							const nextName = value.trim();
							if (nextName && nextName !== (plant.name ?? '')) {
								onNameUpdate(nextName);
							}
						},
					}}
				>
					{plant.name ?? 'Без имени'}
				</Title>
			</Space>

			<Popconfirm
				title="Удалить растение?"
				description="Это действие нельзя отменить"
				onConfirm={onDelete}
				okText="Да, удалить"
				cancelText="Отмена"
				okType="danger"
			>
				<Button danger icon={<DeleteOutlined />}>
				</Button>
			</Popconfirm>
		</div>
	);
}
