import { useLanguage as useGlobalLanguage } from '../../../hooks/useLanguage';
import { getScheduledTaskTranslation } from '../utils/translations';

// 定时任务配置页面专用的语言 Hook
export const useLanguage = () => {
  const { currentLanguage, changeLanguage } = useGlobalLanguage();

  // 获取翻译文本
  const t = (key) => {
    return getScheduledTaskTranslation(key, currentLanguage);
  };

  return {
    currentLanguage,
    changeLanguage,
    t
  };
};
