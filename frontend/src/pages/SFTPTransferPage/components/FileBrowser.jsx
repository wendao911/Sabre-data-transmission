import React from 'react';
import { Card, Tabs, Button, Table, Space, Divider, Tag, Tooltip } from 'antd';
import { 
  ReloadOutlined, 
  PlusOutlined, 
  CloudUploadOutlined, 
  CloudDownloadOutlined, 
  SyncOutlined,
  FolderOutlined,
  FileOutlined,
  DownloadOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;

const FileBrowser = ({ 
  currentPath, 
  directoryList, 
  listLoading, 
  isConnected,
  onRefresh,
  onCreateDirectory,
  onUpload,
  onDownload,
  onSync,
  onNavigateDirectory,
  onGoToParent,
  onDelete,
  onDownloadFile
}) => {
  const generateBreadcrumb = () => {
    if (currentPath === '/' || currentPath === '') {
      return [{ name: '根目录', path: '/' }];
    }
    const pathParts = currentPath.split('/').filter(part => part !== '');
    const breadcrumb = [{ name: '根目录', path: '/' }];
    let currentBreadcrumbPath = '';
    pathParts.forEach((part) => {
      currentBreadcrumbPath += `/${part}`;
      breadcrumb.push({ name: part, path: currentBreadcrumbPath });
    });
    return breadcrumb;
  };

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        const isDirectory = record.type === 'directory';
        return (
          <Space>
            {isDirectory ? (
              <FolderOutlined style={{ color: '#1890ff' }} />
            ) : (
              <FileOutlined style={{ color: '#52c41a' }} />
            )}
            <span
              style={{ 
                cursor: isDirectory ? 'pointer' : 'default', 
                color: isDirectory ? '#1890ff' : '#000' 
              }}
              onClick={() => {
                if (isDirectory) {
                  const newPath = currentPath === '/' ? `/${record.name}` : `${currentPath}/${record.name}`;
                  onNavigateDirectory(newPath);
                }
              }}
            >
              {text}
            </span>
          </Space>
        );
      },
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => (
        <Tag color={type === 'directory' ? 'blue' : 'green'}>
          {type === 'directory' ? '目录' : '文件'}
        </Tag>
      ),
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      width: 120,
      render: (size) => size ? formatFileSize(size) : '-',
    },
    {
      title: '修改时间',
      dataIndex: 'date',
      key: 'date',
      width: 180,
      render: (date) => formatDateDisplay(date),
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      render: (_, record) => (
        <Space>
          <Tooltip title="下载">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={() => {
                const path = currentPath === '/' ? `/${record.name}` : `${currentPath}/${record.name}`;
                onDownloadFile(path);
              }}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => onDelete(record)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDateDisplay = (value) => {
    if (!value) return '-';
    const dt = new Date(value);
    if (isNaN(dt.getTime())) return typeof value === 'string' ? value : '-';
    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
    const y = dt.getFullYear();
    const m = pad(dt.getMonth() + 1);
    const d = pad(dt.getDate());
    const hh = pad(dt.getHours());
    const mm = pad(dt.getMinutes());
    const ss = pad(dt.getSeconds());
    return `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
  };

  return (
    <Tabs defaultActiveKey="browser" type="card">
      <TabPane tab="文件浏览器" key="browser">
        <Card>
          <div className="mb-4 flex justify-between items-center">
            <Space>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={() => onRefresh(currentPath)} 
                loading={listLoading}
              >
                刷新
              </Button>
              <Button 
                icon={<PlusOutlined />} 
                onClick={onCreateDirectory} 
                disabled={!isConnected}
              >
                创建目录
              </Button>
            </Space>
            <Space>
              <Button 
                icon={<CloudUploadOutlined />} 
                onClick={onUpload} 
                disabled={!isConnected}
              >
                上传文件
              </Button>
              <Button 
                icon={<CloudDownloadOutlined />} 
                onClick={onDownload} 
                disabled={!isConnected}
              >
                下载文件
              </Button>
              <Button 
                icon={<SyncOutlined />} 
                onClick={onSync} 
                title="同步文件到SFTP（自动连接）"
              >
                同步文件
              </Button>
            </Space>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Button 
                  type="text" 
                  icon={<ReloadOutlined />} 
                  onClick={() => onRefresh(currentPath)} 
                  loading={listLoading} 
                  title="刷新当前目录" 
                />
                <Button 
                  type="text" 
                  icon={<FolderOutlined />} 
                  onClick={onGoToParent} 
                  disabled={currentPath === '/' || currentPath === ''} 
                  title="返回上级目录" 
                />
                <Divider type="vertical" />
                <span className="text-sm text-gray-600">
                  当前路径: <code className="bg-white px-2 py-1 rounded">{currentPath}</code>
                </span>
              </div>
              <div className="text-sm text-gray-500">{directoryList.length} 个项目</div>
            </div>
            <div className="flex items-center space-x-1 text-sm">
              <span className="text-gray-500">路径:</span>
              {generateBreadcrumb().map((item, index) => (
                <React.Fragment key={item.path}>
                  {index > 0 && <span className="text-gray-400">/</span>}
                  <button 
                    className={`px-2 py-1 rounded text-sm hover:bg-white transition-colors ${
                      item.path === currentPath 
                        ? 'bg-blue-100 text-blue-600 font-medium' 
                        : 'text-gray-600 hover:text-blue-600'
                    }`} 
                    onClick={() => onNavigateDirectory(item.path)} 
                    disabled={item.path === currentPath}
                  >
                    {item.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          <Table 
            columns={columns} 
            dataSource={directoryList} 
            loading={listLoading} 
            rowKey="name" 
            pagination={false} 
            size="small" 
          />
        </Card>
      </TabPane>
    </Tabs>
  );
};

export { FileBrowser };
