import React from 'react';
import { Table } from 'antd';

const ModernTable = ({ 
  columns, 
  dataSource, 
  loading = false,
  pagination = false,
  className = "",
  ...props 
}) => {
  return (
    <>
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        className={`modern-table ${className}`}
        rowKey={(record, index) => record.id || record._id || index}
        scroll={{ x: 'max-content' }}
        size="middle"
        {...props}
      />
      <style jsx>{`
        :global(.modern-table .ant-table-thead > tr > th) {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-bottom: 2px solid #dee2e6;
          font-weight: 600;
          color: #495057;
          padding: 16px 12px;
        }
        
        :global(.modern-table .ant-table-tbody > tr > td) {
          padding: 12px;
          border-bottom: 1px solid #f1f3f4;
        }
        
        :global(.modern-table .ant-table-tbody > tr:hover > td) {
          background: #f8f9fa;
        }
      `}</style>
    </>
  );
};

export default ModernTable;
