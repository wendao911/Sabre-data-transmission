import React from 'react';
import { Modal, Form, Input, Button, Space } from 'antd';
import { CloudDownloadOutlined } from '@ant-design/icons';

const DownloadModal = ({
  visible,
  onClose,
  onDownload
}) => {
  return (
    <Modal 
      title="下载文件" 
      open={visible} 
      onCancel={onClose} 
      footer={null}
    >
      <Form onFinish={onDownload}>
        <Form.Item 
          label="远程文件路径" 
          name="remotePath" 
          rules={[{ required: true, message: '请输入远程文件路径' }]}
        >
          <Input placeholder="/remote/path/file.txt" />
        </Form.Item>
        <Form.Item 
          label="本地文件路径" 
          name="localPath" 
          rules={[{ required: true, message: '请输入本地文件路径' }]}
        >
          <Input placeholder="/path/to/local/file.txt" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<CloudDownloadOutlined />}
            >
              下载
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

export { DownloadModal };
