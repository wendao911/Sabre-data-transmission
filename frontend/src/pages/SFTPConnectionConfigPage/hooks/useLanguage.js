import { useLanguage as useGlobalLanguage } from '../../../hooks/useLanguage';
import { getSFTPConfigTranslation } from '../utils/translations';

// SFTP 连接配置页面专用的语言 Hook
export const useLanguage = () => {
  const { currentLanguage, changeLanguage } = useGlobalLanguage();

  // 获取翻译文本
  const t = (key) => {
    return getSFTPConfigTranslation(key, currentLanguage);
  };

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};
