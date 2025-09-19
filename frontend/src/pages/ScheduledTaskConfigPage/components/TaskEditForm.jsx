import React from 'react';
import { Modal, Form, Input, Switch, Button, Space, Alert, Collapse } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Panel } = Collapse;

const TaskEditForm = ({
  visible,
  onCancel,
  onSubmit,
  initialValues,
  loading,
  t
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    } else if (!visible) {
      form.resetFields();
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (errorInfo) {
      console.log('Form validation failed:', errorInfo);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Modal
      title={t('editForm.title')}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          {t('cancel')}
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {t('save')}
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
          label={t('editForm.taskName')}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="description"
          label={t('editForm.description')}
        >
          <TextArea
            placeholder={t('editForm.descriptionPlaceholder')}
            rows={2}
          />
        </Form.Item>

        <Form.Item
          name="cron"
          label={t('editForm.cronExpression')}
          rules={[
            { required: true, message: t('editForm.cronPlaceholder') },
            {
              pattern: /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([012]?\d|3[01])) (\*|([0]?\d|1[0-2])) (\*|([0-6]))$/,
              message: t('messages.cronInvalid')
            }
          ]}
        >
          <Input
            placeholder={t('editForm.cronPlaceholder')}
            className="font-mono"
          />
        </Form.Item>

        <Form.Item
          name="enabled"
          label={t('editForm.enabled')}
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Collapse ghost>
          <Panel header={t('cronHelp.title')} key="cron-help">
            <Alert
              message={t('cronHelp.title')}
              description={
                <div>
                  <p className="mb-2">格式：秒 分 时 日 月 周</p>
                  <ul className="list-disc list-inside space-y-1">
                    {t('cronHelp.examples').map((example, index) => (
                      <li key={index} className="text-sm">{example}</li>
                    ))}
                  </ul>
                </div>
              }
              type="info"
              icon={<InfoCircleOutlined />}
            />
          </Panel>
        </Collapse>
      </Form>
    </Modal>
  );
};

export default TaskEditForm;
