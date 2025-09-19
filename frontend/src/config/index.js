// 配置管理入口文件
import developmentConfig from './development';
import productionConfig from './production';

// 根据环境变量确定当前环境
const getEnvironment = () => {
  // 简化环境检测，直接使用 NODE_ENV
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  
  // 默认返回开发环境
  return 'development';
};

// 获取当前环境配置
const getConfig = () => {
  const env = getEnvironment();
  
  switch (env) {
    case 'production':
      return productionConfig;
    case 'development':
    default:
      return developmentConfig;
  }
};

// 导出当前配置
export const config = getConfig();
export const environment = getEnvironment();

// 导出所有配置（用于调试）
export {
  developmentConfig,
  productionConfig,
};

// 配置验证函数
export const validateConfig = (config) => {
  const requiredFields = [
    'api.baseURL',
    'app.name',
    'app.version',
    'app.environment',
  ];

  const missingFields = requiredFields.filter(field => {
    const keys = field.split('.');
    let current = config;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return true;
      }
    }
    return false;
  });

  if (missingFields.length > 0) {
    throw new Error(`配置验证失败，缺少必需字段: ${missingFields.join(', ')}`);
  }

  return true;
};

// 配置合并函数（用于覆盖默认配置）
export const mergeConfig = (baseConfig, overrideConfig) => {
  const merge = (target, source) => {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        merge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  };

  return merge({ ...baseConfig }, overrideConfig);
};

// 环境特定配置获取器
export const getConfigByEnvironment = (env) => {
  switch (env) {
    case 'production':
      return productionConfig;
    case 'development':
    default:
      return developmentConfig;
  }
};

// 手动设置环境（用于测试或特殊场景）
export const setEnvironment = (env) => {
  if (typeof window !== 'undefined') {
    window.ENV = env;
  }
  // 重新获取配置
  return getConfig();
};

// 默认导出
export default config;