import { useLanguage as useGlobalLanguage } from '../../../hooks/useLanguage';
import { getDecryptTranslation } from '../utils/translations';

// 解密页面专用的语言 Hook
export const useLanguage = () => {
  const { currentLanguage, changeLanguage } = useGlobalLanguage();

  // 获取翻译文本
  const t = (key, params = {}) => {
    return getDecryptTranslation(key, currentLanguage, params);
  };

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};
