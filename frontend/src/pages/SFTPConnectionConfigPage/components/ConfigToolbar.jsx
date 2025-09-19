import React from 'react';
import { Button, Space, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ConfigToolbar = ({ 
  onAdd, 
  onRefresh, 
  loading = false,
  total = 0,
  t
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <Title level={4} className="!mb-0">
          {t('configName')} {t('actions')}
        </Title>
        <span className="text-gray-500 text-sm">
          {t('totalConfigs').replace('{count}', total)}
        </span>
      </div>
      
      <Space>
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={loading}
        >
          {t('refresh')}
        </Button>
        
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
        >
          {t('addConfig')}
        </Button>
      </Space>
    </div>
  );
};

export default ConfigToolbar;
