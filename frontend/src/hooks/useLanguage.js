import { useState, useEffect } from 'react';
import { languageManager } from '../utils/i18n';

// 全局语言状态管理 Hook
export const useLanguage = () => {
  const [currentLanguage, setCurrentLanguage] = useState(languageManager.getLanguage());

  useEffect(() => {
    const unsubscribe = languageManager.subscribe((language) => {
      setCurrentLanguage(language);
    });

    return unsubscribe;
  }, []);

  // 切换语言
  const changeLanguage = (language) => {
    return languageManager.setLanguage(language);
  };

  return {
    currentLanguage,
    changeLanguage
  };
};
