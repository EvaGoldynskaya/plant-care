import { Form, Input, Button, message } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import authStore from '../../../store/authStore';
import type { RegisterData } from '../../../types/auth.types';
import styles from '../AuthPage.module.css';

interface RegisterFormProps {
  className?: string;
  onSuccess?: () => void;
}

const RegisterForm = observer(({ className, onSuccess }: RegisterFormProps) => {
  const handleFinish = async (values: RegisterData) => {
    const { confirmPassword, ...registerData } = values;
    const result = await authStore.register(registerData);
    if (result.success) {
      onSuccess?.();
    } else {
      message.error(result.error || 'Ошибка регистрации');
    }
  };

  return (
    <Form
      name="register"
      onFinish={handleFinish}
      layout="vertical"
      size="large"
      className={className}
    >
      <Form.Item
        name="name"
        rules={[
          { required: true, message: 'Введите имя' },
          { min: 2, message: 'Имя должно содержать минимум 2 символа' },
        ]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="Имя"
          autoComplete="name"
        />
      </Form.Item>

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
          {
            pattern: /^(?=.*[A-Za-z])(?=.*\d)/,
            message: 'Пароль должен содержать буквы и цифры',
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Пароль"
          autoComplete="new-password"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Подтвердите пароль' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Пароли не совпадают'));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Подтвердите пароль"
          autoComplete="new-password"
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
          Зарегистрироваться
        </Button>
      </Form.Item>
    </Form>
  );
});

export default RegisterForm;
