import { fileService, healthService } from '../../../services';

export const homeService = {
  async getStats() {
    try {
      // 这里可以调用多个 API 来获取统计数据
      const [filesResponse, decryptResponse, healthResponse] = await Promise.allSettled([
        fileService.listEncryptedGroups(),
        fileService.listDecryptedDirs(),
        healthService.check()
      ]);

      const totalFiles = filesResponse.status === 'fulfilled' 
        ? filesResponse.value?.total || 0 
        : 0;
      
      const decryptedFiles = decryptResponse.status === 'fulfilled' 
        ? decryptResponse.value?.total || 0 
        : 0;
      
      const systemStatus = healthResponse.status === 'fulfilled' 
        ? '正常' 
        : '异常';

      return {
        totalFiles,
        decryptedFiles,
        systemStatus
      };
    } catch (error) {
      console.error('Error fetching home stats:', error);
      return {
        totalFiles: 0,
        decryptedFiles: 0,
        systemStatus: '异常'
      };
    }
  }
};
