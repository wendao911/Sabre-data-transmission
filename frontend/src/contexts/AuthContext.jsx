import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { tokenManager } from '../utils/tokenManager';

const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenStatus, setTokenStatus] = useState(null);

  const initialize = async () => {
    try {
      setIsLoading(true);
      const token = tokenManager.getToken();
      if (token) {
        // 检查 token 是否过期
        if (tokenManager.isExpired()) {
          console.log('Token expired, clearing...');
          tokenManager.clearToken();
          setUser(null);
          setTokenStatus(null);
          return;
        }

        const userData = await authService.verifyToken(token);
        if (userData) {
          setUser(userData);
          // 更新 token 状态
          const status = tokenManager.checkTokenStatus();
          setTokenStatus(status);
        } else {
          tokenManager.clearToken();
          setUser(null);
          setTokenStatus(null);
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      tokenManager.clearToken();
      setUser(null);
      setTokenStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 在组件挂载时初始化认证状态
  useEffect(() => {
    initialize();
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const tokenResult = tokenManager.setToken(response.token);
      if (tokenResult.success) {
        setUser(response.user);
        setTokenStatus(tokenManager.checkTokenStatus());
        return { success: true };
      } else {
        return { success: false, error: 'Token storage failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const response = await authService.register(name, email, password);
      const tokenResult = tokenManager.setToken(response.token);
      if (tokenResult.success) {
        setUser(response.user);
        setTokenStatus(tokenManager.checkTokenStatus());
        return { success: true };
      } else {
        return { success: false, error: 'Token storage failed' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(() => {
    tokenManager.clearToken();
    setUser(null);
    setTokenStatus(null);
  }, []);

  // 定期检查 token 状态
  useEffect(() => {
    if (!user) return;

    const checkTokenStatus = () => {
      const status = tokenManager.checkTokenStatus();
      setTokenStatus(status);

      if (status.isExpired) {
        console.log('Token expired, logging out...');
        logout();
      }
    };

    // 立即检查一次
    checkTokenStatus();

    // 每分钟检查一次
    const interval = setInterval(checkTokenStatus, 60000);

    return () => clearInterval(interval);
  }, [user, logout]);

  const value = {
    user,
    isLoading,
    tokenStatus,
    initialize,
    login,
    register,
    logout,
    tokenManager,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
