import { useState, useEffect, useRef } from 'react';
import { decryptService } from '../services/decryptService';
import toast from 'react-hot-toast';

export const useDecryptPage = () => {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [totalFiles, setTotalFiles] = useState(0);
  const [decryptedFiles, setDecryptedFiles] = useState([]);
  const [failedFiles, setFailedFiles] = useState([]);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0
  });
  const [filterMode, setFilterMode] = useState('all');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const eventSourceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleStartDecrypt = async () => {
    try {
      setIsDecrypting(true);
      setProgress(0);
      setStats({ total: 0, success: 0, failed: 0 });
      setDecryptedFiles([]);
      setFailedFiles([]);
      setLogs([]);

      const params = {
        date: selectedDate,
        month: selectedMonth,
        filePath: null
      };

      await decryptService.startDecrypt(params, {
        onProgress: (data) => {
          setProgress(data.progress || 0);
          setCurrentFile(data.currentFile || '');
          setTotalFiles(data.totalFiles || 0);
          setStatus(data.message || '');
          
          if (data.type === 'file_success') {
            setDecryptedFiles(prev => [...prev, data.file]);
          } else if (data.type === 'file_error') {
            setFailedFiles(prev => [...prev, data.file]);
          }
          
          setLogs(prev => [...prev, data]);
        }
      });

      toast.success('解密完成！');
    } catch (error) {
      toast.error(`解密失败: ${error.message}`);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleStopDecrypt = () => {
    setIsDecrypting(false);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    toast.info('解密已停止');
  };

  const handleReset = () => {
    setIsDecrypting(false);
    setProgress(0);
    setCurrentFile('');
    setTotalFiles(0);
    setDecryptedFiles([]);
    setFailedFiles([]);
    setStatus(null);
    setLogs([]);
    setStats({ total: 0, success: 0, failed: 0 });
  };

  return {
    isDecrypting,
    progress,
    currentFile,
    totalFiles,
    decryptedFiles,
    failedFiles,
    status,
    logs,
    stats,
    filterMode,
    selectedDate,
    selectedMonth,
    handleStartDecrypt,
    handleStopDecrypt,
    handleReset,
    setFilterMode,
    setSelectedDate,
    setSelectedMonth
  };
};
