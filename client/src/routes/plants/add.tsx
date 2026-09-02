import { observer } from "mobx-react-lite"
import {
	Button,
	Card,
	Flex,
	Form,
	Input,
	message,
	Select,
	Space,
	Typography,
} from "antd"
import { ArrowLeftOutlined, QuestionCircleOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import plantStore from "../../store/plantStore"
import PlantSearchInput from "./components/PlantSearchInput"
import { useEffect } from "react"
import type { PlantbookSearchPlant } from "../../types/plantbook.types"
import plantbookStore from "../../store/plantbookStore"
import roomStore from "../../store/roomStore"
import styles from "./PlantPage.module.css"

const { Title, Text } = Typography

interface PlantFormValues {
	name: string
	commonName: string
	plantbookPid: string
	room?: string
}

const PlantAddPage = observer(() => {
	const navigate = useNavigate()
	const [form] = Form.useForm()

	const { rooms } = roomStore

	useEffect(() => {
		return () => {
			plantbookStore.clearSearchResults()
			plantbookStore.clearPlantDetails()
		}
	}, [])

	const handlePlantSelect = (plant: PlantbookSearchPlant) => {
		form.setFieldsValue({
			commonName: plant.display_pid,
			plantbookPid: plant.pid,
		})
	}

	const handleRoomSelect = (value: number) => {
		form.setFieldsValue({
			roomId: value,
		})
	}

	const handleRoomClear = () => {
		form.setFieldsValue({
			roomId: null,
		})
	}

	const handlePlantClear = () => {
		form.setFieldsValue({
			commonName: null,
			plantbookPid: null,
		})
	}

	const handleSubmit = async (values: PlantFormValues) => {
		console.log("Submitting form with values:", values)
		const result = await plantStore.createPlant(values)
		if (result.success) {
			message.success("Растение успешно добавлено!")
			navigate("/plants")
		} else {
			message.error(result.error)
		}
	}

	const roomOptions = (rooms || []).map(room => ({
		label: room.name,
		value: room.id,
	}))

	return (
		<div className={styles.container}>
			<Card className={styles.card}>
				<Space orientation="vertical" size="large" style={{ width: "100%" }}>
					<Button
						type="text"
						icon={<ArrowLeftOutlined />}
						onClick={() => navigate("/plants")}></Button>
					<Flex align="center" className={styles.header}>
						<Title level={2} className={styles.title}>
							Добавить растение
						</Title>
					</Flex>

					<Form form={form} layout="vertical" onFinish={handleSubmit}>
						<Form.Item
							name="name"
							label="Имя растения"
							rules={[{ required: true, message: "Дайте растению имя" }]}>
							<Input
								placeholder="Имя растения"
								className={styles.customInput}
							/>
						</Form.Item>

						<Form.Item
							name="commonName"
							label={
								<Flex gap={10}>
									<Text>Вид растения</Text>
									<Text type="secondary">
										<QuestionCircleOutlined
											style={{ color: "#7aad8c", fontSize: 12, marginRight: 4 }}
										/>
										Введите вид растения на английском языке
									</Text>
								</Flex>
							}
							rules={[{ required: true, message: "Введите вид растения" }]}>
							<PlantSearchInput
								onSelect={handlePlantSelect}
								onClear={handlePlantClear}
							/>
						</Form.Item>

						<Form.Item name="plantbookPid" hidden>
							<Input />
						</Form.Item>

						<Form.Item name="roomId" label="Комната">
							<Select
								placeholder="Комната"
								className={styles.customInput}
								options={roomOptions}
								onSelect={handleRoomSelect}
								allowClear
								onClear={handleRoomClear}
							/>{" "}
						</Form.Item>
						<Form.Item>
							<Button
								type="primary"
								htmlType="submit"
								className={styles.customButton}
								loading={plantStore.plantIsLoading}
								block
								size="large">
								Добавить растение
							</Button>
						</Form.Item>
					</Form>
				</Space>
			</Card>
		</div>
	)
})

export default PlantAddPage
