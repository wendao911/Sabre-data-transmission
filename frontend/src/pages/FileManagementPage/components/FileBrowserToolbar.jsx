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
  const sortOptions = [
    { value: 'name', label: '按名称' },
    { value: 'size', label: '按大小' },
    { value: 'date', label: '按日期' }
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
          根目录
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
          <Tooltip title="创建新目录">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreateDirectory}
              size="middle"
            />
          </Tooltip>
          <Tooltip title="上传文件">
            <Button
              icon={<UploadOutlined />}
              onClick={onUpload}
              size="middle"
            />
          </Tooltip>
          <Tooltip title="刷新当前目录">
            <Button
              icon={<ReloadOutlined />}
              onClick={onRefresh}
              size="middle"
            />
          </Tooltip>
          <Tooltip title="返回上级目录">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={onNavigateToParent}
              disabled={parentPath === null}
              size="middle"
            />
          </Tooltip>
          <Tooltip title="返回根目录">
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
            placeholder="搜索文件..."
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
          <Tooltip title={sortOrder === 'asc' ? '升序' : '降序'}>
            <Button
              icon={sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              onClick={() => onSort(sortBy)}
              size="middle"
            />
          </Tooltip>

          {/* 显示隐藏文件切换 */}
          <Tooltip title={showHidden ? '隐藏系统文件' : '显示系统文件'}>
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
