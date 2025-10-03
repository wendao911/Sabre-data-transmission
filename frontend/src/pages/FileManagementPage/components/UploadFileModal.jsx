import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Form, Input, Upload, Select, Tag } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';
import { fileTypeConfigService } from '../../FileTypeConfigPage/services/fileTypeConfigService';

const { Dragger } = Upload;
const { Option } = Select;

const UploadFileModal = ({
  visible,
  onCancel,
  onConfirm,
  currentPath,
  pathOptions = []
}) => {
  const { t } = useLanguage();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [fileTypeConfigs, setFileTypeConfigs] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedFile = fileList[0]?.originFileObj || null;
  const sourceExt = useMemo(() => {
    if (!selectedFile?.name) return '';
    const idx = selectedFile.name.lastIndexOf('.');
    return idx >= 0 ? selectedFile.name.slice(idx) : '';
  }, [selectedFile]);

  const defaultBaseName = useMemo(() => {
    if (!selectedFile?.name) return '';
    const idx = selectedFile.name.lastIndexOf('.');
    return idx >= 0 ? selectedFile.name.slice(0, idx) : selectedFile.name;
  }, [selectedFile]);

  // 加载文件类型配置
  const loadFileTypeConfigs = async () => {
    try {
      setLoading(true);
      const data = await fileTypeConfigService.getConfigs({ pageSize: 1000 });
      const configs = data.data?.configs || [];
      setFileTypeConfigs(configs);
    } catch (error) {
      console.error('加载文件类型配置失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 当模态框打开时加载文件类型配置
  useEffect(() => {
    if (visible) {
      loadFileTypeConfigs();
    }
  }, [visible]);

  const beforeUpload = () => {
    // 使用受控模式，不直接上传
    return false;
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!selectedFile) {
        form.setFields([{ name: 'file', errors: ['请先选择文件'] }]);
        return;
      }
      setSubmitting(true);
      await onConfirm({
        file: selectedFile,
        targetPath: values.targetPath ?? '',
        baseName: values.baseName || defaultBaseName,
        fileTypeConfig: values.fileTypeConfig,
        remark: values.remark || ''
      });
      setSubmitting(false);
      setFileList([]);
      form.resetFields();
    } catch (e) {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFileList([]);
    form.resetFields();
    onCancel();
  };

  // 当文件选择变化时，自动填充文件名
  React.useEffect(() => {
    if (selectedFile && defaultBaseName) {
      form.setFieldsValue({ baseName: defaultBaseName });
    }
  }, [selectedFile, defaultBaseName, form]);

  // 当 currentPath 变化时，更新表单的 targetPath 字段
  React.useEffect(() => {
    if (visible && currentPath) {
      form.setFieldsValue({ targetPath: currentPath });
    }
  }, [visible, currentPath, form]);

  return (
    <Modal
      title={t('uploadFile.title')}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t('uploadFile.upload')}
      cancelText={t('uploadFile.cancel')}
      confirmLoading={submitting}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ targetPath: currentPath }}>
        <Form.Item
          name="file"
          label={t('uploadFile.selectFile')}
          rules={[{ required: true, message: t('uploadFile.validation.fileRequired') }]}
          valuePropName="fileList"
          getValueFromEvent={({ fileList: fl }) => fl}
        >
          <Dragger 
            multiple={false} 
            beforeUpload={beforeUpload} 
            onChange={(info) => {
              setFileList(info.fileList);
              // 选择文件时自动填充文件名
              if (info.fileList.length > 0 && info.fileList[0].originFileObj) {
                const file = info.fileList[0].originFileObj;
                const fileName = file.name;
                const lastDotIndex = fileName.lastIndexOf('.');
                const baseName = lastDotIndex >= 0 ? fileName.slice(0, lastDotIndex) : fileName;
                form.setFieldsValue({ baseName });
              }
            }} 
            fileList={fileList} 
            maxCount={1}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">{t('uploadFile.selectFileDescription')}</p>
            <p className="ant-upload-hint">{t('uploadFile.selectFileHint')}</p>
          </Dragger>
        </Form.Item>

        <Form.Item 
          name="fileTypeConfig" 
          label={t('uploadFile.fileType')}
          rules={[{ required: true, message: t('uploadFile.validation.fileTypeRequired') }]}
        >
          <Select
            placeholder={t('uploadFile.fileTypePlaceholder')}
            loading={loading}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {fileTypeConfigs.map(config => (
              <Option key={config._id} value={config._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>
                    <Tag color="blue" style={{ marginRight: 8 }}>{config.module}</Tag>
                    {config.fileType || '未设置文件类型'}
                  </span>
                  {config.pushPath && (
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {config.pushPath}
                    </span>
                  )}
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="targetPath" label={t('uploadFile.targetDirectory')}>
          <Input placeholder={t('uploadFile.targetDirectoryPlaceholder')} />
        </Form.Item>

        <Form.Item name="baseName" label={`${t('uploadFile.fileName')}（将保留源后缀 ${sourceExt || ''}）`} initialValue={defaultBaseName}>
          <Input placeholder={t('uploadFile.fileNamePlaceholder')} />
        </Form.Item>

        <Form.Item name="remark" label={t('uploadFile.remark')}>
          <Input.TextArea 
            rows={3} 
            placeholder={t('uploadFile.remarkPlaceholder')} 
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadFileModal;


