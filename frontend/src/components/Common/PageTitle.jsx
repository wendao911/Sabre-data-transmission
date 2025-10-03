import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const PageTitle = ({ 
  title, 
  subtitle, 
  icon,
  extra,
  className = ""
}) => {
  return (
    <div 
      className={`mb-6 ${className}`}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
        borderRadius: '16px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(102,126,234,0.3)'
      }}
    >
      <Title 
        level={2} 
        className="mb-3" 
        style={{ 
          color: 'white', 
          margin: 0,
          fontSize: '28px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        {icon && (
          <div 
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '8px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {React.cloneElement(icon, { style: { fontSize: '24px' } })}
          </div>
        )}
        {title}
      </Title>
      {subtitle && (
        <Text 
          style={{ 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '16px',
            lineHeight: '1.6'
          }}
        >
          {subtitle}
        </Text>
      )}
    </div>
  );
};

export default PageTitle;
