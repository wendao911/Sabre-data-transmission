import React from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { 
  HomeOutlined, 
  FileOutlined, 
  UnlockOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  ControlOutlined,
  InfoCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import logo from '../../../assets/logo.png';
import logoCollapsed from '../../../assets/logo-2.png';

const { Sider } = AntLayout;

const Sidebar = ({ collapsed, onMenuClick, t }) => {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: t('home'),
    },
    {
      key: '/files',
      icon: <FileOutlined />,
      label: t('fileManagement'),
    },
    {
      key: '/decrypt',
      icon: <UnlockOutlined />,
      label: t('fileDecrypt'),
    },
    {
      key: '/sftp',
      icon: <CloudUploadOutlined />,
      label: t('sftpTransfer'),
    },
    {
      key: 'system-config',
      icon: <ControlOutlined />,
      label: t('systemConfig'),
      children: [
        {
          key: '/system-config/sftp-connection',
          label: t('sftpConnectionConfig'),
        },
        {
          key: '/system-config/scheduled-task',
          label: t('scheduledTaskConfig'),
        },
        {
          key: '/system-config/file-mapping',
          label: t('fileMapping'),
        },
        {
          key: '/system-config/file-type',
          label: t('fileTypeConfig'),
        },
      ],
    },
    {
      key: '/system-logs',
      icon: <FileTextOutlined />,
      label: t('systemLogs'),
    },
    {
      key: '/about',
      icon: <InfoCircleOutlined />,
      label: t('about'),
    },
  ];

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      className="shadow-lg"
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        {collapsed ? (
          <img 
            src={logoCollapsed} 
            alt="Logo" 
            className="h-10 w-auto mx-auto"
          />
        ) : (
          <div className="flex items-center justify-center space-x-2 w-full">
            <img 
              src={logo} 
              alt="Logo" 
              className="h-10 w-auto"
            />
          </div>
        )}
      </div>
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={onMenuClick}
        className="border-r-0"
      />
    </Sider>
  );
};

export default Sidebar;
