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
    </>
  );
};

export default ModernTable;
