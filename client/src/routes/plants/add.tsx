import { observer } from 'mobx-react-lite';
import { Button, Card, Form, Input, message, Space, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import plantStore from '../../store/plantStore';
import PlantSearchInput from './components/PlantSearchInput';
import { useEffect } from 'react';
import type { PlantbookSearchPlant } from '../../types/plantbook.types';
import plantbookStore from '../../store/plantbookStore';

const { Title } = Typography;

const PlantAddPage = observer(() => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    return () => {
      plantbookStore.clearSearchResults();
      plantbookStore.clearPlantDetails();
    };
  }, []);

  const handlePlantSelect = (plant: PlantbookSearchPlant) => {
    form.setFieldsValue({
      commonName: plant.display_pid,
      plantbookPid: plant.pid,
    });
    console.log('Выбрано растение, plantbookPid =', plant.pid);
  };

  const handlePlantClear = () => {
    form.setFieldsValue({
      commonName: null,
      plantbookPid: null,
    });
  };


  const handleSubmit = async (values: any) => {
    console.log('Submitting form with values:', values);
    const result = await plantStore.createPlant(values);
    if (result.success) {
      message.success('Растение успешно добавлено!');
      navigate('/plants');
    } else {
      message.error(result.error);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <Space orientation ="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/plants')}
          >
            Назад
          </Button>
          <Title level={2} style={{ margin: 0 }}>Добавить растение</Title>
        </div>

        <Card>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Имя растения"
              rules={[{ required: true, message: 'Дайте растению имя' }]}
            >
              <Input placeholder="Имя растения" />
            </Form.Item>

            <Form.Item
              name="commonName"
              label="Вид растения"
              rules={[{ required: true, message: 'Введите вид растения' }]}
            >
              <PlantSearchInput onSelect={handlePlantSelect} onClear={handlePlantClear}/>
            </Form.Item>

            <Form.Item name="plantbookPid" hidden>
              <Input/>
            </Form.Item>

            <Form.Item name="room" label="Комната">
              <Input placeholder="Комната" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={plantStore.plantIsLoading} block size="large">
                Добавить растение
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Space>
    </div>
  );
});

export default PlantAddPage;