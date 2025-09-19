import { useLanguage as useGlobalLanguage } from '../../../hooks/useLanguage';
import { getFileBrowserTranslation } from '../utils/translations';

// 文件浏览器页面专用的语言 Hook
export const useLanguage = () => {
  const { currentLanguage, changeLanguage } = useGlobalLanguage();

  // 获取翻译文本
  const t = (key) => {
    return getFileBrowserTranslation(key, currentLanguage);
  };

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};
