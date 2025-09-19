import React, { useMemo, useState } from 'react';
import { Modal, Form, Input, Upload, Select } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;
const { Option } = Select;

const UploadFileModal = ({
  visible,
  onCancel,
  onConfirm,
  currentPath,
  pathOptions = []
}) => {
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
      title="上传文件"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="上传"
      cancelText="取消"
      confirmLoading={submitting}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={{ targetPath: currentPath }}>
        <Form.Item
          name="file"
          label="选择文件"
          rules={[{ required: true, message: '请选择要上传的文件' }]}
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
            <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
            <p className="ant-upload-hint">仅上传单个文件，文件名可在下方修改</p>
          </Dragger>
        </Form.Item>

        <Form.Item name="targetPath" label="目标目录">
          <Input placeholder="默认当前目录" value={currentPath} />
        </Form.Item>

        <Form.Item name="baseName" label={`文件名（将保留源后缀 ${sourceExt || ''}）`} initialValue={defaultBaseName}>
          <Input placeholder="不含扩展名，留空则使用所选文件名" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadFileModal;


