import React from 'react';
import { Card, Input, Button, Space } from 'antd';
import { SearchOutlined, ReloadOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';

const FileActions = ({ 
  searchTerm, 
  onSearchChange, 
  onAction 
}) => {
  return (
    <Card className="mb-4">
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="搜索文件..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
          />
        </div>
        
        <Space>
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => onAction('refresh')}
          >
            刷新
          </Button>
          <Button 
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => onAction('download')}
          >
            下载选中
          </Button>
          <Button 
            danger
            icon={<DeleteOutlined />}
            onClick={() => onAction('delete')}
          >
            删除选中
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export { FileActions };
