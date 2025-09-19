// 公共国际化工具
export const languages = {
  zh: '中文',
  en: 'English'
};

export const defaultLanguage = 'zh';

// 获取当前语言
export const getCurrentLanguage = () => {
  return localStorage.getItem('language') || defaultLanguage;
};

// 设置语言
export const setLanguage = (language) => {
  if (languages[language]) {
    localStorage.setItem('language', language);
    return true;
  }
  return false;
};

// 获取支持的语言列表
export const getSupportedLanguages = () => {
  return Object.keys(languages).map(key => ({
    key,
    label: languages[key]
  }));
};

// 语言状态管理
class LanguageManager {
  constructor() {
    this.listeners = new Set();
    this.currentLanguage = getCurrentLanguage();
  }

  // 订阅语言变化
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 获取当前语言
  getLanguage() {
    return this.currentLanguage;
  }

  // 设置语言
  setLanguage(language) {
    if (setLanguage(language)) {
      this.currentLanguage = language;
      this.notifyListeners();
      return true;
    }
    return false;
  }

  // 通知所有监听器
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentLanguage));
  }
}

// 全局语言管理器实例
export const languageManager = new LanguageManager();
