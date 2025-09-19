import { useState, useEffect } from 'react';
import { homeService } from '../services/homeService';

export const useHomePage = () => {
  const [stats, setStats] = useState({
    totalFiles: 0,
    decryptedFiles: 0,
    systemStatus: '正常'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await homeService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // 保持默认值
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
