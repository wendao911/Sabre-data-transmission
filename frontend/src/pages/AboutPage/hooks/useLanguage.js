import { useLanguage as useGlobalLanguage } from '../../../hooks/useLanguage';
import { getAboutPageTranslation } from '../utils/translations';

export const useLanguage = () => {
  const { currentLanguage } = useGlobalLanguage();
  const t = (key, params = {}) => getAboutPageTranslation(key, currentLanguage, params);
  
  return { t, language: currentLanguage };
};
