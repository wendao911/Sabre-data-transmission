import { useLanguage as useGlobalLanguage } from '../../../hooks/useLanguage';
import { useTheme as useGlobalTheme } from '../../../hooks/useTheme';
import { getLayoutTranslation } from '../utils/translations';

// Layout 组件专用的语言 Hook
export const useLanguage = () => {
  const { currentLanguage, changeLanguage } = useGlobalLanguage();

  // 获取翻译文本
  const t = (key) => {
    return getLayoutTranslation(key, currentLanguage);
  };

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};

// Layout 组件专用的主题 Hook
export const useTheme = () => {
  return useGlobalTheme();
};
