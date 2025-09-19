import React from 'react';
import { Modal, Form, Input, InputNumber, Switch, Button, Space, message, Select } from 'antd';
import { WifiOutlined } from '@ant-design/icons';

const ConfigForm = ({ 
  visible, 
  onCancel, 
  onSubmit, 
  onTest, 
  initialValues, 
  loading = false,
  t
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleTest = async () => {
    try {
      const values = await form.validateFields();
      await onTest(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={initialValues ? t('formTitle.edit') : t('formTitle.create')}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('cancel')}
        </Button>,
        <Button key="test" icon={<WifiOutlined />} onClick={handleTest}>
          {t('testConnectionBtn')}
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {initialValues ? t('update') : t('create')}
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
      >
        <Form.Item
          name="name"
          label={t('formFields.configName')}
          rules={[{ required: true, message: t('formFields.configNamePlaceholder') }]}
        >
          <Input placeholder={t('formFields.configNamePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="description"
          label={t('formFields.description')}
        >
          <Input.TextArea 
            placeholder={t('formFields.descriptionPlaceholder')} 
            rows={2}
          />
        </Form.Item>

        <Form.Item
          name="host"
          label={t('formFields.serverAddress')}
          rules={[{ required: true, message: t('formFields.serverAddressPlaceholder') }]}
        >
          <Input placeholder={t('formFields.serverAddressPlaceholder')} />
        </Form.Item>

        <Form.Item
          name="sftpPort"
          label={t('formFields.sftpPort')}
          rules={[{ required: true, message: t('formFields.sftpPortPlaceholder') }]}
        >
          <InputNumber 
            placeholder={t('formFields.sftpPortPlaceholder')} 
            min={1} 
            max={65535} 
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          name="user"
          label={t('formFields.username')}
          rules={[{ required: true, message: t('formFields.usernamePlaceholder') }]}
        >
          <Input placeholder={t('formFields.usernamePlaceholder')} />
        </Form.Item>

        <Form.Item
          name="password"
          label={t('formFields.password')}
          rules={[{ required: true, message: t('formFields.passwordPlaceholder') }]}
        >
          <Input.Password placeholder={t('formFields.passwordPlaceholder')} />
        </Form.Item>

        <Form.Item
          name="secure"
          label={t('formFields.secureConnection')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="userType"
          label={t('formFields.userType')}
        >
          <Select placeholder={t('formFields.userTypePlaceholder')}>
            <Select.Option value="authenticated">{t('formOptions.userType.authenticated')}</Select.Option>
            <Select.Option value="anonymous">{t('formOptions.userType.anonymous')}</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label={t('formFields.status')}
        >
          <Select placeholder={t('formFields.statusPlaceholder')}>
            <Select.Option value={0}>{t('formOptions.status.disabled')}</Select.Option>
            <Select.Option value={1}>{t('formOptions.status.enabled')}</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigForm;
