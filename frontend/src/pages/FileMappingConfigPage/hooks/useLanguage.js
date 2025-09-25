import { useLanguage as useGlobalLanguage } from '../../../hooks/useLanguage';
import { getFileMappingTranslation } from '../utils/translations';

// 文件映射页面专用的语言 Hook
export const useLanguage = () => {
  const { currentLanguage, changeLanguage } = useGlobalLanguage();

  // 获取翻译文本
  const t = (key, params = {}) => {
    return getFileMappingTranslation(key, currentLanguage, params);
  };

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};
