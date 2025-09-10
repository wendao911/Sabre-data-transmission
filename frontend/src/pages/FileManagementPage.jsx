import React, { useEffect, useMemo, useRef, useState } from 'react';
import { File, Unlock, RefreshCw } from 'lucide-react';
import { Tabs, Card, Button, Input, Table, Space, Empty, Spin, Modal } from 'antd';
import { fileAPI, decryptAPI } from '../services/api';
import toast from 'react-hot-toast';

const { TabPane } = Tabs;
const { Search: AntSearch } = Input;

// 统一列宽
const COLW = {
  date: 160,
  filename: 420,
  size: 140,
  count: 120,
  action: 100,
  mtime: 200,
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

const formatDate = (v) => {
  const d = typeof v === 'number' ? new Date(v) : new Date(v);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const FileManagementPage = () => {
  // Encrypted files
  const [encLoading, setEncLoading] = useState(false);
  const [encSearch, setEncSearch] = useState('');
  const [encPage, setEncPage] = useState(1);
  const [encPageSize, setEncPageSize] = useState(20);
  const [encTotal, setEncTotal] = useState(0);
  const [encGroups, setEncGroups] = useState([]);
  const [encFlat, setEncFlat] = useState([]);
  const [encGroupSearch, setEncGroupSearch] = useState('');
  const [encGroupPage, setEncGroupPage] = useState(1);
  const [encGroupPageSize, setEncGroupPageSize] = useState(20);
  const [encGroupTotal, setEncGroupTotal] = useState(0);
  const [activeGroup, setActiveGroup] = useState(null);
  const [encModalOpen, setEncModalOpen] = useState(false);

  // Decrypted dirs/files
  const [decDirsLoading, setDecDirsLoading] = useState(false);
  const [decDirSearch, setDecDirSearch] = useState('');
  const [decDirPage, setDecDirPage] = useState(1);
  const [decDirPageSize, setDecDirPageSize] = useState(20);
  const [decDirTotal, setDecDirTotal] = useState(0);
  const [decDirs, setDecDirs] = useState([]);

  const [expandedDir, setExpandedDir] = useState(null);
  const [decFilesLoading, setDecFilesLoading] = useState(false);
  const [decFileSearch, setDecFileSearch] = useState('');
  const [decFilePage, setDecFilePage] = useState(1);
  const [decFilePageSize, setDecFilePageSize] = useState(50);
  const [decFileTotal, setDecFileTotal] = useState(0);
  const [decFiles, setDecFiles] = useState([]);
  const [decModalOpen, setDecModalOpen] = useState(false);
  const [activeDecDir, setActiveDecDir] = useState(null);

  // Progress SSE feedback
  const esRef = useRef(null);
  const [progOpen, setProgOpen] = useState(false);
  const [progPercent, setProgPercent] = useState(0);
  const [progCurrent, setProgCurrent] = useState(0);
  const [progTotal, setProgTotal] = useState(0);
  const [progText, setProgText] = useState('');

  const openProgress = () => {
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
    const es = new EventSource('http://localhost:3000/api/decrypt/progress');
    esRef.current = es;
    setProgOpen(true);
    setProgPercent(0);
    setProgCurrent(0);
    setProgTotal(0);
    setProgText('');

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'start') {
          setProgText(data.message || '开始解密...');
          toast.success('开始解密');
        } else if (data.type === 'info') {
          setProgText(data.message || '处理中...');
          if (typeof data.progress === 'number') setProgPercent(p => Math.max(p, data.progress));
          if (typeof data.current === 'number') setProgCurrent(data.current);
          if (typeof data.total === 'number') setProgTotal(data.total);
        } else if (data.type === 'file_success') {
          if (typeof data.progress === 'number') setProgPercent(p => Math.max(p, data.progress));
          if (typeof data.current === 'number') setProgCurrent(data.current);
          if (typeof data.total === 'number') setProgTotal(data.total);
        } else if (data.type === 'file_error') {
          toast.error(data.message || '解密失败');
          if (typeof data.progress === 'number') setProgPercent(p => Math.max(p, data.progress));
          if (typeof data.current === 'number') setProgCurrent(data.current);
          if (typeof data.total === 'number') setProgTotal(data.total);
        } else if (data.type === 'complete') {
          setProgPercent(100);
          setProgCurrent(data?.data?.success + data?.data?.failed || progTotal);
          toast.success('解密完成');
          if (esRef.current) { esRef.current.close(); esRef.current = null; }
        } else if (data.type === 'error') {
          toast.error(data.message || '解密出错');
        }
      } catch {}
    };

    es.onerror = () => {
      if (esRef.current) { esRef.current.close(); esRef.current = null; }
    };
  };

  const closeProgress = () => {
    setProgOpen(false);
    if (esRef.current) { esRef.current.close(); esRef.current = null; }
  };

  async function loadEncrypted() {
    setEncLoading(true);
    try {
      const groups = await fileAPI.listEncryptedGroups({ search: encGroupSearch, page: encGroupPage, pageSize: encGroupPageSize });
      setEncGroupTotal(groups.total);
      setEncGroups(groups.items);

      const chosen = activeGroup || groups.items?.[0]?.date || null;
      setActiveGroup(chosen);
      if (chosen) {
        const detail = await fileAPI.listEncryptedByDate(chosen, { search: encSearch, page: encPage, pageSize: encPageSize });
        setEncTotal(detail.total);
        setEncFlat(detail.items.map(it => ({ key: it.path, date: chosen, filename: it.filename, size: it.size })));
      } else {
        setEncTotal(0);
        setEncFlat([]);
      }
    } finally {
      setEncLoading(false);
    }
  }
  useEffect(() => { loadEncrypted(); }, [encSearch, encPage, encPageSize, encGroupSearch, encGroupPage, encGroupPageSize, activeGroup]);

  async function loadDecDirs() {
    setDecDirsLoading(true);
    try {
      const res = await fileAPI.listDecryptedDirs({ search: decDirSearch, page: decDirPage, pageSize: decDirPageSize });
      setDecDirTotal(res.total);
      setDecDirs(res.items);
    } finally { setDecDirsLoading(false); }
  }
  useEffect(() => { loadDecDirs(); }, [decDirSearch, decDirPage, decDirPageSize]);

  async function loadDecFiles(dir) {
    setDecFilesLoading(true);
    try {
      const res = await fileAPI.listDecryptedFiles(dir, { search: decFileSearch, page: decFilePage, pageSize: decFilePageSize });
      setDecFileTotal(res.total);
      setDecFiles(res.items.map(i => ({ ...i, dir })));
    } finally { setDecFilesLoading(false); }
  }

  // 加载某一日期下的加密文件（供模态框使用）
  async function loadEncFiles(date) {
    setEncLoading(true);
    try {
      const detail = await fileAPI.listEncryptedByDate(date, { search: encSearch, page: encPage, pageSize: encPageSize });
      setEncTotal(detail.total);
      setEncFlat(detail.items.map(it => ({ key: it.path, path: it.path, date, filename: it.filename, size: it.size })));
    } finally {
      setEncLoading(false);
    }
  }

  const encColumns = [
    { title: '日期(YYYYMMDD)', dataIndex: 'date', key: 'date', width: COLW.date },
    { title: '文件名', dataIndex: 'filename', key: 'filename', width: COLW.filename },
    { title: '大小', dataIndex: 'size', key: 'size', width: COLW.size, render: (v) => formatFileSize(v) },
  ];

  const encData = encFlat;

  async function handleDecrypt(row) {
    try {
      const filePath = row.path || row.key;
      openProgress();
      await decryptAPI.startByFile(filePath);
      toast.success('已开始解密该文件');
    } catch (e) {
      toast.error(e.message || '启动解密失败');
    }
  }

  const decDirColumns = [
    { title: '日期(YYYYMMDD)', dataIndex: 'dirname', key: 'dirname', width: COLW.date },
    { title: '文件数', dataIndex: 'count', key: 'count', width: COLW.count },
    { title: '操作', key: 'action', width: COLW.action, render: (_, r) => (
      <Button type="link" onClick={() => { setActiveDecDir(r.dirname); setDecFilePage(1); setDecModalOpen(true); loadDecFiles(r.dirname); }}>查看文件</Button>
    )},
  ];

  const decFileColumns = [
    { title: '文件名', dataIndex: 'filename', key: 'filename', width: COLW.filename },
    { title: '大小', dataIndex: 'size', key: 'size', width: COLW.size, render: (v) => formatFileSize(v) },
    { title: '修改时间', dataIndex: 'mtime', key: 'mtime', width: COLW.mtime, render: (v) => formatDate(v) },
  ];

  if (encLoading && encGroups.length === 0) {
    return (
      <div className="text-center py-20">
        <Spin size="large" />
        <p className="mt-4 text-gray-600">正在加载文件...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultActiveKey="enc" type="card" size="large">
        <TabPane 
          tab={<span><File className="w-4 h-4 inline mr-2" />Encryption Data</span>} 
          key="enc"
        >
          <Card>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Encryption Data</h2>
              </div>
              <Space>
                <Button icon={<RefreshCw className="w-4 h-4" />} onClick={() => { setEncGroupPage(1); loadEncrypted(); }}>
                  刷新
                </Button>
              </Space>
            </div>
            <Table
              columns={[
                { title: '日期(YYYYMMDD)', dataIndex: 'date', key: 'date', width: COLW.date },
                { title: '文件数', dataIndex: 'count', key: 'count', width: COLW.count },
                { title: '操作', key: 'op', width: COLW.action, render: (_, r) => (
                  <Space size={8}>
                    <Button type="link" onClick={() => { setActiveGroup(r.date); setEncPage(1); setEncModalOpen(true); loadEncFiles(r.date); }}>查看文件</Button>
                    <Button type="link" onClick={async () => { try { openProgress(); await decryptAPI.startByDate(r.date); toast.success(`已开始解密 ${r.date}`); } catch (e) { toast.error(e.message || '启动解密失败'); } }}>Decrypt</Button>
                  </Space>
                ) }
              ]}
              dataSource={encGroups.map(g => ({ key: g.date, ...g }))}
              pagination={{ current: encGroupPage, pageSize: encGroupPageSize, total: encGroupTotal, onChange: (p, ps) => { setEncGroupPage(p); setEncGroupPageSize(ps); } }}
              className="mt-2"
              size="small"
              bordered
            />

            <Modal
              title={`Encryption Data - ${activeGroup || ''}`}
              open={encModalOpen}
              onCancel={() => setEncModalOpen(false)}
              footer={null}
              width={900}
              destroyOnClose
            >
              <div className="flex justify-between items-center mb-3">
                <Space>
                  <span className="text-gray-500">文件名过滤</span>
                  <AntSearch placeholder="按文件名搜索..." value={encSearch} onChange={(e) => { setEncPage(1); setEncSearch(e.target.value); if (activeGroup) loadEncFiles(activeGroup); }} style={{ width: 300 }} />
                </Space>
                <Button icon={<RefreshCw className="w-4 h-4" />} onClick={() => { if (activeGroup) loadEncFiles(activeGroup); }}>
                  刷新
                </Button>
              </div>
              {encData.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={ encSearch ? '没有找到匹配的文件' : '该日期暂无数据' } />
              ) : (
                <Table
                  columns={[
                    ...encColumns,
                    { title: '操作', key: 'action', width: COLW.action, render: (_, r) => (
                      <Button type="link" onClick={() => handleDecrypt(r)}>Decrypt</Button>
                    ) },
                  ]}
                  dataSource={encData}
                  rowKey="key"
                  pagination={{
                    current: encPage,
                    pageSize: encPageSize,
                    total: encTotal,
                    onChange: (p, ps) => { setEncPage(p); setEncPageSize(ps); if (activeGroup) loadEncFiles(activeGroup); },
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                  }}
                  size="small"
                  bordered
                />
              )}
            </Modal>

            <Modal
              title="解密进度"
              open={progOpen}
              onCancel={closeProgress}
              footer={null}
              width={600}
              destroyOnClose
            >
              <div className="space-y-3">
                <div className="text-gray-600">{progText}</div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{progCurrent}/{progTotal}</span>
                  <span>{progPercent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded">
                  <div className="h-2 bg-blue-500 rounded" style={{ width: `${progPercent}%`, transition: 'width .3s ease' }} />
                </div>
              </div>
            </Modal>
          </Card>
        </TabPane>

        <TabPane 
          tab={<span><Unlock className="w-4 h-4 inline mr-2" />Decryption Data</span>} 
          key="decrypt"
        >
          <Card>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Decryption Data</h2>
              </div>
              <Space>
                <Button icon={<RefreshCw className="w-4 h-4" />} onClick={() => { setDecDirPage(1); loadDecDirs(); }}>
                  刷新
                </Button>
              </Space>
            </div>

            <Table
              columns={decDirColumns}
              dataSource={decDirs.map(d => ({ key: d.dirname, ...d }))}
              loading={decDirsLoading}
              pagination={{
                current: decDirPage,
                pageSize: decDirPageSize,
                total: decDirTotal,
                onChange: (p, ps) => { setDecDirPage(p); setDecDirPageSize(ps); },
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              }}
              size="small"
              bordered
            />

            <Modal
              title={`Decryption Data - ${activeDecDir || ''}`}
              open={decModalOpen}
              onCancel={() => setDecModalOpen(false)}
              footer={null}
              width={900}
              destroyOnClose
            >
              <div className="flex justify-between items-center mb-3">
                <Space>
                  <span className="text-gray-500">文件名过滤</span>
                  <AntSearch placeholder={`在 ${activeDecDir || ''} 中搜索...`} value={decFileSearch} onChange={(e) => { setDecFilePage(1); setDecFileSearch(e.target.value); if (activeDecDir) loadDecFiles(activeDecDir); }} style={{ width: 300 }} />
                </Space>
                <Button icon={<RefreshCw className="w-4 h-4" />} onClick={() => { if (activeDecDir) loadDecFiles(activeDecDir); }}>
                  刷新
                    </Button>
              </div>
              <Table
                columns={decFileColumns}
                dataSource={decFiles.map(f => ({ key: `${f.dir}/${f.filename}`, ...f }))}
                loading={decFilesLoading}
                pagination={{
                  current: decFilePage,
                  pageSize: decFilePageSize,
                  total: decFileTotal,
                  onChange: (p, ps) => { setDecFilePage(p); setDecFilePageSize(ps); if (activeDecDir) loadDecFiles(activeDecDir); },
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                }}
                size="small"
                bordered
              />
            </Modal>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default FileManagementPage;
