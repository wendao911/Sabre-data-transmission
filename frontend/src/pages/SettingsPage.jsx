import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Divider, 
  Typography, 
  Space,
  message,
  Row,
  Col
} from 'antd';
import { 
  SettingOutlined, 
  UserOutlined, 
  SecurityScanOutlined,
  BellOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const { Title, Paragraph } = Typography;
const { Option } = Select;

const SettingsPage = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // 模拟保存设置
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('设置保存成功！');
    } catch (error) {
      message.error('设置保存失败！');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Title level={2} className="flex items-center">
          <SettingOutlined className="mr-3 text-blue-600" />
          系统设置
        </Title>
        <Paragraph type="secondary">
          配置应用程序的各种设置选项
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="个人信息" icon={<UserOutlined />}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
              initialValues={{
                name: user?.name || '',
                email: user?.email || '',
              }}
            >
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存个人信息
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="安全设置" icon={<SecurityScanOutlined />}>
            <Form layout="vertical">
              <Form.Item label="自动登录">
                <Switch defaultChecked />
              </Form.Item>

              <Form.Item label="会话超时时间">
                <Select defaultValue="30" style={{ width: '100%' }}>
                  <Option value="15">15分钟</Option>
                  <Option value="30">30分钟</Option>
                  <Option value="60">1小时</Option>
                  <Option value="120">2小时</Option>
                </Select>
              </Form.Item>

              <Form.Item label="密码策略">
                <Select defaultValue="medium" style={{ width: '100%' }}>
                  <Option value="low">低 - 6位以上</Option>
                  <Option value="medium">中 - 8位以上，包含字母和数字</Option>
                  <Option value="high">高 - 10位以上，包含字母、数字和特殊字符</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" loading={loading}>
                  保存安全设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="通知设置" icon={<BellOutlined />}>
            <Form layout="vertical">
              <Form.Item label="邮件通知">
                <Switch defaultChecked />
              </Form.Item>

              <Form.Item label="桌面通知">
                <Switch defaultChecked />
              </Form.Item>

              <Form.Item label="解密完成通知">
                <Switch defaultChecked />
              </Form.Item>

              <Form.Item label="文件上传通知">
                <Switch />
              </Form.Item>

              <Form.Item>
                <Button type="primary" loading={loading}>
                  保存通知设置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="数据管理" icon={<DatabaseOutlined />}>
            <Form layout="vertical">
              <Form.Item label="自动清理临时文件">
                <Switch defaultChecked />
              </Form.Item>

              <Form.Item label="文件保留期限">
                <Select defaultValue="30" style={{ width: '100%' }}>
                  <Option value="7">7天</Option>
                  <Option value="30">30天</Option>
                  <Option value="90">90天</Option>
                  <Option value="365">1年</Option>
                  <Option value="0">永久保留</Option>
                </Select>
              </Form.Item>

              <Form.Item label="最大文件大小">
                <Select defaultValue="100" style={{ width: '100%' }}>
                  <Option value="10">10MB</Option>
                  <Option value="50">50MB</Option>
                  <Option value="100">100MB</Option>
                  <Option value="500">500MB</Option>
                  <Option value="1000">1GB</Option>
                </Select>
              </Form.Item>

              <Divider />

              <Space direction="vertical" style={{ width: '100%' }}>
                <Button type="default" block>
                  清理临时文件
                </Button>
                <Button type="default" block>
                  导出设置
                </Button>
                <Button type="default" block>
                  重置所有设置
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>
      </Row>

      <Card title="关于应用">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div className="text-center">
              <Title level={4}>版本</Title>
              <Paragraph>1.0.0</Paragraph>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <Title level={4}>构建日期</Title>
              <Paragraph>{new Date().toLocaleDateString()}</Paragraph>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <Title level={4}>开发者</Title>
              <Paragraph>Leo</Paragraph>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SettingsPage;
