import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useLanguage } from '../hooks/useLanguage';

const CreateDirectoryModal = ({ visible, onCancel, onConfirm, currentPath }) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onConfirm(values.directoryName);
      form.resetFields();
      setLoading(false);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={t('createDirectory.title')}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={t('createDirectory.create')}
      cancelText={t('createDirectory.cancel')}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          label={t('createDirectory.currentPath')}
          extra={`将在 ${currentPath || '根目录'} 下创建新目录`}
        >
          <Input
            value={currentPath || '/'}
            disabled
            className="bg-gray-50"
          />
        </Form.Item>
        
        <Form.Item
          name="directoryName"
          label={t('createDirectory.directoryName')}
          rules={[
            { required: true, message: t('createDirectory.validation.required') },
            { 
              pattern: /^[^<>:"/\\|?*]+$/, 
              message: t('createDirectory.validation.invalidChars')
            },
            { 
              max: 255, 
              message: t('createDirectory.validation.maxLength')
            }
          ]}
        >
          <Input
            placeholder={t('createDirectory.directoryNamePlaceholder')}
            autoFocus
            onPressEnter={handleOk}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDirectoryModal;
