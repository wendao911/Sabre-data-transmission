import React, { useEffect, useState } from 'react';
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
  Col,
  Radio,
  Table,
  Tag,
  Popconfirm
} from 'antd';
import { 
  SettingOutlined, 
  CloudServerOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { ftpAPI, scheduleAPI } from '../services/api';

const { Title, Paragraph } = Typography;
const { Option } = Select;
const { Group: RadioGroup } = Radio;

const SettingsPage = () => {
  const { user } = useAuth();
  const [ftpForm] = Form.useForm();
  const [decryptForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [userType, setUserType] = useState('authenticated'); // 'anonymous' 或 'authenticated'
  const [ftpConfigs, setFtpConfigs] = useState([]);
  const [activeFtpConfig, setActiveFtpConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFtpConnected, setIsFtpConnected] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadFtpConfigs();
    loadScheduleConfigs();
    checkFtpConnectionStatus();
  }, []);

  // 加载 FTP 配置列表
  const loadFtpConfigs = async () => {
    setLoading(true);
    try {
      const [configsResp, activeResp] = await Promise.all([
        scheduleAPI.getFtpConfigs(),
        scheduleAPI.getActiveFtpConfig()
      ]);
      
      if (configsResp?.success) {
        setFtpConfigs(configsResp.data || []);
      }
      
      if (activeResp?.success && activeResp.data) {
        setActiveFtpConfig(activeResp.data);
        ftpForm.setFieldsValue(activeResp.data);
        // 使用数据库中存储的用户类型，如果没有则根据用户名判断
        if (activeResp.data.userType) {
          setUserType(activeResp.data.userType);
        } else if (activeResp.data.user && activeResp.data.user.trim() !== '') {
          setUserType('authenticated');
        } else {
          setUserType('anonymous');
        }
      }
    } catch (e) {
      console.error('加载 FTP 配置失败:', e);
    } finally {
      setLoading(false);
    }
  };

  // 加载调度配置
  const loadScheduleConfigs = async () => {
    try {
      const configs = await scheduleAPI.getConfigs();
      if (Array.isArray(configs)) {
        const dec = configs.find(x => x.taskType === 'decrypt');
        if (dec) decryptForm.setFieldsValue({ cron: dec.cron, enabled: dec.enabled, offsetDays: dec.params?.offsetDays || 1 });
        const trans = configs.find(x => x.taskType === 'transfer');
        if (trans) transferForm.setFieldsValue({ cron: trans.cron, enabled: trans.enabled, offsetDays: trans.params?.offsetDays || 1 });
      }
    } catch (e) {
      console.error('加载调度配置失败:', e);
    }
  };

  // 检查 FTP 连接状态
  const checkFtpConnectionStatus = async () => {
    try {
      const resp = await ftpAPI.getStatus();
      setIsFtpConnected(resp?.success && resp.data?.connected);
    } catch (e) {
      console.error('检查 FTP 连接状态失败:', e);
      setIsFtpConnected(false);
    }
  };

  // 处理用户类型变化
  const handleUserTypeChange = (e) => {
    const value = e.target.value;
    setUserType(value);
    if (value === 'anonymous') {
      // 切换到匿名用户时，清空用户名和密码
      ftpForm.setFieldsValue({
        user: '',
        password: ''
      });
    }
  };

  // 保存 FTP 配置
  const handleSaveFtpConfig = async (values) => {
    setSaving(true);
    try {
      const configToSave = { ...values };
      configToSave.userType = userType; // 保存用户类型
      
      if (userType === 'anonymous') {
        configToSave.user = '';
        configToSave.password = '';
      }
      
      // 生成配置名称
      if (!configToSave.name) {
        configToSave.name = `${configToSave.host}:${configToSave.port || 21}`;
      }
      
      const resp = await scheduleAPI.createFtpConfig(configToSave);
      if (resp?.success) {
        if (resp.isUpdate) {
          message.success('FTP 配置已更新');
        } else {
          message.success('FTP 配置已创建');
        }
        await loadFtpConfigs(); // 重新加载配置列表
      } else {
        message.error('保存配置失败');
      }
    } catch (e) {
      message.error('保存配置失败');
    } finally {
      setSaving(false);
    }
  };

  // 连接 FTP
  const handleConnectFtp = async () => {
    setConnecting(true);
    try {
      const values = ftpForm.getFieldsValue();
      const connectParams = { ...values };
      if (userType === 'anonymous') {
        connectParams.user = '';
        connectParams.password = '';
      }
      const resp = await ftpAPI.connect(connectParams);
      if (resp?.success) {
        message.success('FTP 连接成功');
        setIsFtpConnected(true);
      } else {
        message.warning(resp?.message || '连接失败');
        setIsFtpConnected(false);
      }
    } catch (e) {
      message.error('连接失败');
      setIsFtpConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  // 激活 FTP 配置
  const handleActivateFtpConfig = async (id) => {
    try {
      const resp = await scheduleAPI.activateFtpConfig(id);
      if (resp?.success) {
        message.success('FTP 配置已激活');
        await loadFtpConfigs();
      } else {
        message.error('激活失败');
      }
    } catch (e) {
      message.error('激活失败');
    }
  };

  // 删除 FTP 配置
  const handleDeleteFtpConfig = async (id) => {
    try {
      const resp = await scheduleAPI.deleteFtpConfig(id);
      if (resp?.success) {
        message.success('FTP 配置已删除');
        await loadFtpConfigs();
      } else {
        message.error('删除失败');
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  // 编辑 FTP 配置
  const handleEditFtpConfig = (record) => {
    if (isFtpConnected) {
      message.warning('请先断开 FTP 连接再编辑配置');
      return;
    }
    
    // 填充表单数据
    ftpForm.setFieldsValue(record);
    setUserType(record.userType || 'authenticated');
    setIsEditing(true);
    message.info('已加载配置到编辑表单');
  };

  // 新建配置
  const handleNewConfig = () => {
    if (isFtpConnected) {
      message.warning('请先断开 FTP 连接再新建配置');
      return;
    }
    
    ftpForm.resetFields();
    setUserType('authenticated');
    setIsEditing(false);
    message.info('已清空表单，可以新建配置');
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
        <Col xs={24}>
          <Card title="FTP 配置列表" icon={<CloudServerOutlined />}>
            <Table
              dataSource={ftpConfigs}
              loading={loading}
              rowKey="_id"
              pagination={false}
              columns={[
                {
                  title: '配置名称',
                  dataIndex: 'name',
                  key: 'name',
                },
                {
                  title: '主机',
                  dataIndex: 'host',
                  key: 'host',
                },
                {
                  title: '端口',
                  dataIndex: 'port',
                  key: 'port',
                },
                {
                  title: '用户类型',
                  dataIndex: 'userType',
                  key: 'userType',
                  render: (userType) => (
                    <Tag color={userType === 'authenticated' ? 'blue' : 'orange'}>
                      {userType === 'authenticated' ? '普通用户' : '匿名用户'}
                    </Tag>
                  ),
                },
                {
                  title: '用户',
                  dataIndex: 'user',
                  key: 'user',
                  render: (user) => user || '匿名',
                },
                {
                  title: 'FTPS',
                  dataIndex: 'secure',
                  key: 'secure',
                  render: (secure) => (
                    <Tag color={secure ? 'green' : 'default'}>
                      {secure ? '是' : '否'}
                    </Tag>
                  ),
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 1 ? 'green' : 'default'}>
                      {status === 1 ? '正在使用' : '未使用'}
                    </Tag>
                  ),
                },
                {
                  title: '更新时间',
                  dataIndex: 'updatedAt',
                  key: 'updatedAt',
                  render: (date) => new Date(date).toLocaleString(),
                },
                {
                  title: '操作',
                  key: 'actions',
                  render: (_, record) => (
                    <Space>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => handleEditFtpConfig(record)}
                        disabled={isFtpConnected}
                      >
                        编辑
                      </Button>
                      {record.status !== 1 && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => handleActivateFtpConfig(record._id)}
                        >
                          激活
                        </Button>
                      )}
                      <Popconfirm
                        title="确定要删除这个配置吗？"
                        onConfirm={() => handleDeleteFtpConfig(record._id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="link" size="small" danger>
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={`1) ${isEditing ? '编辑' : '配置'}FTP并连接`}
            icon={<CloudServerOutlined />}
            extra={
              <Space>
                {!isFtpConnected && (
                  <Button 
                    type="default" 
                    size="small"
                    onClick={handleNewConfig}
                  >
                    新建配置
                  </Button>
                )}
                {isFtpConnected && (
                  <Tag color="green">FTP 已连接</Tag>
                )}
              </Space>
            }
          > 
            {isFtpConnected ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: '#666', marginBottom: '16px' }}>
                  FTP 已连接，无法修改配置。请先断开连接。
                </p>
                <Button 
                  type="default" 
                  onClick={async () => {
                    try {
                      const resp = await ftpAPI.disconnect();
                      if (resp?.success) {
                        message.success('FTP 已断开连接');
                        setIsFtpConnected(false);
                      } else {
                        message.error('断开连接失败');
                      }
                    } catch (e) {
                      message.error('断开连接失败');
                    }
                  }}
                >
                  断开连接
                </Button>
              </div>
            ) : (
              <Form form={ftpForm} layout="vertical" onFinish={handleSaveFtpConfig}>
                <Form.Item label="用户类型">
                  <RadioGroup value={userType} onChange={handleUserTypeChange}>
                    <Radio value="authenticated">普通用户</Radio>
                    <Radio value="anonymous">匿名用户</Radio>
                  </RadioGroup>
                </Form.Item>
                
                <Form.Item name="name" label="配置名称">
                  <Input placeholder="例如：生产环境FTP" />
                </Form.Item>
                
                <Form.Item name="host" label="主机" rules={[{ required: true, message: '请输入主机' }]}>
                  <Input placeholder="例如 10.0.0.1" />
                </Form.Item>
                
                <Form.Item name="port" label="端口">
                  <Input placeholder="21" />
                </Form.Item>
                
                {userType === 'authenticated' && (
                  <>
                    <Form.Item name="user" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                      <Input placeholder="用户名" />
                    </Form.Item>
                    <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                      <Input.Password placeholder="密码" />
                    </Form.Item>
                  </>
                )}
                
                <Form.Item name="secure" label="FTPS" valuePropName="checked">
                  <Switch />
                </Form.Item>
                
                <Space>
                  <Button type="primary" htmlType="submit" loading={saving}>
                    {isEditing ? '更新配置' : '保存配置'}
                  </Button>
                  <Button type="default" onClick={handleConnectFtp} loading={connecting}>
                    连接
                  </Button>
                </Space>
              </Form>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="2) 配置解密定时器" icon={<ClockCircleOutlined />}> 
            <Form form={decryptForm} layout="vertical" onFinish={async (values) => {
              setSaving(true);
              try {
                await scheduleAPI.update({ taskType: 'decrypt', cron: values.cron, enabled: values.enabled, params: { offsetDays: values.offsetDays || 1 } });
                message.success('解密定时器已更新');
              } catch (e) { message.error('更新失败'); } finally { setSaving(false); }
            }} initialValues={{ enabled: false, offsetDays: 1 }}>
              <Form.Item name="cron" label="启动时间 (Cron)" rules={[{ required: true, message: '请输入 Cron 表达式' }]}>
                <Input placeholder="例如 0 3 * * * (每天03:00)" />
              </Form.Item>
              <Form.Item name="offsetDays" label="偏移天数">
                <Input placeholder="1 表示前一天" />
              </Form.Item>
              <Form.Item name="enabled" label="启用">
                <Switch />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving}>保存</Button>
                <Button onClick={async () => {
                  try { await scheduleAPI.run({ taskType: 'decrypt', offsetDays: decryptForm.getFieldValue('offsetDays') || 1 }); message.success('已触发手动解密'); }
                  catch { message.error('触发失败'); }
                }}>手动运行</Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="3) 配置FTP文件传输定时器" icon={<CloudUploadOutlined />}> 
            <Form form={transferForm} layout="vertical" onFinish={async (values) => {
              setSaving(true);
              try {
                await scheduleAPI.update({ taskType: 'transfer', cron: values.cron, enabled: values.enabled, params: { offsetDays: values.offsetDays || 1 } });
                message.success('传输定时器已更新');
              } catch (e) { message.error('更新失败'); } finally { setSaving(false); }
            }} initialValues={{ enabled: false, offsetDays: 1 }}>
              <Form.Item name="cron" label="启动时间 (Cron)" rules={[{ required: true, message: '请输入 Cron 表达式' }]}>
                <Input placeholder="例如 0 2 * * * (每天02:00)" />
              </Form.Item>
              <Form.Item name="offsetDays" label="偏移天数">
                <Input placeholder="1 表示前一天" />
              </Form.Item>
              <Form.Item name="enabled" label="启用">
                <Switch />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving}>保存</Button>
                <Button onClick={async () => {
                  try { await scheduleAPI.run({ taskType: 'transfer', offsetDays: transferForm.getFieldValue('offsetDays') || 1 }); message.success('已触发手动传输'); }
                  catch { message.error('触发失败'); }
                }}>手动运行</Button>
              </Space>
            </Form>
          </Card>
        </Col>
      </Row>

      
    </div>
  );
};

export default SettingsPage;
