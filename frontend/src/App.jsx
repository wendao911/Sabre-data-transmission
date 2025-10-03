import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { ConfigProvider } from 'antd';
import { useAuth } from './hooks/useAuth';
import { AuthProvider } from './contexts/AuthContext';
import { FileProvider } from './contexts/FileContext';
import Layout from './components/Layout';
import SplashScreen from './pages/SplashScreen';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import FileManagementPage from './pages/FileManagementPage';
import SFTPTransferPage from './pages/SFTPTransferPage';
import SFTPConnectionConfigPage from './pages/SFTPConnectionConfigPage';
import ScheduledTaskConfigPage from './pages/ScheduledTaskConfigPage';
import FileMappingConfigPage from './pages/FileMappingConfigPage';
import FileTypeConfigPage from './pages/FileTypeConfigPage';
import SystemLogsPage from './pages/SystemLogsPage';
import AboutPage from './pages/AboutPage';
import DecryptPage from './pages/DecryptPage';
import './index.css';

// Ant Design 主题配置
const antdTheme = {
  token: {
    colorPrimary: '#3b82f6',
    borderRadius: 8,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  components: {
    Layout: {
      bodyBg: '#f5f5f5',
      siderBg: '#fff',
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#eff6ff',
      itemSelectedColor: '#2563eb',
    },
    Card: {
      borderRadius: 12,
    },
    Button: {
      borderRadius: 8,
    },
  },
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route
          path="/*"
          element={
            user ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/files" element={<FileManagementPage />} />
                  <Route path="/decrypt" element={<DecryptPage />} />
                  <Route path="/sftp" element={<SFTPTransferPage />} />
                  <Route path="/system-config/sftp-connection" element={<SFTPConnectionConfigPage />} />
                  <Route path="/system-config/scheduled-task" element={<ScheduledTaskConfigPage />} />
                  <Route path="/system-config/file-mapping" element={<FileMappingConfigPage />} />
                  <Route path="/system-config/file-type" element={<FileTypeConfigPage />} />
                  <Route path="/system-logs" element={<SystemLogsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <AuthProvider>
          <FileProvider>
            <AppContent />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                  borderRadius: '8px',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </FileProvider>
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
