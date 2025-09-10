import { useContext } from 'react';
import { FileContext } from '../contexts/FileContext';

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};
