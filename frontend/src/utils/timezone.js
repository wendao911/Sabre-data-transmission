import config from '../config';

/**
 * 时区工具函数
 */
export const timezoneUtils = {
  /**
   * 获取配置的时区
   */
  getTimezone() {
    return config.timezone?.timezone || 'Asia/Phnom_Penh';
  },

  /**
   * 获取时区偏移
   */
  getOffset() {
    return config.timezone?.offset || '+07:00';
  },

  /**
   * 获取时区显示名称
   */
  getDisplayName() {
    return config.timezone?.displayName || '柬埔寨时间 (UTC+7)';
  },

  /**
   * 将日期转换为柬埔寨时区
   * @param {Date|string} date - 要转换的日期
   * @returns {Date} 柬埔寨时区的日期
   */
  toCambodiaTime(date) {
    const timezone = this.getTimezone();
    const inputDate = date instanceof Date ? date : new Date(date);
    return new Date(inputDate.toLocaleString("en-US", { timeZone: timezone }));
  },

  /**
   * 格式化日期为柬埔寨时区字符串
   * @param {Date|string} date - 要格式化的日期
   * @param {Object} options - 格式化选项
   * @returns {string} 格式化后的日期字符串
   */
  formatInCambodiaTime(date, options = {}) {
    const timezone = this.getTimezone();
    const inputDate = date instanceof Date ? date : new Date(date);
    
    const defaultOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone,
      timeZoneName: 'short'
    };

    return inputDate.toLocaleString('zh-CN', { ...defaultOptions, ...options });
  },

  /**
   * 获取当前柬埔寨时间
   * @returns {Date} 当前柬埔寨时间
   */
  now() {
    return this.toCambodiaTime(new Date());
  },

  /**
   * 检查是否为柬埔寨时区
   * @param {Date} date - 要检查的日期
   * @returns {boolean} 是否为柬埔寨时区
   */
  isCambodiaTime(date) {
    const timezone = this.getTimezone();
    const inputDate = date instanceof Date ? date : new Date(date);
    const cambodiaTime = this.toCambodiaTime(inputDate);
    
    // 比较时间戳是否相同（在误差范围内）
    const diff = Math.abs(inputDate.getTime() - cambodiaTime.getTime());
    return diff < 1000; // 1秒误差范围内
  }
};

export default timezoneUtils;
