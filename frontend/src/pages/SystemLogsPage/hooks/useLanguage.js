import { useLanguage as useGlobalLanguage } from '../../../hooks/useLanguage';
import { getSystemLogsTranslation } from '../utils/translations';

export const useLanguage = () => {
  const { currentLanguage } = useGlobalLanguage();
  const t = (key, params = {}) => getSystemLogsTranslation(key, currentLanguage, params);
  
  return { t, language: currentLanguage };
};
