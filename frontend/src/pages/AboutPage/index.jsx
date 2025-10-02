import React from 'react';
import { Card, Row, Col, Typography, List, Tag } from 'antd';
import { 
  InfoCircleOutlined, 
  FileTextOutlined, 
  CloudUploadOutlined, 
  KeyOutlined, 
  ClockCircleOutlined,
  SettingOutlined,
  DatabaseOutlined,
  RocketOutlined,
  LinkOutlined,
  UploadOutlined,
  ScheduleOutlined,
  FileSyncOutlined,
  FolderOpenOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { PageTitle, PageContainer, ModernTable } from '../../components/Common';
import { useLanguage } from './hooks/useLanguage';

const { Title, Paragraph } = Typography;


function AboutPage() {
  const { t } = useLanguage();
  const buildDate = new Date(2025, 8, 10).toLocaleDateString();

  // 应用信息表格列定义
  const appInfoColumns = [
    { title: t('version'), dataIndex: 'version', key: 'version', width: 180 },
    { title: t('buildDate'), dataIndex: 'buildDate', key: 'buildDate', width: 220 },
    { title: t('developer'), dataIndex: 'developer', key: 'developer', width: 200 },
  ];

  // 应用信息数据
  const appInfoDataSource = [
    { key: 'row1', version: '1.0.0', buildDate, developer: 'K6 ITD Leo' },
  ];

  // 系统功能说明数据
  const systemFeatures = [
    {
      key: 'file-management',
      icon: <FileTextOutlined style={{ color: '#1890ff' }} />,
      title: t('fileManagement'),
      description: t('fileManagementDesc'),
      features: t('fileManagementFeatures')
    },
    {
      key: 'decrypt',
      icon: <KeyOutlined style={{ color: '#52c41a' }} />,
      title: t('decrypt'),
      description: t('decryptDesc'),
      features: t('decryptFeatures')
    },
    {
      key: 'sftp-transfer',
      icon: <CloudUploadOutlined style={{ color: '#fa8c16' }} />,
      title: t('sftpTransfer'),
      description: t('sftpTransferDesc'),
      features: t('sftpTransferFeatures')
    },
    {
      key: 'scheduled-tasks',
      icon: <ClockCircleOutlined style={{ color: '#722ed1' }} />,
      title: t('scheduledTasks'),
      description: t('scheduledTasksDesc'),
      features: t('scheduledTasksFeatures')
    },
    {
      key: 'system-config',
      icon: <SettingOutlined style={{ color: '#eb2f96' }} />,
      title: t('systemConfig'),
      description: t('systemConfigDesc'),
      features: t('systemConfigFeatures')
    },
    {
      key: 'system-logs',
      icon: <DatabaseOutlined style={{ color: '#13c2c2' }} />,
      title: t('systemLogs'),
      description: t('systemLogsDesc'),
      features: t('systemLogsFeatures')
    }
  ];

  // 快速入门指南数据
  const quickStartGuide = [
    {
      key: 'sftp-config',
      icon: <LinkOutlined style={{ color: '#1890ff' }} />,
      title: t('configureSftp'),
      steps: t('configureSftpSteps')
    },
    {
      key: 'file-operations',
      icon: <UploadOutlined style={{ color: '#52c41a' }} />,
      title: t('uploadDecryptFiles'),
      steps: t('uploadDecryptFilesSteps')
    },
    {
      key: 'scheduled-tasks',
      icon: <ScheduleOutlined style={{ color: '#fa8c16' }} />,
      title: t('setScheduledTasks'),
      steps: t('setScheduledTasksSteps')
    }
  ];

  // SFTP传输功能详解数据
  const sftpFeatures = [
    {
      key: 'connection-management',
      icon: <LinkOutlined style={{ color: '#1890ff' }} />,
      title: t('connectionManagement'),
      description: t('connectionManagementDesc'),
      features: t('connectionManagementFeatures')
    },
    {
      key: 'file-browsing',
      icon: <FolderOpenOutlined style={{ color: '#52c41a' }} />,
      title: t('fileBrowsing'),
      description: t('fileBrowsingDesc'),
      features: t('fileBrowsingFeatures')
    },
    {
      key: 'file-mapping',
      icon: <FileSyncOutlined style={{ color: '#fa8c16' }} />,
      title: t('fileMapping'),
      description: t('fileMappingDesc'),
      features: t('fileMappingFeatures')
    },
    {
      key: 'transfer-monitoring',
      icon: <SwapOutlined style={{ color: '#722ed1' }} />,
      title: t('transferMonitoring'),
      description: t('transferMonitoringDesc'),
      features: t('transferMonitoringFeatures')
    }
  ];

  // SFTP文件推送路径表格数据
  const sftpPathColumns = [
    { 
      title: t('serialNumber'), 
      dataIndex: 'serialNumber', 
      key: 'serialNumber', 
      width: 80,
      align: 'center'
    },
    { 
      title: t('module'), 
      dataIndex: 'module', 
      key: 'module', 
      width: 120,
      align: 'center',
      render: (text) => (
        <Tag color={text === 'SAL' ? 'blue' : text === 'UPL' ? 'green' : text === 'OWB' ? 'orange' : text === 'IWB' ? 'purple' : 'cyan'}>
          {text}
        </Tag>
      )
    },
    { 
      title: t('fileType'), 
      dataIndex: 'fileType', 
      key: 'fileType', 
      width: 200
    },
    { 
      title: t('pushPath'), 
      dataIndex: 'pushPath', 
      key: 'pushPath', 
      width: 200,
      render: (text) => (
        <code style={{ 
          background: '#f5f5f5', 
          padding: '2px 6px', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#d63384'
        }}>
          {text}
        </code>
      )
    },
  ];

  const sftpPathDataSource = [
    { key: '1', serialNumber: 1, module: 'SAL', fileType: t('tcnFile'), pushPath: '\\SAL\\ATK' },
    { key: '2', serialNumber: 2, module: 'SAL', fileType: t('bspFile'), pushPath: '\\SAL\\BSP' },
    { key: '3', serialNumber: 3, module: 'SAL', fileType: t('arcFile'), pushPath: '\\SAL\\ARC' },
    { key: '4', serialNumber: 4, module: 'SAL', fileType: t('tktCouponFile'), pushPath: '\\SAL\\CPN' },
    { key: '5', serialNumber: 5, module: 'SAL', fileType: t('tktRemarkFile'), pushPath: '\\SAL\\RMK' },
    { key: '6', serialNumber: 6, module: 'UPL', fileType: t('vcrFlownData'), pushPath: '\\UPL\\LK' },
    { key: '7', serialNumber: 7, module: 'MAS', fileType: t('flightInfo'), pushPath: '\\MAS\\XLFLI' },
    { key: '8', serialNumber: 8, module: 'UPL', fileType: t('xlFile'), pushPath: '\\UPL\\XL' },
    { key: '9', serialNumber: 9, module: 'IWB', fileType: t('idecFile'), pushPath: '\\IWB\\ISIDEC' },
    { key: '10', serialNumber: 10, module: 'IWB', fileType: t('form1File'), pushPath: '\\IWB\\IWB FORM1' },
    { key: '11', serialNumber: 11, module: 'MAS', fileType: t('priceComparisonFile'), pushPath: '\\MAS\\CYRFD' },
    { key: '12', serialNumber: 12, module: 'MAS', fileType: t('allocationCoefficient'), pushPath: '\\MAS\\PFL' },
    { key: '13', serialNumber: 13, module: 'MAS', fileType: t('atpcoTax'), pushPath: '\\MAS\\TAX' },
    { key: '14', serialNumber: 14, module: 'MAS', fileType: t('atpcoYqyr'), pushPath: '\\MAS\\YQYR' },
  ];

  return (
    <PageContainer>
      <PageTitle
        title={t('aboutApp')}
        subtitle={t('systemDescription')}
        icon={<InfoCircleOutlined />}
      />

      <Row gutter={[16, 16]}>
        {/* 应用信息卡片 */}
        <Col span={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <InfoCircleOutlined />
                <span>{t('appInfo')}</span>
              </div>
            }
            size="small"
          >
            <ModernTable 
              size="middle" 
              pagination={false} 
              columns={appInfoColumns} 
              dataSource={appInfoDataSource} 
              rowKey="key" 
            />
          </Card>
        </Col>

        {/* 系统功能说明卡片 */}
        <Col span={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SettingOutlined />
                <span>{t('systemFeatures')}</span>
              </div>
            }
            size="small"
          >
            <div style={{ marginBottom: '16px' }}>
              <Title level={5} style={{ margin: 0, color: '#666' }}>
                {t('systemFeaturesTitle')}
              </Title>
            </div>
            
            <List
              grid={{ 
                gutter: 16, 
                xs: 1, 
                sm: 1, 
                md: 2, 
                lg: 2, 
                xl: 3, 
                xxl: 3 
              }}
              dataSource={systemFeatures}
              renderItem={(item) => (
                <List.Item>
                  <Card 
                    size="small"
                    style={{ 
                      height: '100%',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ fontSize: '24px', marginTop: '4px' }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Title level={5} style={{ margin: '0 0 8px 0', color: '#262626' }}>
                          {item.title}
                        </Title>
                        <Paragraph 
                          style={{ 
                            margin: '0 0 12px 0', 
                            color: '#666', 
                            fontSize: '13px',
                            lineHeight: '1.4'
                          }}
                        >
                          {item.description}
                        </Paragraph>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {item.features.map((feature, index) => (
                            <Tag 
                              key={index} 
                              size="small" 
                              style={{ 
                                fontSize: '11px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: '#f6f6f6',
                                border: 'none',
                                color: '#666'
                              }}
                            >
                              {feature}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 快速入门指南卡片 */}
        <Col span={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RocketOutlined />
                <span>{t('quickStartGuide')}</span>
              </div>
            }
            size="small"
          >
            <div style={{ marginBottom: '16px' }}>
              <Title level={5} style={{ margin: 0, color: '#666' }}>
                {t('quickStartTitle')}
              </Title>
              <Paragraph style={{ margin: '8px 0 0 0', color: '#999' }}>
                {t('quickStartDesc')}
              </Paragraph>
            </div>
            
            <List
              grid={{ 
                gutter: 16, 
                xs: 1, 
                sm: 1, 
                md: 1, 
                lg: 3, 
                xl: 3, 
                xxl: 3 
              }}
              dataSource={quickStartGuide}
              renderItem={(item) => (
                <List.Item>
                  <Card 
                    size="small"
                    style={{ 
                      height: '100%',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ fontSize: '24px', marginTop: '4px' }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <Title level={5} style={{ margin: '0 0 12px 0', color: '#262626' }}>
                          {item.title}
                        </Title>
                        <List
                          size="small"
                          dataSource={item.steps}
                          renderItem={(step, index) => (
                            <List.Item style={{ padding: '4px 0', border: 'none' }}>
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <div style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  background: '#1890ff',
                                  color: 'white',
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  marginTop: '2px'
                                }}>
                                  {index + 1}
                                </div>
                                <span style={{ 
                                  fontSize: '13px', 
                                  color: '#666',
                                  lineHeight: '1.4'
                                }}>
                                  {step}
                                </span>
                              </div>
                            </List.Item>
                          )}
                        />
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* SFTP传输功能详解卡片 */}
        <Col span={24}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CloudUploadOutlined />
                <span>{t('sftpFeatures')}</span>
              </div>
            }
            size="small"
          >
            <div style={{ marginBottom: '16px' }}>
              <Title level={5} style={{ margin: 0, color: '#666' }}>
                {t('sftpFeaturesTitle')}
              </Title>
              <Paragraph style={{ margin: '8px 0 0 0', color: '#999' }}>
                {t('sftpFeaturesDesc')}
              </Paragraph>
            </div>
            
            {/* 功能特性展示 */}
            <List
              grid={{ 
                gutter: 16, 
                xs: 1, 
                sm: 1, 
                md: 2, 
                lg: 2, 
                xl: 4, 
                xxl: 4 
              }}
              dataSource={sftpFeatures}
              renderItem={(item) => (
                <List.Item>
                  <Card 
                    size="small"
                    style={{ 
                      height: '100%',
                      border: '1px solid #f0f0f0',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                        {item.icon}
                      </div>
                      <Title level={5} style={{ margin: '0 0 8px 0', color: '#262626' }}>
                        {item.title}
                      </Title>
                      <Paragraph 
                        style={{ 
                          margin: '0 0 12px 0', 
                          color: '#666', 
                          fontSize: '13px',
                          lineHeight: '1.4'
                        }}
                      >
                        {item.description}
                      </Paragraph>
                      <List
                        size="small"
                        dataSource={item.features}
                        renderItem={(feature) => (
                          <List.Item style={{ padding: '2px 0', border: 'none', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '12px', marginTop: '2px', flexShrink: 0 }} />
                              <span style={{ 
                                fontSize: '12px', 
                                color: '#666',
                                lineHeight: '1.3'
                              }}>
                                {feature}
                              </span>
                            </div>
                          </List.Item>
                        )}
                      />
                    </div>
                  </Card>
                </List.Item>
              )}
            />

            {/* 文件推送路径表格 */}
            <div style={{ marginTop: '24px' }}>
              <Title level={5} style={{ margin: '0 0 16px 0', color: '#666' }}>
                {t('filePushPathConfig')}
              </Title>
              <Paragraph style={{ margin: '0 0 16px 0', color: '#999', fontSize: '14px' }}>
                {t('filePushPathDesc')}
              </Paragraph>
              <ModernTable 
                size="middle" 
                pagination={false} 
                columns={sftpPathColumns} 
                dataSource={sftpPathDataSource} 
                rowKey="key"
                scroll={{ x: 600 }}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}

export default AboutPage;


