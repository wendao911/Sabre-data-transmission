import React from 'react';
import { Modal, Form, Select, DatePicker, Button, Space } from 'antd';
import { SyncOutlined } from '@ant-design/icons';

const { Option } = Select;

const SyncModal = ({
  visible,
  syncType,
  syncDate,
  syncLoading,
  onClose,
  onSyncTypeChange,
  onSyncDateChange,
  onSync
}) => {
  return (
    <Modal 
      title="同步文件" 
      open={visible} 
      onCancel={onClose} 
      footer={null}
    >
      <Form onFinish={onSync}>
        <Form.Item label="同步类型" name="syncType" initialValue="encrypted">
          <Select onChange={onSyncTypeChange}>
            <Option value="encrypted">加密文件</Option>
            <Option value="decrypted">解密文件</Option>
          </Select>
        </Form.Item>
        <Form.Item 
          label="同步日期" 
          name="syncDate" 
          rules={[{ required: true, message: '请选择同步日期' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            onChange={onSyncDateChange} 
            placeholder="选择日期" 
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={syncLoading} 
              icon={<SyncOutlined />}
            >
              开始同步
            </Button>
            <Button onClick={onClose}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export { SyncModal };
