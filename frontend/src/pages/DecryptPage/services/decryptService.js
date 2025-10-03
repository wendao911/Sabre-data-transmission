import decryptServiceAPI from '../../../services/decryptService';

export const decryptService = {
  // 获取带解密状态的日期列表
  async getEncryptedDatesWithStatus() {
    try {
      const result = await decryptServiceAPI.getEncryptedDatesWithStatus();
      return result;
    } catch (error) {
      console.error('获取加密文件日期状态失败:', error);
      throw error;
    }
  },

  // 获取已解密文件列表
  async getDecryptedFiles(date) {
    try {
      const result = await decryptServiceAPI.getDecryptedFiles(date);
      return result;
    } catch (error) {
      console.error('获取已解密文件失败:', error);
      throw error;
    }
  },

  // 获取指定日期的加密文件列表
  async getEncryptedFiles(date) {
    try {
      const result = await decryptServiceAPI.getEncryptedFiles(date);
      return result;
    } catch (error) {
      console.error('获取加密文件列表失败:', error);
      throw error;
    }
  },

  // 批量处理指定日期的所有文件（带进度推送）
  async batchProcessFilesWithProgress(date, onProgress) {
    try {
      const result = await decryptServiceAPI.batchProcessFilesWithProgress(date, onProgress);
      return result;
    } catch (error) {
      console.error('批量处理文件失败:', error);
      throw error;
    }
  }
};
