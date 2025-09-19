import React from 'react';
import { Layout as AntLayout, Button, Avatar, Dropdown, Space, Select } from 'antd';
import { 
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import { useLanguage, useTheme } from '../hooks/useLanguage';
import { getSupportedLanguages } from '../../../utils/i18n';

const { Header: AntHeader } = AntLayout;

const AppHeader = ({ collapsed, onToggleCollapse, user, onLogout, t }) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('logout'),
      onClick: onLogout,
    },
  ];

  const languageOptions = getSupportedLanguages().map(lang => ({
    value: lang.key,
    label: lang.label
  }));

  return (
    <AntHeader className="bg-white px-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleCollapse}
          className="text-lg"
          title={collapsed ? t('expand') : t('collapse')}
        />
      </div>
      
      <div className="flex items-center space-x-4">
        {/* 语言切换 */}
        <Select
          value={currentLanguage}
          onChange={changeLanguage}
          options={languageOptions}
          size="small"
          style={{ width: 100 }}
          suffixIcon={<GlobalOutlined />}
        />
        
        {/* 主题切换 */}
        <Button
          type="text"
          icon={theme === 'light' ? <MoonOutlined /> : <SunOutlined />}
          onClick={toggleTheme}
          title={theme === 'light' ? t('dark') : t('light')}
        />
        
        {/* 用户信息 */}
        <Space>
          <span className="text-gray-600">
            {t('welcome')}, {user?.name}
          </span>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Avatar 
              icon={<UserOutlined />} 
              className="cursor-pointer hover:opacity-80"
            />
          </Dropdown>
        </Space>
      </div>
    </AntHeader>
  );
};

export default AppHeader;
