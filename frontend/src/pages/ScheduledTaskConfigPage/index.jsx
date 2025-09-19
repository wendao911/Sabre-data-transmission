import React, { useState } from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useScheduledTasks } from './hooks/useScheduledTasks';
import { useLanguage } from './hooks/useLanguage';
import TaskList from './components/TaskList';
import TaskEditForm from './components/TaskEditForm';

const { Title, Paragraph } = Typography;

const ScheduledTaskConfigPage = () => {
  const [editVisible, setEditVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const { t } = useLanguage();
  const {
    tasks,
    loading,
    loadTasks,
    updateTask,
    runTask
  } = useScheduledTasks();

  // 编辑任务
  const handleEdit = (task) => {
    setEditingTask(task);
    setEditVisible(true);
  };

  // 立即执行任务
  const handleRun = async (taskType) => {
    await runTask(taskType);
  };

  // 提交表单
  const handleSubmit = async (values) => {
    setFormLoading(true);
    try {
      await updateTask(editingTask.type, values);
      setEditVisible(false);
      setEditingTask(null);
    } finally {
      setFormLoading(false);
    }
  };

  // 取消表单
  const handleCancel = () => {
    setEditVisible(false);
    setEditingTask(null);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center space-x-3">
        <ClockCircleOutlined className="text-2xl text-blue-600" />
        <div>
          <Title level={2} className="!mb-0">{t('pageTitle')}</Title>
          <Paragraph className="!mb-0 text-gray-600">{t('pageDescription')}</Paragraph>
        </div>
      </div>

      {/* 工具栏 */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <Title level={4} className="!mb-0">定时任务列表</Title>
            <span className="text-gray-500 text-sm">
              共 {tasks.length} 个任务
            </span>
          </div>
          
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadTasks}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        </div>

        {/* 任务列表 */}
        <TaskList
          tasks={tasks}
          loading={loading}
          onEdit={handleEdit}
          onRun={handleRun}
          t={t}
        />
      </Card>

      {/* 编辑表单 */}
      <TaskEditForm
        visible={editVisible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        initialValues={editingTask}
        loading={formLoading}
        t={t}
      />
    </div>
  );
};

export default ScheduledTaskConfigPage;