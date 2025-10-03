import { useLanguage as useGlobalLanguage } from '../../../hooks/useLanguage';
import { getFileTypeConfigTranslation } from '../utils/translations';

export const useLanguage = () => {
  const { currentLanguage } = useGlobalLanguage();
  const t = (key, params = {}) => getFileTypeConfigTranslation(key, currentLanguage, params);
  
  return { t, language: currentLanguage };
};
