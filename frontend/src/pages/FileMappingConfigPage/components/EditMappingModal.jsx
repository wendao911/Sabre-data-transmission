import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  Row, 
  Col,
  Divider,
  message
} from 'antd';
import { useLanguage } from '../hooks/useLanguage';

const { TextArea } = Input;
const { Option } = Select;

const EditMappingModal = ({ visible, rule, onConfirm, onCancel }) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 当规则数据变化时，更新表单
  useEffect(() => {
    if (rule && visible) {
      form.setFieldsValue({
        description: rule.description,
        module: rule.module,
        enabled: rule.enabled,
        priority: rule.priority,
        source: {
          directory: rule.source?.directory || '',
          pattern: rule.source?.pattern || ''
        },
        destination: {
          path: rule.destination?.path || '',
          filename: rule.destination?.filename || '',
          conflict: rule.destination?.conflict || 'rename'
        },
        retryAttempts: rule.retry?.attempts || 3,
        retryDelay: rule.retry?.delay || 'exponential'
      });
    }
  }, [rule, visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 构建更新数据
      const ruleData = {
        ...values,
        retry: {
          attempts: values.retryAttempts || 3,
          delay: values.retryDelay || 'exponential'
        }
      };
      
      await onConfirm(ruleData);
    } catch (error) {
      if (error.errorFields) {
        message.error('请检查表单填写');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  if (!rule) return null;

  return (
    <Modal
      title="编辑映射规则"
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={800}
      okText="保存"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="description"
              label={t('description')}
              rules={[{ required: true, message: t('descriptionRequired') }]}
            >
              <TextArea 
                rows={2} 
                placeholder="请输入规则描述"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="module"
              label={t('module')}
              rules={[{ required: true, message: t('moduleRequired') }]}
            >
              <Select placeholder="请选择所属模块">
                <Option value="SAL">SAL</Option>
                <Option value="UPL">UPL</Option>
                <Option value="OWB">OWB</Option>
                <Option value="IWB">IWB</Option>
                <Option value="MAS">MAS</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="priority"
              label={t('priority')}
              rules={[
                { required: true, message: t('priorityRequired') },
                { type: 'number', min: 1, max: 1000, message: t('priorityRange') }
              ]}
            >
              <InputNumber 
                min={1} 
                max={1000} 
                style={{ width: '100%' }}
                placeholder="1-1000"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={['schedule', 'period']}
              label="周期"
              rules={[{ required: true, message: '请选择周期' }]}
            >
              <Select placeholder="请选择周期">
                <Option value="daily">每天</Option>
                <Option value="weekly">每周</Option>
                <Option value="monthly">每月</Option>
                <Option value="adhoc">非固定</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.schedule?.period !== cur.schedule?.period}>
              {({ getFieldValue }) => {
                const period = getFieldValue(['schedule', 'period']);
                if (period === 'weekly') {
                  return (
                    <Form.Item name={['schedule', 'weekdays']} label="周几" rules={[{ required: true, message: '请选择周几' }]}>
                      <Select mode="multiple" placeholder="选择周几">
                        <Option value={1}>周一</Option>
                        <Option value={2}>周二</Option>
                        <Option value={3}>周三</Option>
                        <Option value={4}>周四</Option>
                        <Option value={5}>周五</Option>
                        <Option value={6}>周六</Option>
                        <Option value={0}>周日</Option>
                      </Select>
                    </Form.Item>
                  );
                }
                if (period === 'monthly') {
                  return (
                    <Form.Item name={['schedule', 'monthDays']} label="每月几号" rules={[{ required: true, message: '请选择日期' }]}>
                      <Select mode="multiple" placeholder="选择日期">
                        {Array.from({ length: 31 }).map((_, i) => (
                          <Option key={i + 1} value={i + 1}>{i + 1}号</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">源文件配置</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={['source', 'directory']}
              label={t('sourceDirectory')}
              rules={[{ required: true, message: t('sourceDirectoryRequired') }]}
            >
              <Input 
                placeholder="/data/reports/{Date:YYYY-MM-DD}"
                addonBefore="目录"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['source', 'pattern']}
              label={t('sourcePattern')}
              rules={[{ required: true, message: t('sourcePatternRequired') }]}
            >
              <Input 
                placeholder="finance_*.csv"
                addonBefore="模式"
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">目标路径配置</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={['destination', 'path']}
              label={t('destinationPath')}
              rules={[{ required: true, message: t('destinationPathRequired') }]}
            >
              <Input 
                placeholder="/incoming/finance/{date}"
                addonBefore="路径"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name={['destination', 'filename']}
              label={t('destinationFilename')}
              rules={[{ required: true, message: t('destinationFilenameRequired') }]}
            >
              <Input 
                placeholder="{baseName}{ext}"
                addonBefore="文件名"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name={['destination', 'conflict']}
              label={t('conflictStrategy')}
            >
              <Select>
                <Option value="overwrite">{t('overwrite')}</Option>
                <Option value="rename">{t('rename')}</Option>
                <Option value="skip">{t('skip')}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">重试配置</Divider>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="retryAttempts"
              label={t('retryAttempts')}
              rules={[
                { type: 'number', min: 0, max: 10, message: t('retryAttemptsRange') }
              ]}
            >
              <InputNumber 
                min={0} 
                max={10} 
                style={{ width: '100%' }}
                placeholder="0-10"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="retryDelay"
              label={t('retryDelay')}
            >
              <Select>
                <Option value="linear">{t('linear')}</Option>
                <Option value="exponential">{t('exponential')}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
          <div className="font-medium mb-1">变量说明：</div>
          <div>• <code>{'{Date:YYYY-MM-DD}'}</code> - 所选日期，格式：2023-09-19</div>
          <div>• <code>{'{date}'}</code> - 所选日期，格式：20230919</div>
          <div>• <code>{'{baseName}'}</code> - 原文件名（不含扩展名）</div>
          <div>• <code>{'{ext}'}</code> - 文件扩展名</div>
        </div>
      </Form>
    </Modal>
  );
};

export default EditMappingModal;
