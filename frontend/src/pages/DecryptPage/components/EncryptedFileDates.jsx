import React, { useState, useEffect } from 'react';
import { Card, List, Button, Spin, message, Empty, Tag } from 'antd';
import { CalendarOutlined, FolderOutlined, RightOutlined, ReloadOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { decryptService } from '../services/decryptService';
import { useLanguage } from '../hooks/useLanguage';

const EncryptedFileDates = ({ onDateSelect, selectedDate }) => {
  const { t } = useLanguage();
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDates = async () => {
    try {
      setLoading(true);
      const result = await decryptService.getEncryptedDatesWithStatus();
      if (result.success) {
        setDates(result.data || []);
      } else {
        message.error('加载日期列表失败');
      }
    } catch (error) {
      console.error('加载日期列表失败:', error);
      message.error('加载日期列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDates();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  };

  const getDateDisplayName = (dateStr) => {
    const formatted = formatDate(dateStr);
    const date = new Date(formatted);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (formatted === formatDate(today.toISOString().slice(0, 10).replace(/-/g, ''))) {
      return `今天 (${formatted})`;
    } else if (formatted === formatDate(yesterday.toISOString().slice(0, 10).replace(/-/g, ''))) {
      return `昨天 (${formatted})`;
    } else {
      return formatted;
    }
  };

  if (loading) {
    return (
      <Card title="文件日期列表" className="h-96">
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (dates.length === 0) {
    return (
      <Card title={t('fileDateList')} className="h-96">
        <Empty
          description={t('noFiles')}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <div className="flex justify-between items-center space-x-2">
      <div className="flex items-center space-x-2">
        <FolderOutlined />
        <span>{t('fileDateList')}</span>
      </div>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={loadDates}
            className="ml-auto"
            title="刷新日期列表"
          />
        </div>
      }
      className="h-[600px]"
    >
      <List
        dataSource={dates}
        renderItem={(dateItem) => (
          <List.Item
            className={`cursor-pointer hover:bg-gray-50 transition-colors ${selectedDate === dateItem.date ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            onClick={() => onDateSelect(dateItem.date)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-3">
                <FolderOutlined className="text-blue-500" />
                <div className="flex flex-col">
                  <span className="font-medium">{getDateDisplayName(dateItem.date)}</span>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
            {dateItem.isDecrypted ? (
              <>
                <CheckCircleOutlined className="text-green-500" />
                <span>{t('decrypted')}</span>
                <span>({dateItem.decryptedCount}/{dateItem.totalCount})</span>
              </>
            ) : (
              <>
                <ClockCircleOutlined className="text-orange-500" />
                <span>{t('notDecrypted')}</span>
                <span>({dateItem.totalCount}{t('files')})</span>
              </>
            )}
                  </div>
                </div>
              </div>
              <RightOutlined className="text-gray-400" />
            </div>
          </List.Item>
        )}
        className="max-h-[520px] overflow-y-auto"
      />
    </Card>
  );
};

export default EncryptedFileDates;
