import React from 'react';
import { Button, Space, Popconfirm, Tag, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ModernTable, ModernPagination } from '../../../components/Common';

const FileTypeConfigTable = ({
  columns,
  configs,
  loading,
  selectedRowKeys,
  onEdit,
  onDelete,
  onRowSelectionChange,
  currentPage,
  pageSize,
  total,
  onPageChange
}) => {
  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: onRowSelectionChange,
    getCheckboxProps: (record) => ({
      disabled: false
    })
  };

  return (
    <>
      <ModernTable
        columns={columns}
        dataSource={configs}
        loading={loading}
        rowKey="_id"
        rowSelection={rowSelection}
        scroll={{ x: 1200 }}
        pagination={false}
      />
      <div style={{ 
        marginTop: 16, 
        textAlign: 'right',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <ModernPagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={onPageChange}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) =>
            `共 ${total} 条记录，显示第 ${range[0]}-${range[1]} 条`
          }
          style={{
            marginTop: '16px',
            textAlign: 'right'
          }}
        />
      </div>
    </>
  );
};

export default FileTypeConfigTable;
