import { useLanguage as useGlobalLanguage } from '../../../hooks/useLanguage';
import { getHomePageTranslation } from '../utils/translations';

export const useLanguage = () => {
  const { currentLanguage } = useGlobalLanguage();
  const t = (key, params = {}) => getHomePageTranslation(key, currentLanguage, params);
  
  return { t, language: currentLanguage };
};
