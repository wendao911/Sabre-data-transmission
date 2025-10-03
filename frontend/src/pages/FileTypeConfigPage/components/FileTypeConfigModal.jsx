import React from 'react';
import { Modal, Form, Input, Select, Switch, InputNumber, Button, Space, Row, Col } from 'antd';
import { useLanguage } from '../hooks/useLanguage';

const { Option } = Select;
const { TextArea } = Input;

const FileTypeConfigModal = ({
  visible,
  title,
  form,
  onSubmit,
  onCancel,
  moduleOptions,
  initialValues = {}
}) => {
  const { t } = useLanguage();
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={initialValues}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('formSerialNumber')}
              name="serialNumber"
              rules={[]}
            >
              <InputNumber
                min={1}
                style={{ width: '100%' }}
                placeholder={t('formSerialNumberPlaceholder')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('formModule')}
              name="module"
              rules={[{ required: true, message: t('validationModuleRequired') }]}
            >
              <Select placeholder={t('formModulePlaceholder')}>
                {moduleOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          label={t('formFileType')}
          name="fileType"
          rules={[]}
        >
          <Input placeholder={t('formFileTypePlaceholder')} />
        </Form.Item>
        
        <Form.Item
          label={t('formPushPath')}
          name="pushPath"
          rules={[]}
        >
          <Input placeholder={t('formPushPathPlaceholder')} />
        </Form.Item>
        
        <Form.Item
          label={t('formRemark')}
          name="remark"
        >
          <TextArea
            rows={3}
            placeholder={t('formRemarkPlaceholder')}
          />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('formStatus')}
              name="enabled"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren={t('switchEnabled')} unCheckedChildren={t('switchDisabled')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('formSortWeight')}
              name="sortWeight"
              initialValue={0}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder={t('formSortWeightPlaceholder')}
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={onCancel}>
              {t('btnCancel')}
            </Button>
            <Button type="primary" htmlType="submit">
              {t('btnConfirm')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FileTypeConfigModal;
