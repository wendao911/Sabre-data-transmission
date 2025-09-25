import React from 'react';
import { Modal, Form, DatePicker, Button, Space } from 'antd';
import { RetweetOutlined } from '@ant-design/icons';

const SyncModal = ({ visible, syncDate, syncLoading, onClose, onSyncDateChange, onSync }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible) {
      if (syncDate) {
        form.setFieldsValue({ syncDate });
      } else {
        form.resetFields(['syncDate']);
      }
    }
  }, [visible, syncDate, form]);

  const handleFinish = (values) => {
    if (!values?.syncDate) return; // 由 Form 校验保证
    onSync(values.syncDate);
  };

  return (
    <Modal title="同步文件" open={visible} onCancel={onClose} footer={null}>
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <Form.Item label="同步日期" name="syncDate" rules={[{ required: true, message: '请选择同步日期' }]}>
          <DatePicker style={{ width: '100%' }} onChange={onSyncDateChange} placeholder="选择日期" />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={syncLoading} icon={<RetweetOutlined />}>
              开始同步
            </Button>
            <Button onClick={onClose}>取消</Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export { SyncModal };
