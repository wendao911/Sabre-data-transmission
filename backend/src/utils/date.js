/**
 * 日期工具类
 * 提供统一的日期格式化和解析功能
 */

/**
 * 格式化日期为指定格式
 * @param {Date|string|number} date - 日期对象、字符串或时间戳
 * @param {string} format - 目标格式，支持 YYYY, MM, DD, HH, mm, ss 等占位符
 * @param {Object} options - 配置选项
 * @param {string} options.timezone - 时区，默认 'local'
 * @param {string} options.locale - 语言环境，默认 'km-KH'
 * @returns {string} 格式化后的日期字符串
 * @throws {Error} 当日期无效或格式不支持时抛出错误
 */
function formatDate(date, format, options = {}) {
  const { timezone = 'local', locale = 'km-KH' } = options;
  
  // 输入验证和标准化
  const normalizedDate = normalizeDateInput(date);
  if (!normalizedDate) {
    throw new Error(`Invalid date input: ${date}`);
  }
  
  // 时区处理
  const targetDate = timezone === 'local' ? normalizedDate : adjustTimezone(normalizedDate, timezone);
  
  // 格式解析和渲染
  return renderDateFormat(targetDate, format, locale);
}

/**
 * 标准化日期输入
 * @param {*} input - 任意输入
 * @returns {Date|null} 标准化的日期对象或null
 */
function normalizeDateInput(input) {
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }
  
  if (typeof input === 'string') {
    // 智能解析多种字符串格式
    const parsed = parseDateString(input);
    return parsed && !isNaN(parsed.getTime()) ? parsed : null;
  }
  
  if (typeof input === 'number') {
    const parsed = new Date(input);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  
  return null;
}

/**
 * 解析日期字符串
 * @param {string} str - 日期字符串
 * @returns {Date} 解析后的日期对象
 */
function parseDateString(str) {
  // 处理常见格式
  const patterns = [
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    /^(\d{4})(\d{2})(\d{2})$/ // 新增：YYYYMMDD
  ];
  
  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match) {
      const [, part1, part2, part3] = match;
      // 智能判断年月日顺序
      if (part1.length === 4) {
        return new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3));
      } else {
        return new Date(parseInt(part3), parseInt(part2) - 1, parseInt(part1));
      }
    }
  }
  
  // 回退到原生解析
  return new Date(str);
}

/**
 * 时区调整
 * @param {Date} date - 原始日期
 * @param {string} timezone - 目标时区
 * @returns {Date} 调整后的日期
 */
function adjustTimezone(date, timezone) {
  // 简化实现，实际项目中应使用 moment-timezone 或 date-fns-tz
  return date;
}

/**
 * 渲染日期格式
 * @param {Date} date - 日期对象
 * @param {string} format - 格式字符串
 * @param {string} locale - 语言环境
 * @returns {string} 格式化结果
 */
function renderDateFormat(date, format, locale) {
  const components = {
    YYYY: date.getFullYear(),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    DD: String(date.getDate()).padStart(2, '0'),
    HH: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0'),
    YY: String(date.getFullYear()).slice(-2),
    M: date.getMonth() + 1,
    D: date.getDate(),
    H: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds()
  };
  
  // 预定义格式映射
  const predefinedFormats = {
    'YYYY-MM-DD': 'YYYY-MM-DD',
    'YYYYMMDD': 'YYYYMMDD',
    'YYYY/MM/DD': 'YYYY/MM/DD',
    'MM-DD-YYYY': 'MM-DD-YYYY',
    'DD/MM/YYYY': 'DD/MM/YYYY',
    'YYYY-MM-DD HH:mm:ss': 'YYYY-MM-DD HH:mm:ss',
    'YYYY年MM月DD日': 'YYYY年MM月DD日'
  };
  
  const actualFormat = predefinedFormats[format] || format;
  
  // 替换占位符
  return actualFormat.replace(/(YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s)/g, (match) => {
    return components[match] !== undefined ? components[match] : match;
  });
}

/**
 * 智能替换日期变量
 * 支持多种格式：{date} -> YYYYMMDD, {Date:YYYY-MM-DD} -> YYYY-MM-DD, {Date:YYYY/MM/DD} -> YYYY/MM/DD 等
 * @param {string} str - 包含日期变量的字符串
 * @param {Date|string|number} date - 日期输入
 * @returns {string} 替换后的字符串
 */
function replaceDateVariables(str, date) {
  if (!str || typeof str !== 'string') return str;
  
  // 处理 {date} 变量 -> YYYYMMDD
  str = str.replace(/{date}/g, formatDate(date, 'YYYYMMDD'));
  
  // 处理 {Date:格式} 变量 -> 对应格式
  str = str.replace(/{Date:([^}]+)}/g, (match, format) => {
    try {
      return formatDate(date, format);
    } catch (error) {
      console.warn(`无法解析日期格式 "${format}":`, error.message);
      return match; // 保持原样
    }
  });
  
  return str;
}

module.exports = {
  formatDate,
  normalizeDateInput,
  parseDateString,
  adjustTimezone,
  renderDateFormat,
  replaceDateVariables
};
