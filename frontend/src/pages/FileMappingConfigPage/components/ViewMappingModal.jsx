import React, { useState } from 'react';
import { Modal, Descriptions, Tag, Divider, Button, Tabs } from 'antd';
import { CodeOutlined, FileTextOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';

const ViewMappingModal = ({ visible, rule, onCancel }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('form');

  if (!rule) return null;

  const formatConflictStrategy = (strategy) => {
    switch (strategy) {
      case 'overwrite': return <Tag color="red">{t('overwrite')}</Tag>;
      case 'rename': return <Tag color="blue">{t('rename')}</Tag>;
      case 'skip': return <Tag color="default">{t('skip')}</Tag>;
      default: return <Tag>{strategy}</Tag>;
    }
  };

  const formatRetryDelay = (delay) => {
    switch (delay) {
      case 'linear': return <Tag color="blue">{t('linear')}</Tag>;
      case 'exponential': return <Tag color="purple">{t('exponential')}</Tag>;
      default: return <Tag>{delay}</Tag>;
    }
  };

  const formatModule = (module) => {
    const moduleColors = {
      'SAL': 'blue',
      'UPL': 'green',
      'OWB': 'orange',
      'IWB': 'purple',
      'MAS': 'cyan'
    };
    return <Tag color={moduleColors[module] || 'default'}>{module}</Tag>;
  };

  // 格式化JSON数据
  const formatJsonData = (data) => {
    return JSON.stringify(data, null, 2);
  };

  // 渲染表单视图
  const renderFormView = () => (
    <>
      <Descriptions column={1} bordered>
        <Descriptions.Item label={t('description')}>
          {rule.description}
        </Descriptions.Item>
        
        <Descriptions.Item label={t('module')}>
          {formatModule(rule.module)}
        </Descriptions.Item>
        
        <Descriptions.Item label={t('priority')}>
          {rule.priority}
        </Descriptions.Item>
        
        <Descriptions.Item label={t('enabled')}>
          <Tag color={rule.enabled ? 'green' : 'red'}>
            {rule.enabled ? t('enabledTag') : t('disabledTag')}
          </Tag>
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">{t('sourceConfig')}</Divider>
      
      <Descriptions column={1} bordered>
        <Descriptions.Item label={t('sourceDirectory')}>
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            {rule.source?.directory || '-'}
          </code>
        </Descriptions.Item>
        
        <Descriptions.Item label={t('sourcePattern')}>
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            {rule.source?.pattern || '-'}
          </code>
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">{t('destinationConfig')}</Divider>
      
      <Descriptions column={1} bordered>
        <Descriptions.Item label={t('destinationPath')}>
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            {rule.destination?.path || '-'}
          </code>
        </Descriptions.Item>
        
        <Descriptions.Item label={t('destinationFilename')}>
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            {rule.destination?.filename || '-'}
          </code>
        </Descriptions.Item>
        
        <Descriptions.Item label={t('conflictStrategy')}>
          {formatConflictStrategy(rule.destination?.conflict)}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">{t('retryConfig')}</Divider>
      
      <Descriptions column={1} bordered>
        <Descriptions.Item label={t('retryAttempts')}>
          {rule.retry?.attempts || 0}
        </Descriptions.Item>
        
        <Descriptions.Item label={t('retryDelay')}>
          {formatRetryDelay(rule.retry?.delay)}
        </Descriptions.Item>
      </Descriptions>
    </>
  );

  // 渲染JSON视图
  const renderJsonView = () => (
    <div className="bg-gray-50 p-4 rounded">
      <pre className="text-sm text-gray-800 overflow-auto max-h-96">
        <code>{formatJsonData(rule)}</code>
      </pre>
    </div>
  );

  return (
    <Modal
      title={t('viewRuleDetails')}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'form',
            label: (
              <span>
                <FileTextOutlined />
                {t('formView')}
              </span>
            ),
            children: renderFormView()
          },
          {
            key: 'json',
            label: (
              <span>
                <CodeOutlined />
                {t('jsonView')}
              </span>
            ),
            children: renderJsonView()
          }
        ]}
      />
    </Modal>
  );
};

export default ViewMappingModal;
