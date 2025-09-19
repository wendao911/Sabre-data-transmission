import React from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const CreateDirectoryModal = ({
  visible,
  currentPath,
  onClose,
  onCreate
}) => {
  return (
    <Modal 
      title="创建目录" 
      open={visible} 
      onCancel={onClose} 
      footer={null} 
      width={400}
    >
      <Form onFinish={onCreate}>
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            在目录: <code className="bg-gray-100 px-2 py-1 rounded">{currentPath}</code> 中创建
          </div>
        </div>
        <Form.Item 
          label="目录名称" 
          name="name" 
          rules={[
            { required: true, message: '请输入目录名称' }, 
            { pattern: /^[^/\\:*?"<>|]+$/, message: '目录名称不能包含特殊字符' }
          ]}
        >
          <Input placeholder="请输入目录名称" />
        </Form.Item>
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose}>
            取消
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<PlusOutlined />}
          >
            创建目录
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export { CreateDirectoryModal };
