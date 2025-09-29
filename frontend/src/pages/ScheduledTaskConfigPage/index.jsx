import React, { useState } from 'react';
import { Card, Space, Button } from 'antd';
import { ClockCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useScheduledTasks } from './hooks/useScheduledTasks';
import { useLanguage } from './hooks/useLanguage';
import TaskList from './components/TaskList';
import TaskEditForm from './components/TaskEditForm';
import { PageTitle, PageContainer } from '../../components/Common';


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
    <PageContainer>
      <PageTitle
        title={t('pageTitle')}
        subtitle={t('pageDescription')}
        icon={<ClockCircleOutlined />}
      />

      {/* 工具栏 */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="text-lg font-semibold mb-0">定时任务列表</h4>
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
    </PageContainer>
  );
};

export default ScheduledTaskConfigPage;