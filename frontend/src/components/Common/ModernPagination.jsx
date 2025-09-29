import React from 'react';
import { Pagination } from 'antd';

const ModernPagination = ({ 
  current = 1,
  total = 0,
  pageSize = 20,
  showSizeChanger = true,
  showQuickJumper = true,
  showTotal = true,
  onChange,
  onShowSizeChange,
  className = "",
  ...props 
}) => {
  const handleChange = (page, size) => {
    if (onChange) {
      onChange(page, size);
    }
  };

  const handleShowSizeChange = (current, size) => {
    if (onShowSizeChange) {
      onShowSizeChange(current, size);
    }
  };

  const totalText = (total, range) => {
    return `共 ${total} 条记录，显示第 ${range[0]}-${range[1]} 条`;
  };

  return (
    <Pagination
      current={current}
      total={total}
      pageSize={pageSize}
      showSizeChanger={showSizeChanger}
      showQuickJumper={showQuickJumper}
      showTotal={showTotal ? totalText : false}
      onChange={handleChange}
      onShowSizeChange={handleShowSizeChange}
      pageSizeOptions={['10', '20', '50', '100']}
      className={`modern-pagination ${className}`}
      {...props}
    />
  );
};

export default ModernPagination;
