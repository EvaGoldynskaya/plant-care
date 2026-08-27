import { Form, Input, Button, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import authStore from '../../../store/authStore';
import type { LoginData } from '../../../types/auth.types';
import styles from '../AuthPage.module.css';

interface LoginFormProps {
  className?: string;
  onSuccess?: () => void;
}

const LoginForm = observer(({ className, onSuccess }: LoginFormProps) => {
  const handleFinish = async (values: LoginData) => {
    const result = await authStore.login(values);
    if (result.success) {
      onSuccess?.();
    } else {
      message.error(result.error || 'Ошибка входа');
    }
  };

  return (
    <Form
      name="login"
      onFinish={handleFinish}
      layout="vertical"
      size="large"
      className={className}
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Введите email' },
          { type: 'email', message: 'Введите корректный email' },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Email"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: 'Введите пароль' },
          { min: 6, message: 'Пароль должен содержать минимум 6 символов' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Пароль"
          autoComplete="current-password"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={authStore.isLoading}
          className={styles.submitButton}
        >
          Войти
        </Button>
      </Form.Item>
    </Form>
  );
});

export default LoginForm;
