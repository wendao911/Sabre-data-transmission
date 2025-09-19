import React, { useMemo, useState } from 'react';
import { Modal, Form, Input, Upload, Select } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useLanguage } from '../hooks/useLanguage';

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
        baseName: values.baseName || defaultBaseName
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

        <Form.Item name="targetPath" label={t('uploadFile.targetDirectory')}>
          <Input placeholder={t('uploadFile.targetDirectoryPlaceholder')} value={currentPath} />
        </Form.Item>

        <Form.Item name="baseName" label={`${t('uploadFile.fileName')}（将保留源后缀 ${sourceExt || ''}）`} initialValue={defaultBaseName}>
          <Input placeholder={t('uploadFile.fileNamePlaceholder')} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadFileModal;


