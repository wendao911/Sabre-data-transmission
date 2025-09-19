import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

export const useLoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    
    try {
      let result;
      if (isLogin) {
        result = await login(values.email, values.password);
      } else {
        result = await register(values.name, values.email, values.password);
      }
      
      if (result.success) {
        toast.success(isLogin ? '登录成功！' : '注册成功！');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const clearError = () => {
    setError('');
  };

  return {
    isLogin,
    loading,
    error,
    handleSubmit,
    toggleMode,
    clearError
  };
};
