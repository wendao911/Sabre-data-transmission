import React from 'react';
import { 
  Input, 
  Select, 
  Button, 
  Space, 
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PlusOutlined, 
  FilterOutlined
} from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';

const { Search } = Input;
const { Option } = Select;

const FileMappingToolbar = ({
  searchTerm,
  enabled,
  matchType,
  onSearchChange,
  onToggleEnabled,
  onMatchTypeChange,
  onRefresh,
  onCreate
}) => {
  const { t } = useLanguage();

  // 状态过滤选项
  const statusOptions = [
    { value: 'all', label: t('all') },
    { value: 'enabled', label: t('enabledOnly') },
    { value: 'disabled', label: t('disabledOnly') }
  ];

  // 匹配类型过滤选项
  const matchTypeOptions = [
    { value: 'all', label: '全部' },
    { value: 'filename', label: '按文件名' },
    { value: 'filetype', label: '按文件类型' }
  ];


  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      {/* 左侧：搜索和过滤 */}
      <div className="flex flex-wrap items-center gap-3">
        <Search
          placeholder={t('searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onSearch={onSearchChange}
          style={{ width: 300 }}
          allowClear
        />
        
        <Select
          value={enabled === undefined ? 'all' : enabled ? 'enabled' : 'disabled'}
          onChange={(value) => {
            const newEnabled = value === 'all' ? undefined : value === 'enabled';
            onToggleEnabled(newEnabled);
          }}
          placeholder={t('enabled')}
          style={{ width: 120 }}
        >
          {statusOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>

        <Select
          value={matchType === undefined ? 'all' : matchType}
          onChange={(value) => {
            const newMatchType = value === 'all' ? undefined : value;
            onMatchTypeChange(newMatchType);
          }}
          placeholder="匹配类型"
          style={{ width: 120 }}
        >
          {matchTypeOptions.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2">
        <Tooltip title={t('refresh')}>
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            size="small"
          />
        </Tooltip>
        
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreate}
        >
          {t('create')}
        </Button>
      </div>
    </div>
  );
};

export default FileMappingToolbar;
