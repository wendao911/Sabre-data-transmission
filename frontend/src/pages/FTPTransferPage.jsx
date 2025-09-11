import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Button,
  Input,
  Form,
  Table,
  Space,
  Modal,
  message,
  Progress,
  Upload,
  Select,
  DatePicker,
  Divider,
  Tag,
  Tooltip,
  Spin,
  Alert,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  CloudUploadOutlined,
  CloudDownloadOutlined,
  FolderOutlined,
  FileOutlined,
  DeleteOutlined,
  PlusOutlined,
  SyncOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { ftpAPI, scheduleAPI } from '../services/api';
import toast from 'react-hot-toast';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const FTPTransferPage = () => {
  // 连接状态
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  
  // FTP 配置
  const [activeFtpConfig, setActiveFtpConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // 目录和文件管理
  const [currentPath, setCurrentPath] = useState('/');
  const [directoryList, setDirectoryList] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // 文件操作
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [createDirModalVisible, setCreateDirModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [operationProgress, setOperationProgress] = useState(0);
  const [operationStatus, setOperationStatus] = useState('');
  const [uploadFileList, setUploadFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  // 同步操作
  const [syncDate, setSyncDate] = useState(null);
  const [syncType, setSyncType] = useState('encrypted');
  const [syncLoading, setSyncLoading] = useState(false);

  // 统计信息
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    lastSync: null,
  });


  // 检查连接状态
  useEffect(() => {
    checkConnectionStatus();
    loadActiveFtpConfig();
  }, []);

  // 检查连接状态
  const checkConnectionStatus = async () => {
    try {
      const result = await ftpAPI.getStatus();
      setIsConnected(result.data?.connected || false);
    } catch (error) {
      console.error('检查连接状态失败:', error);
    }
  };

  // 加载活跃的 FTP 配置
  const loadActiveFtpConfig = async () => {
    setLoadingConfig(true);
    try {
      const resp = await scheduleAPI.getActiveFtpConfig();
      if (resp?.success && resp.data) {
        setActiveFtpConfig(resp.data);
      }
    } catch (error) {
      console.error('加载 FTP 配置失败:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  // 连接 FTP
  const handleConnectFtp = async () => {
    if (!activeFtpConfig) {
      toast.error('没有可用的 FTP 配置');
      return;
    }

    setConnecting(true);
    try {
      const connectParams = {
        host: activeFtpConfig.host,
        port: activeFtpConfig.port,
        secure: activeFtpConfig.secure
      };
      
      // 根据用户类型设置用户名和密码
      if (activeFtpConfig.userType === 'authenticated' && activeFtpConfig.user) {
        connectParams.user = activeFtpConfig.user;
        connectParams.password = activeFtpConfig.password;
      } else {
        connectParams.user = '';
        connectParams.password = '';
      }
      
      const resp = await ftpAPI.connect(connectParams);
      if (resp?.success) {
        setIsConnected(true);
        toast.success('FTP 连接成功');
        await loadDirectoryList('/');
      } else {
        toast.error(resp?.message || '连接失败');
      }
    } catch (error) {
      toast.error('连接失败: ' + error.message);
    } finally {
      setConnecting(false);
    }
  };

  // 断开FTP连接
  const handleDisconnect = async () => {
    try {
      const result = await ftpAPI.disconnect();
      if (result.success) {
        setIsConnected(false);
        setDirectoryList([]);
        setCurrentPath('/');
        toast.success('已断开FTP连接');
      }
    } catch (error) {
      toast.error('断开连接失败: ' + error.message);
    }
  };



  // 加载目录列表
  const loadDirectoryList = async (path = currentPath) => {
    setListLoading(true);
    try {
      const result = await ftpAPI.listDirectory(path);
      if (result.success) {
        // 调试信息：打印接收到的文件数据
        console.log('前端接收到的文件列表:', result.data);
        result.data.forEach((file, index) => {
          console.log(`文件 ${index}:`, {
            name: file.name,
            type: file.type,
            size: file.size,
            date: file.date
          });
        });
        
        setDirectoryList(result.data || []);
        setCurrentPath(path);
        updateStats(result.data || []);
      } else {
        toast.error(result.message || '加载目录失败');
      }
    } catch (error) {
      toast.error('加载目录失败: ' + error.message);
    } finally {
      setListLoading(false);
    }
  };

  // 返回上级目录
  const goToParentDirectory = () => {
    if (currentPath === '/' || currentPath === '') {
      toast.success('已经在根目录');
      return;
    }
    
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    console.log(`返回上级目录: ${currentPath} -> ${parentPath}`);
    loadDirectoryList(parentPath);
  };

  // 生成面包屑导航
  const generateBreadcrumb = () => {
    if (currentPath === '/' || currentPath === '') {
      return [{ name: '根目录', path: '/' }];
    }
    
    const pathParts = currentPath.split('/').filter(part => part !== '');
    const breadcrumb = [{ name: '根目录', path: '/' }];
    
    let currentBreadcrumbPath = '';
    pathParts.forEach((part, index) => {
      currentBreadcrumbPath += `/${part}`;
      breadcrumb.push({
        name: part,
        path: currentBreadcrumbPath
      });
    });
    
    return breadcrumb;
  };

  // 更新统计信息
  const updateStats = (files) => {
    const fileList = files.filter(item => item.type === 'file');
    const totalFiles = fileList.length;
    const totalSize = fileList.reduce((sum, file) => sum + (file.size || 0), 0);
    setStats({ totalFiles, totalSize, lastSync: new Date() });
  };

  // 创建目录
  const handleCreateDirectory = async (values) => {
    try {
      const newPath = currentPath === '/' ? `/${values.name}` : `${currentPath}/${values.name}`;
      console.log(`创建目录: ${newPath}`);
      const result = await ftpAPI.createDirectory(newPath);
      if (result.success) {
        toast.success('目录创建成功');
        setCreateDirModalVisible(false);
        // 刷新当前目录而不是跳转到根目录
        await loadDirectoryList(currentPath);
      } else {
        toast.error(result.message || '创建目录失败');
      }
    } catch (error) {
      console.error('创建目录失败:', error);
      toast.error('创建目录失败: ' + error.message);
    }
  };

  // 删除文件或目录
  const handleDelete = async (item) => {
    Modal.confirm({
      title: `确认删除${item.type === 'directory' ? '目录' : '文件'}`,
      content: `确定要删除 ${item.name} 吗？`,
      onOk: async () => {
        try {
          const path = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
          const result = item.type === 'directory' 
            ? await ftpAPI.deleteDirectory(path)
            : await ftpAPI.deleteFile(path);
          
          if (result.success) {
            toast.success('删除成功');
            await loadDirectoryList(currentPath);
          } else {
            toast.error(result.message || '删除失败');
          }
        } catch (error) {
          toast.error('删除失败: ' + error.message);
        }
      },
    });
  };

  // 上传文件
  const handleUpload = async () => {
    if (uploadFileList.length === 0) {
      toast.error('请选择要上传的文件');
      return;
    }

    console.log('=== 开始上传流程 ===');
    console.log('当前路径:', currentPath);
    console.log('文件列表:', uploadFileList);

    setUploading(true);
    setOperationProgress(0);
    setOperationStatus('准备上传...');
    
    try {
      console.log(`开始批量上传 ${uploadFileList.length} 个文件到目录: ${currentPath}`);
      
      // 计算总文件大小
      const totalSize = uploadFileList.reduce((sum, file) => sum + file.size, 0);
      const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
      console.log(`总文件大小: ${totalSizeMB} MB`);
      
      setOperationStatus(`正在上传 ${uploadFileList.length} 个文件 (${totalSizeMB} MB)...`);
      
      // 提取文件对象
      const files = uploadFileList.map(file => {
        console.log('文件信息:', {
          name: file.name,
          size: file.size,
          type: file.type,
          originFileObj: file.originFileObj
        });
        return file.originFileObj;
      });
      
      console.log('准备调用API，文件数量:', files.length);

      // 将文件按批次上传，每批最多10个（与后端multer限制保持一致）
      const BATCH_SIZE = 10;
      let uploadedBytesSoFar = 0;
      let uploadedFilesCount = 0;

      for (let start = 0; start < files.length; start += BATCH_SIZE) {
        const end = Math.min(start + BATCH_SIZE, files.length);
        const batch = files.slice(start, end);
        const batchIndex = Math.floor(start / BATCH_SIZE) + 1;
        const batchCount = Math.ceil(files.length / BATCH_SIZE);
        const batchSizeBytes = uploadFileList
          .slice(start, end)
          .reduce((sum, f) => sum + f.size, 0);

        console.log(`开始上传第 ${batchIndex}/${batchCount} 批 (${batch.length} 个文件)`);
        setOperationStatus(`正在上传第 ${batchIndex}/${batchCount} 批（${batch.length} 个文件）...`);

        const result = await ftpAPI.uploadMultiple(batch, currentPath, (percent, loaded) => {
          // 将当前批次进度折算到总体
          const currentBatchLoaded = Math.min(batchSizeBytes, loaded || 0);
          const overallLoaded = uploadedBytesSoFar + currentBatchLoaded;
          const overallPercent = totalSize > 0 ? Math.min(99, Math.floor((overallLoaded / totalSize) * 100)) : 0;
          setOperationProgress(overallPercent);
        });

        // 累积该批次结果
        uploadedBytesSoFar += batchSizeBytes;
        uploadedFilesCount += (result?.data?.filter?.(r => r.success)?.length || batch.length);

        // 若该批失败，提示并中断（也可改为继续下批）
        if (!result.success) {
          console.error('上传失败，结果:', result);
          setOperationStatus('上传失败');
          toast.error(result.message || result.error || '上传失败');
          setUploading(false);
          return;
        }
      }
      
      // 全部批次完成
      setOperationProgress(100);
      setOperationStatus('上传完成');
      toast.success(`上传完成，共成功上传 ${uploadedFilesCount}/${uploadFileList.length} 个文件`);
      setUploadModalVisible(false);
      setUploadFileList([]);
      await loadDirectoryList(currentPath);
    } catch (error) {
      console.error('上传过程中发生错误:', error);
      console.error('错误详情:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      setOperationStatus('上传失败');
      
      if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
        toast.error('上传超时，请检查网络连接或尝试上传较小的文件');
      } else if (error.response?.data) {
        toast.error('上传失败: ' + (error.response.data.message || error.response.data.error || error.message));
      } else {
        toast.error('上传失败: ' + error.message);
      }
    } finally {
      setUploading(false);
      setTimeout(() => {
        setOperationProgress(0);
        setOperationStatus('');
      }, 3000);
    }
  };

  // 处理文件选择
  const handleFileChange = (info) => {
    setUploadFileList(info.fileList);
  };

  // 移除文件
  const handleRemoveFile = (file) => {
    const newFileList = uploadFileList.filter(item => item.uid !== file.uid);
    setUploadFileList(newFileList);
  };

  // 下载文件
  const handleDownload = async (values) => {
    try {
      const { remotePath, localPath } = values;
      const result = await ftpAPI.downloadFile(remotePath, localPath);
      if (result.success) {
        toast.success('文件下载成功');
        setDownloadModalVisible(false);
      } else {
        toast.error(result.message || '下载失败');
      }
    } catch (error) {
      toast.error('下载失败: ' + error.message);
    }
  };

  // 同步文件
  const handleSync = async () => {
    if (!syncDate) {
      toast.error('请选择同步日期');
      return;
    }

    setSyncLoading(true);
    toast.success('开始同步文件...');
    
    try {
      const dateStr = syncDate.format('YYYYMMDD');
      const result = syncType === 'encrypted' 
        ? await ftpAPI.syncEncrypted(dateStr)
        : await ftpAPI.syncDecrypted(dateStr);
      
      if (result.success) {
        toast.success(`同步完成: ${result.message}`);
        setSyncModalVisible(false);
        await loadDirectoryList('/');
      } else {
        toast.error(result.message || '同步失败');
      }
    } catch (error) {
      toast.error('同步失败: ' + error.message);
    } finally {
      setSyncLoading(false);
    }
  };

  // 格式化日期显示为 yyyy/MM/dd HH:mm:ss
  const formatDateDisplay = (value) => {
    if (!value) return '-';
    // 若为YYYYMMDD纯日期
    if (typeof value === 'string' && /^\d{8}$/.test(value)) {
      const y = value.slice(0, 4);
      const m = value.slice(4, 6);
      const d = value.slice(6, 8);
      return `${y}/${m}/${d} 00:00:00`;
    }
    // 处理如 'MM-DD-YY hh:mmAM/PM'（例如 09-10-25 02:41PM）
    if (typeof value === 'string') {
      const ampmMatch = value.match(/^(\d{2})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})(AM|PM)$/i);
      if (ampmMatch) {
        const mm = ampmMatch[1];
        const dd = ampmMatch[2];
        const yy = ampmMatch[3];
        let hh = parseInt(ampmMatch[4], 10);
        const mi = ampmMatch[5];
        const ap = ampmMatch[6].toUpperCase();
        if (ap === 'PM' && hh < 12) hh += 12;
        if (ap === 'AM' && hh === 12) hh = 0;
        const yyyy = `20${yy}`; // 假定21世纪年份
        const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
        return `${yyyy}/${mm}/${dd} ${pad(hh)}:${mi}:00`;
      }
    }
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

  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        // 调试信息：打印每个文件的类型判断
        console.log(`前端渲染文件 "${text}":`, {
          name: record.name,
          type: record.type,
          size: record.size,
          date: record.date,
          permissions: record.permissions,
          isDirectory: record.type === 'directory',
          isFile: record.type === 'file',
          hasExtension: record.name && record.name.includes('.')
        });
        
        const isDirectory = record.type === 'directory';
        const isFile = record.type === 'file';
        
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
                  console.log(`点击进入目录: ${newPath}`);
                  loadDirectoryList(newPath);
                } else {
                  console.log(`点击文件: ${record.name} (不可进入)`);
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
      render: (type, record) => {
        console.log(`类型列渲染 "${record.name}":`, {
          name: record.name,
          type: type,
          size: record.size,
          isDirectory: type === 'directory',
          isFile: type === 'file',
          hasExtension: record.name && record.name.includes('.'),
          permissions: record.permissions
        });
        
        // 如果类型判断有问题，添加警告
        if (record.name && record.name.includes('.') && type === 'directory') {
          console.warn(`⚠️ 文件 "${record.name}" 有扩展名但被识别为目录，可能存在判断错误`);
        }
        
        // 检查没有扩展名但可能是文件的情况
        if (record.name && !record.name.includes('.') && type === 'directory') {
          // 检查是否是常见的文件模式
          const isFilePattern = /^\w+_\d{8}_\d{4}$/.test(record.name) || // SABRE_K6_ACCB_20250903_1333
                                /^\w+_\d{8}$/.test(record.name) ||      // SABRE_K6_ACCB_20250903
                                /^\w+_\d{6}_\d{4}$/.test(record.name) || // SABRE_K6_ACCB_090303_1333
                                record.name.includes('_') && record.name.match(/\d+/); // 包含下划线和数字
          
          if (isFilePattern) {
            console.warn(`⚠️ 文件 "${record.name}" 匹配文件模式但被识别为目录，可能需要调整判断逻辑`);
          }
        }
        
        return (
          <Tag color={type === 'directory' ? 'blue' : 'green'}>
            {type === 'directory' ? '目录' : '文件'}
          </Tag>
        );
      },
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
                ftpAPI.downloadAsAttachment(path);
              }}
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">FTP文件传输</h1>
      </div>

      {/* FTP 配置卡片 */}
      <Card title="FTP 连接配置" className="mb-6">
        {loadingConfig ? (
          <div className="text-center py-4">
            <Spin size="large" />
            <p className="mt-2 text-gray-500">加载配置中...</p>
          </div>
        ) : activeFtpConfig ? (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <div>
                  <span className="text-gray-500">配置名称：</span>
                  <span className="font-medium">{activeFtpConfig.name || '未命名'}</span>
                </div>
              </Col>
              <Col span={6}>
                <div>
                  <span className="text-gray-500">主机：</span>
                  <span className="font-medium">{activeFtpConfig.host}</span>
                </div>
              </Col>
              <Col span={4}>
                <div>
                  <span className="text-gray-500">端口：</span>
                  <span className="font-medium">{activeFtpConfig.port || 21}</span>
                </div>
              </Col>
              <Col span={4}>
                <div>
                  <span className="text-gray-500">用户类型：</span>
                  <Tag color={activeFtpConfig.userType === 'authenticated' ? 'blue' : 'orange'}>
                    {activeFtpConfig.userType === 'authenticated' ? '普通用户' : '匿名用户'}
                  </Tag>
                </div>
              </Col>
              <Col span={4}>
                <div>
                  <span className="text-gray-500">FTPS：</span>
                  <Tag color={activeFtpConfig.secure ? 'green' : 'default'}>
                    {activeFtpConfig.secure ? '是' : '否'}
                  </Tag>
                </div>
              </Col>
            </Row>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="flex items-center">
                {isConnected ? <CheckCircleOutlined style={{ color: '#3f8600', fontSize: '16px' }} /> : <ExclamationCircleOutlined style={{ color: '#cf1322', fontSize: '16px' }} />}
                <span style={{ 
                  color: isConnected ? '#3f8600' : '#cf1322',
                  fontSize: '16px',
                  marginLeft: '8px'
                }}>
                  {isConnected ? 'FTP已连接' : 'FTP未连接'}
                </span>
              </div>
              
              <Space>
                {!isConnected ? (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handleConnectFtp}
                    loading={connecting}
                  >
                    连接 FTP
                  </Button>
                ) : (
                  <Button
                    type="default"
                    icon={<ExclamationCircleOutlined />}
                    onClick={handleDisconnect}
                  >
                    断开连接
                  </Button>
                )}
                <Button
                  type="default"
                  icon={<ReloadOutlined />}
                  onClick={loadActiveFtpConfig}
                  loading={loadingConfig}
                >
                  刷新配置
                </Button>
              </Space>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
            <p className="mt-2 text-gray-500">没有可用的 FTP 配置</p>
            <p className="text-sm text-gray-400">请在系统设置中配置 FTP 连接</p>
          </div>
        )}
      </Card>


      {/* 主要内容区域 */}
      <Tabs defaultActiveKey="browser" type="card">
        {/* 文件浏览器 */}
        <TabPane tab="文件浏览器" key="browser">
          <Card>
            <div className="mb-4 flex justify-between items-center">
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => loadDirectoryList(currentPath)}
                  loading={listLoading}
                >
                  刷新
                </Button>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => setCreateDirModalVisible(true)}
                  disabled={!isConnected}
                >
                  创建目录
                </Button>
              </Space>
              <Space>
                <Button
                  icon={<CloudUploadOutlined />}
                  onClick={() => setUploadModalVisible(true)}
                  disabled={!isConnected}
                >
                  上传文件
                </Button>
                <Button
                  icon={<CloudDownloadOutlined />}
                  onClick={() => setDownloadModalVisible(true)}
                  disabled={!isConnected}
                >
                  下载文件
                </Button>
                <Button
                  icon={<SyncOutlined />}
                  onClick={() => setSyncModalVisible(true)}
                  title="同步文件到FTP（自动连接）"
                >
                  同步文件
                </Button>
              </Space>
            </div>

            {/* 目录导航栏 */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        type="text"
                        icon={<ReloadOutlined />}
                        onClick={() => loadDirectoryList(currentPath)}
                        loading={listLoading}
                        title="刷新当前目录"
                      />
                      <Button
                        type="text"
                        icon={<FolderOutlined />}
                        onClick={goToParentDirectory}
                        disabled={currentPath === '/' || currentPath === ''}
                        title="返回上级目录"
                      />
                      <Divider type="vertical" />
                      <span className="text-sm text-gray-600">
                        当前路径: <code className="bg-white px-2 py-1 rounded">{currentPath}</code>
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {directoryList.length} 个项目
                    </div>
                  </div>
                  
                  {/* 面包屑导航 */}
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
                          onClick={() => loadDirectoryList(item.path)}
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

      {/* 上传文件模态框 */}
      <Modal
        title="上传文件"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          setUploadFileList([]);
        }}
        footer={null}
        width={600}
      >
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            上传到: <code className="bg-gray-100 px-2 py-1 rounded">{currentPath}</code>
          </div>
          <Upload
            multiple
            fileList={uploadFileList}
            onChange={handleFileChange}
            onRemove={handleRemoveFile}
            beforeUpload={() => false} // 阻止自动上传
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} block>
              选择文件（支持多选）
            </Button>
          </Upload>
        </div>
        
        {uploadFileList.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">已选择的文件:</div>
            <div className="max-h-32 overflow-y-auto">
              {uploadFileList.map(file => (
                <div key={file.uid} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded mb-1">
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 上传进度 */}
        {uploading && (
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">{operationStatus}</div>
            <Progress 
              percent={operationProgress} 
              status={operationProgress === 100 ? 'success' : 'active'}
              showInfo={false}
            />
          </div>
        )}
        
        <div className="flex justify-end space-x-2">
          <Button onClick={() => {
            setUploadModalVisible(false);
            setUploadFileList([]);
          }}>
            取消
          </Button>
          <Button 
            type="primary" 
            onClick={handleUpload}
            loading={uploading}
            disabled={uploadFileList.length === 0}
            icon={<CloudUploadOutlined />}
          >
            上传 {uploadFileList.length > 0 ? `(${uploadFileList.length} 个文件)` : ''}
          </Button>
        </div>
      </Modal>

      {/* 创建目录模态框 */}
      <Modal
        title="创建目录"
        open={createDirModalVisible}
        onCancel={() => setCreateDirModalVisible(false)}
        footer={null}
        width={400}
      >
        <Form onFinish={handleCreateDirectory}>
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">
              在目录: <code className="bg-gray-100 px-2 py-1 rounded">{currentPath}</code> 中创建
            </div>
          </div>
          <Form.Item
            label="目录名称"
            name="name"
            rules={[
              { required: true, message: '请输入目录名称' },
              { pattern: /^[^/\\:*?"<>|]+$/, message: '目录名称不能包含特殊字符' }
            ]}
          >
            <Input placeholder="请输入目录名称" />
          </Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={() => setCreateDirModalVisible(false)}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
              创建目录
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 下载文件模态框 */}
      <Modal
        title="下载文件"
        open={downloadModalVisible}
        onCancel={() => setDownloadModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleDownload}>
          <Form.Item
            label="远程文件路径"
            name="remotePath"
            rules={[{ required: true, message: '请输入远程文件路径' }]}
          >
            <Input placeholder="/remote/path/file.txt" />
          </Form.Item>
          <Form.Item
            label="本地文件路径"
            name="localPath"
            rules={[{ required: true, message: '请输入本地文件路径' }]}
          >
            <Input placeholder="/path/to/local/file.txt" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<CloudDownloadOutlined />}>
                下载
              </Button>
              <Button onClick={() => setDownloadModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 同步文件模态框 */}
      <Modal
        title="同步文件"
        open={syncModalVisible}
        onCancel={() => setSyncModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleSync}>
          <Form.Item
            label="同步类型"
            name="syncType"
            initialValue="encrypted"
          >
            <Select onChange={setSyncType}>
              <Option value="encrypted">加密文件</Option>
              <Option value="decrypted">解密文件</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="同步日期"
            name="syncDate"
            rules={[{ required: true, message: '请选择同步日期' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              onChange={setSyncDate}
              placeholder="选择日期"
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={syncLoading}
                icon={<SyncOutlined />}
              >
                开始同步
              </Button>
              <Button onClick={() => setSyncModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FTPTransferPage;
