import { Button, Form, Radio, Space } from "antd"
import {
	plantActionType,
	type PlantActionRequest,
} from "../../../types/plant.types"
import TextArea from "antd/es/input/TextArea"
import styles from "../PlantPage.module.css"

interface PlantActionButtonsProps {
	plantId: number
	onAction: (action: PlantActionRequest) => void | Promise<void>
}

export default function PlantActionButtons({
	plantId,
	onAction,
}: PlantActionButtonsProps) {
	const [form] = Form.useForm()

	const handleAction = async (values: { type: string; note: string }) => {
		const trimNote = values.note ? values.note.trim() : undefined
		await onAction({ plantId, type: values.type, note: trimNote })
	}

	return (
		<Form form={form} onFinish={handleAction}>
			<Space align="end" size="middle">
				<Space orientation="vertical" size="small">
					<Form.Item name="note" noStyle>
						<TextArea className={styles.customInput} placeholder="Заметка" rows={4} style={{ width: 200 }} />
					</Form.Item>

					<Form.Item
						name="type"
						rules={[{ required: true, message: "Выберите тип действия" }]}
						noStyle>
						<Radio.Group
							optionType="button"
							vertical
							className={styles.customRadioGroup}
							options={Object.entries(plantActionType).map(([_key, value]) => ({
								label: value,
								value: value,
							}))}></Radio.Group>
					</Form.Item>

					<Form.Item noStyle>
						<Button type="primary" htmlType="submit" className={styles.customButton} block>
							Добавить
						</Button>
					</Form.Item>
				</Space>
			</Space>
		</Form>
	)
}
