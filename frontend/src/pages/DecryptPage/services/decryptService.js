import { decryptService as apiDecryptService } from '../../../services/decrypt';
import { getApiBaseUrl } from '../../../utils/config';

export const decryptService = {
  async startDecrypt(params, callbacks = {}) {
    const { onProgress } = callbacks;
    
    try {
      // 开启进度流
      const eventSource = new EventSource(`${getApiBaseUrl()}/decrypt/progress`);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (onProgress) {
            onProgress(data);
          }
        } catch (error) {
          console.error('解析SSE数据失败:', error);
        }
      };

      eventSource.onerror = () => {
        console.error('SSE连接错误');
        eventSource.close();
      };

      // 启动解密
      const result = await apiDecryptService.startDecrypt(params);
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error || '解密启动失败');
      }
    } catch (error) {
      console.error('解密服务错误:', error);
      throw error;
    }
  },

  async getStatus() {
    try {
      const result = await apiDecryptService.getStatus();
      return result;
    } catch (error) {
      console.error('获取解密状态失败:', error);
      throw error;
    }
  }
};
