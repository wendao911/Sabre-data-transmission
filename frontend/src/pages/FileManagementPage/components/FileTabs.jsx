import React from 'react';
import { Tabs } from 'antd';
import { FileOutlined, UnlockOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const FileTabs = ({ activeTab, onTabChange }) => {
  return (
    <Tabs 
      activeKey={activeTab} 
      onChange={onTabChange}
      type="card"
    >
      <TabPane 
        tab={
          <span>
            <FileOutlined />
            加密文件
          </span>
        } 
        key="encrypted" 
      />
      <TabPane 
        tab={
          <span>
            <UnlockOutlined />
            解密文件
          </span>
        } 
        key="decrypted" 
      />
    </Tabs>
  );
};

export { FileTabs };
