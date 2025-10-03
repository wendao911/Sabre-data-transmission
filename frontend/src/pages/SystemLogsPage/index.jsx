import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Tabs, Typography, Space, Button, DatePicker, Select, Input, Table, Tag, Tooltip, Badge, Modal, Descriptions, Divider, message } from 'antd';
import { ReloadOutlined, SearchOutlined, DownloadOutlined, DeleteOutlined, InfoCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useLanguage } from './hooks/useLanguage';
import { systemLogsService } from './services/systemLogsService';
import TransferLogDetailsModal from './components/TransferLogDetailsModal';
import { PageTitle, ModernTable, ModernPagination, PageContainer } from '../../components/Common';
// 使用原生 Date 对象处理日期
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  } else if (format === 'YYYY-MM-DD HH:mm:ss') {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  return `${year}-${month}-${day}`;
};

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const SystemLogsPage = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('system');
  const [loading, setLoading] = useState(false);
  const [systemLogs, setSystemLogs] = useState([]);
  const [decryptLogs, setDecryptLogs] = useState([]);
  const [transferLogs, setTransferLogs] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [filters, setFilters] = useState({
    system: {
      level: '',
      module: '',
      startDate: null,
      endDate: null,
      searchText: ''
    },
    decrypt: {
      status: '',
      startDate: null,
      endDate: null,
      searchText: ''
    },
    transfer: {
      status: '',
      startDate: null,
      endDate: null,
      searchText: ''
    }
  });
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [systemLogDetails, setSystemLogDetails] = useState(null);
  const [systemDetailsModalVisible, setSystemDetailsModalVisible] = useState(false);

  // 获取日志级别颜色
  const getLevelColor = (level) => {
    switch (level) {
      case 'error': return 'red';
      case 'warn': return 'orange';
      case 'info': return 'blue';
      default: return 'default';
    }
  };

  // 获取日志级别图标
  const getLevelIcon = (level) => {
    switch (level) {
      case 'error': return <CloseCircleOutlined />;
      case 'warn': return <ExclamationCircleOutlined />;
      case 'info': return <InfoCircleOutlined />;
      default: return <InfoCircleOutlined />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green';
      case 'failed': return 'red';
      case 'partial': return 'orange';
      case 'no_files': return 'gray';
      default: return 'default';
    }
  };

  // 加载系统日志
  const loadSystemLogs = async (page = 1, customFilters = null) => {
    setLoading(true);
    try {
      const currentFilters = customFilters || filters.system;
      const params = {
        page,
        pageSize: pagination.pageSize,
        ...currentFilters
      };
      
      if (currentFilters.startDate && currentFilters.endDate) {
        params.startDate = formatDate(currentFilters.startDate, 'YYYY-MM-DD');
        params.endDate = formatDate(currentFilters.endDate, 'YYYY-MM-DD');
      }
      
      const response = await systemLogsService.getSystemLogs(params);
      if (response.success) {
        setSystemLogs(response.data.logs);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: response.data.pagination.total
        }));
      } else {
        message.error(response.error || '加载系统日志失败');
      }
    } catch (error) {
      console.error('加载系统日志失败:', error);
      message.error(`加载系统日志失败: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 加载解密日志
  const loadDecryptLogs = async (page = 1, customFilters = null) => {
    setLoading(true);
    try {
      const currentFilters = customFilters || filters.decrypt;
      const params = {
        page,
        pageSize: pagination.pageSize,
        ...currentFilters
      };
      
      if (currentFilters.startDate && currentFilters.endDate) {
        params.startDate = formatDate(currentFilters.startDate, 'YYYY-MM-DD');
        params.endDate = formatDate(currentFilters.endDate, 'YYYY-MM-DD');
      }
      
      const response = await systemLogsService.getDecryptLogs(params);
      if (response.success) {
        setDecryptLogs(response.data.logs);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: response.data.pagination.total
        }));
      } else {
        message.error(response.error || '加载解密日志失败');
      }
    } catch (error) {
      console.error('加载解密日志失败:', error);
      message.error(`加载解密日志失败: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 加载传输日志
  const loadTransferLogs = async (page = 1, customFilters = null) => {
    setLoading(true);
    try {
      const currentFilters = customFilters || filters.transfer;
      const params = {
        page,
        pageSize: pagination.pageSize,
        ...currentFilters
      };
      
      if (currentFilters.startDate && currentFilters.endDate) {
        params.startDate = formatDate(currentFilters.startDate, 'YYYY-MM-DD');
        params.endDate = formatDate(currentFilters.endDate, 'YYYY-MM-DD');
      }
      
      const response = await systemLogsService.getTransferTaskLogs(params);
      if (response.success) {
        setTransferLogs(response.data.tasks || []);
        setPagination(prev => ({
          ...prev,
          current: page,
          total: response.data.pagination?.total || 0
        }));
      } else {
        message.error(response.error || '加载传输日志失败');
      }
    } catch (error) {
      console.error('加载传输日志失败:', error);
      message.error(`加载传输日志失败: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 刷新数据
  const handleRefresh = () => {
    switch (activeTab) {
      case 'system':
        loadSystemLogs(1);
        break;
      case 'decrypt':
        loadDecryptLogs(1);
        break;
      case 'transfer':
        loadTransferLogs(1);
        break;
    }
  };

  // 处理筛选
  const handleFilter = (tabType) => {
    setPagination(prev => ({ ...prev, current: 1 }));
    switch (tabType || activeTab) {
      case 'system':
        loadSystemLogs(1);
        break;
      case 'decrypt':
        loadDecryptLogs(1);
        break;
      case 'transfer':
        loadTransferLogs(1);
        break;
    }
  };

  // 处理分页
  const handlePageChange = (page) => {
    switch (activeTab) {
      case 'system':
        loadSystemLogs(page);
        break;
      case 'decrypt':
        loadDecryptLogs(page);
        break;
      case 'transfer':
        loadTransferLogs(page);
        break;
    }
  };

  // 系统日志筛选器
  const SystemLogFilter = () => (
    <Card 
      className="mb-4" 
      size="small"
      style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        border: '1px solid #e9ecef',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
    >
      <div className="mb-3" style={{ padding: '8px 0' }}>
        <Text 
          type="secondary" 
          style={{ 
            fontSize: '13px',
            color: '#6c757d',
            fontWeight: '500'
          }}
        >
          {t('systemLogFilterDesc')}
        </Text>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong style={{ color: '#495057', fontSize: '14px', minWidth: '80px' }}>
            {t('filterByLevel')}:
          </Text>
          <Select
            placeholder={t('selectLevel')}
            style={{ width: 140, borderRadius: '8px' }}
            value={filters.system.level}
            onChange={(value) => setFilters(prev => ({ 
              ...prev, 
              system: { ...prev.system, level: value }
            }))}
            allowClear
            suffixIcon={<span style={{ color: '#6c757d' }}>▼</span>}
          >
            <Option value="error">🔴 ERROR</Option>
            <Option value="warn">🟡 WARN</Option>
            <Option value="info">🔵 INFO</Option>
          </Select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong style={{ color: '#495057', fontSize: '14px', minWidth: '80px' }}>
            {t('filterByModule')}:
          </Text>
          <Select
            placeholder={t('selectModule')}
            style={{ width: 140, borderRadius: '8px' }}
            value={filters.system.module}
            onChange={(value) => setFilters(prev => ({ 
              ...prev, 
              system: { ...prev.system, module: value }
            }))}
            allowClear
            suffixIcon={<span style={{ color: '#6c757d' }}>▼</span>}
          >
            <Option value="system">⚙️ System</Option>
            <Option value="database">🗄️ Database</Option>
            <Option value="sftp">📁 SFTP</Option>
            <Option value="scheduler">⏰ Scheduler</Option>
            <Option value="decrypt">🔓 Decrypt</Option>
            <Option value="api">🔌 API</Option>
          </Select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong style={{ color: '#495057', fontSize: '14px', minWidth: '100px' }}>
            {t('filterByDateRange')}:
          </Text>
          <RangePicker
            value={[filters.system.startDate, filters.system.endDate]}
            onChange={(dates) => setFilters(prev => ({ 
              ...prev, 
              system: { 
                ...prev.system, 
                startDate: dates?.[0] || null, 
                endDate: dates?.[1] || null 
              }
            }))}
            style={{ borderRadius: '8px' }}
            placeholder={['开始日期', '结束日期']}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong style={{ color: '#495057', fontSize: '14px', minWidth: '100px' }}>
            {t('searchInMessage')}:
          </Text>
          <Input.Search
            placeholder={t('searchMessage')}
            style={{ width: 220, borderRadius: '8px' }}
            value={filters.system.searchText}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              system: { ...prev.system, searchText: e.target.value }
            }))}
            onSearch={() => handleFilter('system')}
            allowClear
            enterButton={
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                style={{ 
                  borderRadius: '0 8px 8px 0',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                {t('search')}
              </Button>
            }
          />
        </div>
        
        <Button 
          icon={<ReloadOutlined />} 
          onClick={() => {
            // 第一步：清除筛选条件和页码
            const clearedFilters = {
              level: '',
              module: '',
              startDate: null,
              endDate: null,
              searchText: ''
            };
            setFilters(prev => ({
              ...prev,
              system: clearedFilters
            }));
            setPagination(prev => ({ ...prev, current: 1 }));
            
            // 第二步：使用清空的筛选条件查询数据
            loadSystemLogs(1, clearedFilters);
          }}
          style={{
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            color: '#6c757d',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          {t('reset')}
        </Button>
      </div>
    </Card>
  );

  // 解密日志筛选器
  const DecryptLogFilter = () => (
    <Card 
      className="mb-4" 
      size="small"
      style={{
        background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
        border: '1px solid #bbdefb',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(33,150,243,0.1)'
      }}
    >
      <div className="mb-3" style={{ padding: '8px 0' }}>
        <Text 
          type="secondary" 
          style={{ 
            fontSize: '13px',
            color: '#1976d2',
            fontWeight: '500'
          }}
        >
          {t('decryptLogFilterDesc')}
        </Text>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong style={{ color: '#1976d2', fontSize: '14px', minWidth: '80px' }}>
            {t('filterByStatus')}:
          </Text>
          <Select
            placeholder={t('selectStatus')}
            style={{ width: 140, borderRadius: '8px' }}
            value={filters.decrypt.status}
            onChange={(value) => setFilters(prev => ({ 
              ...prev, 
              decrypt: { ...prev.decrypt, status: value }
            }))}
            allowClear
            suffixIcon={<span style={{ color: '#1976d2' }}>▼</span>}
          >
            <Option value="success">✅ 成功</Option>
            <Option value="failed">❌ 失败</Option>
          </Select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong style={{ color: '#1976d2', fontSize: '14px', minWidth: '100px' }}>
            {t('filterByDateRange')}:
          </Text>
          <RangePicker
            value={[filters.decrypt.startDate, filters.decrypt.endDate]}
            onChange={(dates) => setFilters(prev => ({ 
              ...prev, 
              decrypt: { 
                ...prev.decrypt, 
                startDate: dates?.[0] || null, 
                endDate: dates?.[1] || null 
              }
            }))}
            style={{ borderRadius: '8px' }}
            placeholder={['开始日期', '结束日期']}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong style={{ color: '#1976d2', fontSize: '14px', minWidth: '100px' }}>
            {t('searchInDate')}:
          </Text>
          <Input.Search
            placeholder={t('searchDate')}
            style={{ width: 220, borderRadius: '8px' }}
            value={filters.decrypt.searchText}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              decrypt: { ...prev.decrypt, searchText: e.target.value }
            }))}
            onSearch={() => handleFilter('decrypt')}
            allowClear
            enterButton={
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                style={{ 
                  borderRadius: '0 8px 8px 0',
                  background: 'linear-gradient(135deg, #2196f3 0%, #21cbf3 100%)',
                  border: 'none'
                }}
              >
                {t('search')}
              </Button>
            }
          />
        </div>
        
        <Button 
          icon={<ReloadOutlined />} 
          onClick={() => {
            // 第一步：清除筛选条件和页码
            const clearedFilters = {
              status: '',
              startDate: null,
              endDate: null,
              searchText: ''
            };
            setFilters(prev => ({
              ...prev,
              decrypt: clearedFilters
            }));
            setPagination(prev => ({ ...prev, current: 1 }));
            
            // 第二步：使用清空的筛选条件查询数据
            loadDecryptLogs(1, clearedFilters);
          }}
          style={{
            borderRadius: '8px',
            border: '1px solid #bbdefb',
            color: '#1976d2',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(33,150,243,0.2)'
          }}
        >
          {t('reset')}
        </Button>
      </div>
    </Card>
  );

  // 传输日志筛选器
  const TransferLogFilter = () => (
    <Card 
      className="mb-4" 
      size="small"
      style={{
        background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)',
        border: '1px solid #ce93d8',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(156,39,176,0.1)'
      }}
    >
      <div className="mb-3" style={{ padding: '8px 0' }}>
        <Text 
          type="secondary" 
          style={{ 
            fontSize: '13px',
            color: '#7b1fa2',
            fontWeight: '500'
          }}
        >
          {t('transferLogFilterDesc')}
        </Text>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong style={{ color: '#7b1fa2', fontSize: '14px', minWidth: '80px' }}>
            {t('filterByStatus')}:
          </Text>
          <Select
            placeholder={t('selectStatus')}
            style={{ width: 160, borderRadius: '8px' }}
            value={filters.transfer.status}
            onChange={(value) => setFilters(prev => ({ 
              ...prev, 
              transfer: { ...prev.transfer, status: value }
            }))}
            allowClear
            suffixIcon={<span style={{ color: '#7b1fa2' }}>▼</span>}
          >
            <Option value="success">✅ 成功</Option>
            <Option value="partial">⚠️ 部分成功</Option>
            <Option value="no_files">📭 无文件</Option>
            <Option value="failed">❌ 失败</Option>
          </Select>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong style={{ color: '#7b1fa2', fontSize: '14px', minWidth: '100px' }}>
            {t('filterByDateRange')}:
          </Text>
          <RangePicker
            value={[filters.transfer.startDate, filters.transfer.endDate]}
            onChange={(dates) => setFilters(prev => ({ 
              ...prev, 
              transfer: { 
                ...prev.transfer, 
                startDate: dates?.[0] || null, 
                endDate: dates?.[1] || null 
              }
            }))}
            style={{ borderRadius: '8px' }}
            placeholder={['开始日期', '结束日期']}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Text strong style={{ color: '#7b1fa2', fontSize: '14px', minWidth: '120px' }}>
            {t('searchInSyncDate')}:
          </Text>
          <Input.Search
            placeholder={t('searchSyncDate')}
            style={{ width: 220, borderRadius: '8px' }}
            value={filters.transfer.searchText}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              transfer: { ...prev.transfer, searchText: e.target.value }
            }))}
            onSearch={() => handleFilter('transfer')}
            allowClear
            enterButton={
              <Button 
                type="primary" 
                icon={<SearchOutlined />}
                style={{ 
                  borderRadius: '0 8px 8px 0',
                  background: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
                  border: 'none'
                }}
              >
                {t('search')}
              </Button>
            }
          />
        </div>
        
        <Button 
          icon={<ReloadOutlined />} 
          onClick={() => {
            // 第一步：清除筛选条件和页码
            const clearedFilters = {
              status: '',
              startDate: null,
              endDate: null,
              searchText: ''
            };
            setFilters(prev => ({
              ...prev,
              transfer: clearedFilters
            }));
            setPagination(prev => ({ ...prev, current: 1 }));
            
            // 第二步：使用清空的筛选条件查询数据
            loadTransferLogs(1, clearedFilters);
          }}
          style={{
            borderRadius: '8px',
            border: '1px solid #ce93d8',
            color: '#7b1fa2',
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(156,39,176,0.2)'
          }}
        >
          {t('reset')}
        </Button>
      </div>
    </Card>
  );

  // 系统日志列定义
  const systemLogColumns = [
    {
      title: t('colTime'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time) => formatDate(time, 'YYYY-MM-DD HH:mm:ss')
    },
    {
      title: t('colLevel'),
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level) => (
        <Tag color={getLevelColor(level)} icon={getLevelIcon(level)}>
          {level.toUpperCase()}
        </Tag>
      )
    },
    {
      title: t('colModule'),
      dataIndex: 'module',
      key: 'module',
      width: 100
    },
    {
      title: t('colAction'),
      dataIndex: 'action',
      key: 'action',
      width: 120
    },
    {
      title: t('colMessage'),
      dataIndex: 'message',
      key: 'message',
      width: 300,
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: t('colDetails'),
      dataIndex: 'details',
      key: 'details',
      width: 80,
      render: (details, record) => (
        <Button 
          type="link" 
          size="small" 
          onClick={() => handleViewSystemLogDetails(record)}
        >
          {t('view')}
        </Button>
      )
    }
  ];

  // 解密日志列定义
  const decryptLogColumns = [
    {
      title: t('colDate'),
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date) => date || '-'
    },
    {
      title: t('colStatus'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={status === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {status === 'success' ? t('success') : t('failed')}
        </Tag>
      )
    },
    {
      title: t('colCreatedTime'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (time) => formatDate(time, 'YYYY-MM-DD HH:mm:ss')
    }
  ];

  // 传输日志列定义
  const transferLogColumns = [
    {
      title: t('colTaskDate'),
      dataIndex: 'taskDate',
      key: 'taskDate',
      width: 120,
      render: (date) => formatDate(date, 'YYYY-MM-DD')
    },
    {
      title: t('colDuration'),
      dataIndex: 'duration',
      key: 'duration',
      width: 80,
      render: (duration) => duration ? `${Math.round(duration / 1000)}s` : '-'
    },
    {
      title: t('colTotalRules'),
      dataIndex: 'totalRules',
      key: 'totalRules',
      width: 80
    },
    {
      title: t('colTotalFiles'),
      dataIndex: 'totalFiles',
      key: 'totalFiles',
      width: 80
    },
    {
      title: t('colSuccess'),
      dataIndex: 'successCount',
      key: 'successCount',
      width: 80,
      render: (count) => <Tag color="green">{count}</Tag>
    },
    {
      title: t('colSkipped'),
      dataIndex: 'skippedCount',
      key: 'skippedCount',
      width: 80,
      render: (count) => <Tag color="orange">{count}</Tag>
    },
    {
      title: t('colFailed'),
      dataIndex: 'failedCount',
      key: 'failedCount',
      width: 80,
      render: (count) => <Tag color="red">{count}</Tag>
    },
    {
      title: t('colStatus'),
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {t(`status_${status}`)}
        </Tag>
      )
    },
    {
      title: t('colActions'),
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewDetails(record)}>
            {t('viewDetails')}
          </Button>
        </Space>
      )
    }
  ];

  // 查看传输日志详情
  const handleViewDetails = async (record) => {
    try {
      const response = await systemLogsService.getTransferTaskDetails(record._id);
      if (response.success) {
        // 后端返回的数据结构是 { task, rules, files }
        // 需要将规则数据转换为前端期望的格式
        const taskData = response.data.task;
        const rules = response.data.rules || [];
        
        // 转换规则数据格式以匹配前端期望
        const ruleResults = rules.map(rule => ({
          ruleId: rule.ruleId?._id || rule.ruleId,
          ruleName: rule.ruleName || rule.ruleId?.name || '未命名规则',
          module: rule.module || rule.ruleId?.module || 'unknown',
          periodType: rule.ruleId?.schedule?.period || 'adhoc',
          totalFiles: rule.totalFiles || 0,
          syncedFiles: rule.successCount || 0,
          skippedFiles: rule.skippedCount || 0,
          failedFiles: rule.failedCount || 0,
          status: rule.status || 'unknown',
          message: rule.message || ''
        }));
        
        // 合并任务数据和规则结果
        const sessionData = {
          ...taskData,
          ruleResults: ruleResults
        };
        
        setSelectedSession(sessionData);
        setDetailsModalVisible(true);
      }
    } catch (error) {
      console.error('获取传输日志详情失败:', error);
    }
  };

  // 查看系统日志详情
  const handleViewSystemLogDetails = (record) => {
    setSystemLogDetails(record);
    setSystemDetailsModalVisible(true);
  };

  // 初始化加载
  React.useEffect(() => {
    loadSystemLogs();
  }, []);

  // 处理从首页跳转过来的activeTab参数
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // 根据activeTab加载对应数据
      if (location.state.activeTab === 'transfer') {
        loadTransferLogs();
      } else if (location.state.activeTab === 'decrypt') {
        loadDecryptLogs();
      }
    }
  }, [location.state]);

  // 切换标签页
  const handleTabChange = (key) => {
    setActiveTab(key);
    setPagination(prev => ({ ...prev, current: 1 }));
    switch (key) {
      case 'system':
        loadSystemLogs(1);
        break;
      case 'decrypt':
        loadDecryptLogs(1);
        break;
      case 'transfer':
        loadTransferLogs(1);
        break;
    }
  };

  return (
    <>
      <style>
        {`
          .modern-table .ant-table-thead > tr > th {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-bottom: 2px solid #dee2e6;
            font-weight: 600;
            color: #495057;
            padding: 16px 12px;
          }
          .modern-table .ant-table-tbody > tr > td {
            padding: 12px;
            border-bottom: 1px solid #f1f3f4;
          }
          .modern-table .ant-table-tbody > tr:hover > td {
            background: #f8f9fa;
          }
          .ant-tabs-content-holder {
            background: white;
            border-radius: 0 0 8px 8px;
            padding: 24px;
          }
        `}
      </style>
      <PageContainer>
        <PageTitle
          title={t('systemLogs')}
          subtitle={t('systemLogsDescription')}
          icon={<FileTextOutlined />}
        />



      {/* 日志标签页 */}
      <Card 
        style={{
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: 'none',
          overflow: 'hidden'
        }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
        >
          <TabPane tab={t('systemLogsTab')} key="system">
            <SystemLogFilter />
            <ModernTable
              columns={systemLogColumns}
              dataSource={systemLogs}
              loading={loading}
              pagination={{
                ...pagination,
                onChange: handlePageChange,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `共 ${total} 条记录，显示第 ${range[0]}-${range[1]} 条`,
                style: {
                  marginTop: '16px',
                  textAlign: 'right'
                }
              }}
              rowKey="_id"
              scroll={{ x: 1000 }}
            />
          </TabPane>
          
          <TabPane tab={t('decryptLogsTab')} key="decrypt">
            <DecryptLogFilter />
            <ModernTable
              columns={decryptLogColumns}
              dataSource={decryptLogs}
              loading={loading}
              pagination={{
                ...pagination,
                onChange: handlePageChange,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `共 ${total} 条记录，显示第 ${range[0]}-${range[1]} 条`,
                style: {
                  marginTop: '16px',
                  textAlign: 'right'
                }
              }}
              rowKey="_id"
            />
          </TabPane>
          
          <TabPane tab={t('transferLogsTab')} key="transfer">
            <TransferLogFilter />
            <ModernTable
              columns={transferLogColumns}
              dataSource={transferLogs}
              loading={loading}
              pagination={{
                ...pagination,
                onChange: handlePageChange,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `共 ${total} 条记录，显示第 ${range[0]}-${range[1]} 条`,
                style: {
                  marginTop: '16px',
                  textAlign: 'right'
                }
              }}
              rowKey="_id"
              scroll={{ x: 1000 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 传输日志详情模态框 */}
      <TransferLogDetailsModal
        visible={detailsModalVisible}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedSession(null);
        }}
        sessionData={selectedSession}
      />

      {/* 系统日志详情模态框 */}
      <Modal
        title={t('systemLogDetails')}
        open={systemDetailsModalVisible}
        onCancel={() => {
          setSystemDetailsModalVisible(false);
          setSystemLogDetails(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setSystemDetailsModalVisible(false);
            setSystemLogDetails(null);
          }}>
            {t('close')}
          </Button>
        ]}
        width={800}
      >
        {systemLogDetails && (
          <div>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={t('colTime')}>
                {formatDate(systemLogDetails.createdAt, 'YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label={t('colLevel')}>
                <Tag color={getLevelColor(systemLogDetails.level)} icon={getLevelIcon(systemLogDetails.level)}>
                  {systemLogDetails.level.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('colModule')}>
                {systemLogDetails.module}
              </Descriptions.Item>
              <Descriptions.Item label={t('colAction')}>
                {systemLogDetails.action}
              </Descriptions.Item>
              <Descriptions.Item label={t('colMessage')}>
                {systemLogDetails.message}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <div>
              <h4>{t('technicalDetails')}</h4>
              <pre style={{
                background: '#f5f5f5',
                padding: '12px',
                borderRadius: '4px',
                fontSize: '12px',
                maxHeight: '400px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {JSON.stringify(systemLogDetails.details, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
      </PageContainer>
    </>
  );
};

export default SystemLogsPage;
