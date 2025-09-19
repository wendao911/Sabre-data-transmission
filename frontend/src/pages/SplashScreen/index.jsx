import React from 'react';
import { Spin } from 'antd';
import { FileOutlined } from '@ant-design/icons';

const SplashScreen = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="mb-8">
          <FileOutlined className="text-6xl text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sabre Data Management Desktop</h1>
          <p className="text-gray-600">文件浏览与解密系统</p>
        </div>
        <Spin size="large" />
        <p className="mt-4 text-gray-500">正在加载...</p>
      </div>
    </div>
  );
};

export default SplashScreen;


