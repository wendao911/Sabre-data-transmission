import React from 'react';
import { Card, Form, Select, DatePicker, Button, Space, Radio } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;

const DecryptControls = ({
  isDecrypting,
  filterMode,
  selectedDate,
  selectedMonth,
  onStart,
  onStop,
  onReset,
  onFilterModeChange,
  onDateChange,
  onMonthChange
}) => {
  return (
    <Card title="解密控制" className="mb-6">
      <Form layout="inline" className="mb-4">
        <Form.Item label="过滤模式">
          <Radio.Group 
            value={filterMode} 
            onChange={(e) => onFilterModeChange(e.target.value)}
          >
            <Radio value="all">全部文件</Radio>
            <Radio value="date">按日期</Radio>
            <Radio value="month">按月份</Radio>
          </Radio.Group>
        </Form.Item>
        
        {filterMode === 'date' && (
          <Form.Item label="选择日期">
            <DatePicker
              format="YYYYMMDD"
              placeholder="选择日期"
              value={selectedDate}
              onChange={onDateChange}
            />
          </Form.Item>
        )}
        
        {filterMode === 'month' && (
          <Form.Item label="选择月份">
            <DatePicker
              picker="month"
              format="YYYYMM"
              placeholder="选择月份"
              value={selectedMonth}
              onChange={onMonthChange}
            />
          </Form.Item>
        )}
      </Form>
      
      <Space>
        {!isDecrypting ? (
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={onStart}
            size="large"
          >
            开始解密
          </Button>
        ) : (
          <Button
            type="default"
            icon={<PauseCircleOutlined />}
            onClick={onStop}
            size="large"
          >
            停止解密
          </Button>
        )}
        
        <Button
          icon={<ReloadOutlined />}
          onClick={onReset}
          size="large"
        >
          重置
        </Button>
      </Space>
    </Card>
  );
};

export { DecryptControls };
