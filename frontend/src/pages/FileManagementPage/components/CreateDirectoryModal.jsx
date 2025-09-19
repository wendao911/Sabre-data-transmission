import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';

const CreateDirectoryModal = ({ visible, onCancel, onConfirm, currentPath }) => {
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
      title="创建新目录"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="创建"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          label="当前路径"
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
          label="目录名称"
          rules={[
            { required: true, message: '请输入目录名称' },
            { 
              pattern: /^[^<>:"/\\|?*]+$/, 
              message: '目录名称不能包含特殊字符 < > : " / \\ | ? *' 
            },
            { 
              max: 255, 
              message: '目录名称不能超过255个字符' 
            }
          ]}
        >
          <Input
            placeholder="请输入新目录名称"
            autoFocus
            onPressEnter={handleOk}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateDirectoryModal;
