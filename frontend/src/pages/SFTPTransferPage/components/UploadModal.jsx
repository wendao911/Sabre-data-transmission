import React from 'react';
import { Modal, Button, Upload, Progress } from 'antd';
import { UploadOutlined, CloudUploadOutlined } from '@ant-design/icons';

const UploadModal = ({
  visible,
  currentPath,
  uploadFileList,
  uploading,
  operationProgress,
  operationStatus,
  onClose,
  onFileChange,
  onRemoveFile,
  onUpload
}) => {
  return (
    <Modal 
      title="上传文件" 
      open={visible} 
      onCancel={onClose} 
      footer={null} 
      width={600}
    >
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">
          上传到: <code className="bg-gray-100 px-2 py-1 rounded">{currentPath}</code>
        </div>
        <Upload 
          multiple 
          fileList={uploadFileList} 
          onChange={onFileChange} 
          onRemove={onRemoveFile} 
          beforeUpload={() => false} 
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />} block>
            选择文件（支持多选）
          </Button>
        </Upload>
      </div>
      
      {uploadFileList.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">已选择的文件:</div>
          <div className="max-h-32 overflow-y-auto">
            {uploadFileList.map(file => (
              <div 
                key={file.uid} 
                className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded mb-1"
              >
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {uploading && (
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">{operationStatus}</div>
          <Progress 
            percent={operationProgress} 
            status={operationProgress === 100 ? 'success' : 'active'} 
            showInfo={false} 
          />
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button onClick={onClose}>
          取消
        </Button>
        <Button 
          type="primary" 
          onClick={onUpload} 
          loading={uploading} 
          disabled={uploadFileList.length === 0} 
          icon={<CloudUploadOutlined />}
        >
          上传 {uploadFileList.length > 0 ? `(${uploadFileList.length} 个文件)` : ''}
        </Button>
      </div>
    </Modal>
  );
};

export { UploadModal };
