import { useState } from "react"
import { useNavigate } from "react-router-dom"
import authStore from "../../store/authStore"
import { observer } from "mobx-react-lite"
import { Card, Tabs, Typography, message } from "antd"
import LoginForm from "./components/LoginForm"
import RegisterForm from "./components/RegisterForm"
import styles from "./AuthPage.module.css"

const { Title, Text } = Typography

const AuthPage = observer(() => {
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState<string>("login")

	const { clearError, error } = authStore

	const handleAuthSuccess = () => {
		message.success(
			activeTab === "login" ? "Добро пожаловать!" : "Регистрация успешна!"
		)
		navigate("/plants")
	}

	const handleTabChange = (key: string) => {
		setActiveTab(key)
		clearError()
	}

	return (
		<div className={styles.container}>
			<Card className={styles.card}>
				<div className={styles.header}>
					<Title level={2} className={styles.title}>
						Добро пожаловать
					</Title>
					<Text type="secondary" className={styles.subtitle}>
						Войдите или создайте новый аккаунт
					</Text>
				</div>

				<Tabs
					activeKey={activeTab}
					onChange={handleTabChange}
					className={styles.customTabs}
					centered
					destroyOnHidden
					items={[
						{
							key: "login",
							label: "Вход",
							children: (
								<LoginForm
									className={styles.form}
									onSuccess={handleAuthSuccess}
								/>
							),
						},
						{
							key: "register",
							label: "Регистрация",
							children: (
								<RegisterForm
									className={styles.form}
									onSuccess={handleAuthSuccess}
								/>
							),
						},
					]}
				/>

				{error && (
					<div className={styles.errorContainer}>
						<Text type="danger">{error}</Text>
					</div>
				)}
			</Card>
		</div>
	)
})

export default AuthPage
