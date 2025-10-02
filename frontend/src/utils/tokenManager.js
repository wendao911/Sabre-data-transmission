/**
 * Token 管理工具类
 * 处理 JWT token 的存储、验证、刷新和过期检查
 */

class TokenManager {
  constructor() {
    this.TOKEN_KEY = 'auth_token';
    this.TOKEN_EXPIRY_KEY = 'auth_token_expiry';
    this.REFRESH_THRESHOLD = 30 * 60 * 1000; // 30分钟前开始提醒刷新
    this.EXPIRY_WARNING_THRESHOLD = 5 * 60 * 1000; // 5分钟前开始警告
  }

  /**
   * 存储 token 和过期时间
   * @param {string} token - JWT token
   */
  setToken(token) {
    try {
      // 解析 token 获取过期时间
      const payload = this.parseToken(token);
      const expiryTime = payload.exp * 1000; // 转换为毫秒
      
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
      
      return {
        success: true,
        expiryTime: new Date(expiryTime)
      };
    } catch (error) {
      console.error('Token storage failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 获取当前 token
   * @returns {string|null}
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * 清除 token
   */
  clearToken() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  /**
   * 解析 JWT token
   * @param {string} token - JWT token
   * @returns {object} - 解析后的 payload
   */
  parseToken(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  /**
   * 检查 token 是否过期
   * @returns {object} - { isExpired: boolean, timeLeft: number, status: string }
   */
  checkTokenStatus() {
    const token = this.getToken();
    if (!token) {
      return { isExpired: true, timeLeft: 0, status: 'no_token' };
    }

    try {
      const expiryTime = parseInt(localStorage.getItem(this.TOKEN_EXPIRY_KEY));
      if (!expiryTime) {
        return { isExpired: true, timeLeft: 0, status: 'invalid_expiry' };
      }

      const now = Date.now();
      const timeLeft = expiryTime - now;

      if (timeLeft <= 0) {
        return { isExpired: true, timeLeft: 0, status: 'expired' };
      }

      // 检查是否需要提醒刷新
      if (timeLeft <= this.EXPIRY_WARNING_THRESHOLD) {
        return { isExpired: false, timeLeft, status: 'warning' };
      }

      if (timeLeft <= this.REFRESH_THRESHOLD) {
        return { isExpired: false, timeLeft, status: 'refresh_needed' };
      }

      return { isExpired: false, timeLeft, status: 'valid' };
    } catch (error) {
      console.error('Token status check failed:', error);
      return { isExpired: true, timeLeft: 0, status: 'error' };
    }
  }

  /**
   * 获取 token 剩余时间（人类可读格式）
   * @returns {string}
   */
  getTimeLeftFormatted() {
    const { timeLeft } = this.checkTokenStatus();
    
    if (timeLeft <= 0) {
      return '已过期';
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds}秒`;
    } else {
      return `${seconds}秒`;
    }
  }

  /**
   * 检查 token 是否即将过期（需要刷新）
   * @returns {boolean}
   */
  needsRefresh() {
    const { status } = this.checkTokenStatus();
    return status === 'refresh_needed' || status === 'warning';
  }

  /**
   * 检查 token 是否已过期
   * @returns {boolean}
   */
  isExpired() {
    const { isExpired } = this.checkTokenStatus();
    return isExpired;
  }

  /**
   * 获取 token 信息
   * @returns {object|null}
   */
  getTokenInfo() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = this.parseToken(token);
      const { timeLeft, status } = this.checkTokenStatus();
      
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        issuedAt: new Date(payload.iat * 1000),
        expiresAt: new Date(payload.exp * 1000),
        timeLeft,
        status,
        timeLeftFormatted: this.getTimeLeftFormatted()
      };
    } catch (error) {
      console.error('Get token info failed:', error);
      return null;
    }
  }
}

// 创建单例实例
export const tokenManager = new TokenManager();
export default tokenManager;
