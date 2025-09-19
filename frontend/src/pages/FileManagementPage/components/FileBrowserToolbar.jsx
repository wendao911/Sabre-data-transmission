import React from 'react';
import { Input, Select, Button, Space, Tooltip, Breadcrumb } from 'antd';
import { 
  SearchOutlined, 
  SortAscendingOutlined, 
  SortDescendingOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  HomeOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';

const { Search } = Input;
const { Option } = Select;

const FileBrowserToolbar = ({
  searchTerm,
  sortBy,
  sortOrder,
  showHidden,
  currentPath,
  parentPath,
  onSearchChange,
  onSort,
  onToggleHidden,
  onNavigateToDirectory,
  onNavigateToParent,
  onNavigateToRoot,
  onRefresh,
  onCreateDirectory,
  onUpload
}) => {
  const { t } = useLanguage();
  
  const sortOptions = [
    { value: 'name', label: t('sortOptions.name') },
    { value: 'size', label: t('sortOptions.size') },
    { value: 'date', label: t('sortOptions.date') }
  ];

  // 构建面包屑导航
  const breadcrumbItems = [
    {
      title: (
        <Button 
          type="text" 
          icon={<HomeOutlined />} 
          onClick={onNavigateToRoot}
          className="!p-0"
        >
          {t('breadcrumb.root')}
        </Button>
      )
    }
  ];

  if (currentPath) {
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.forEach((part, index) => {
      const pathToHere = pathParts.slice(0, index + 1).join('/');
      breadcrumbItems.push({
        title: (
          <Button 
            type="text" 
            onClick={() => onNavigateToDirectory(pathToHere)}
            className="!p-0"
          >
            {part}
          </Button>
        )
      });
    });
  }

  return (
    <div className="space-y-4 mb-4">
      {/* 导航栏 */}
      <div className="flex items-center justify-between">
        <Breadcrumb items={breadcrumbItems} />
        <Space>
          <Tooltip title={t('toolbar.createDirectory')}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreateDirectory}
              size="middle"
            />
          </Tooltip>
          <Tooltip title={t('toolbar.uploadFile')}>
            <Button
              icon={<UploadOutlined />}
              onClick={onUpload}
              size="middle"
            />
          </Tooltip>
          <Tooltip title={t('toolbar.refresh')}>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              size="middle"
            />
          </Tooltip>
          <Tooltip title={t('toolbar.backToParent')}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onNavigateToParent}
              disabled={parentPath === null}
              size="middle"
            />
          </Tooltip>
          <Tooltip title={t('toolbar.backToRoot')}>
            <Button
              icon={<HomeOutlined />}
              onClick={onNavigateToRoot}
              size="middle"
            />
          </Tooltip>
        </Space>
      </div>

      {/* 搜索和控制栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* 搜索框 */}
        <div className="flex-1 min-w-0">
          <Search
            placeholder={t('toolbar.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onSearch={onSearchChange}
            allowClear
            className="max-w-md"
          />
        </div>

        {/* 控制按钮组 */}
        <Space wrap>
          {/* 排序选择 */}
          <Select
            value={sortBy}
            onChange={onSort}
            style={{ width: 120 }}
            suffixIcon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
          >
            {sortOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>

          {/* 排序顺序切换 */}
          <Tooltip title={sortOrder === 'asc' ? t('sortOrderOptions.asc') : t('sortOrderOptions.desc')}>
            <Button
              icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              onClick={() => onSort(sortBy)}
              size="middle"
            />
          </Tooltip>

          {/* 显示隐藏文件切换 */}
          <Tooltip title={t('toolbar.showHidden')}>
            <Button
              icon={showHidden ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={onToggleHidden}
              type={showHidden ? 'primary' : 'default'}
              size="middle"
            />
          </Tooltip>
        </Space>
      </div>
    </div>
  );
};

export default FileBrowserToolbar;
