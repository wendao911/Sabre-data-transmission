// 与解密页面统一：接全局语言，并使用页面专用字典
import { useLanguage as useGlobalLanguage } from '../../../hooks/useLanguage';
import { getSftpTransferTranslation } from '../utils/translations';

export const useLanguage = () => {
  const { currentLanguage, changeLanguage } = useGlobalLanguage();
  const t = (key, params = {}) => getSftpTransferTranslation(key, currentLanguage, params);
  return { t, currentLanguage, changeLanguage };
};


