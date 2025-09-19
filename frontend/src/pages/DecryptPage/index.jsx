import React from 'react';
import { useDecryptPage } from './hooks/useDecryptPage';
import { DecryptControls } from './components/DecryptControls';
import { DecryptProgress } from './components/DecryptProgress';
import { DecryptStats } from './components/DecryptStats';
import { DecryptLogs } from './components/DecryptLogs';

const DecryptPage = () => {
  const {
    isDecrypting,
    progress,
    currentFile,
    totalFiles,
    decryptedFiles,
    failedFiles,
    status,
    logs,
    stats,
    filterMode,
    selectedDate,
    selectedMonth,
    handleStartDecrypt,
    handleStopDecrypt,
    handleReset,
    setFilterMode,
    setSelectedDate,
    setSelectedMonth
  } = useDecryptPage();

  return (
    <div className="space-y-6">
      <DecryptControls
        isDecrypting={isDecrypting}
        filterMode={filterMode}
        selectedDate={selectedDate}
        selectedMonth={selectedMonth}
        onStart={handleStartDecrypt}
        onStop={handleStopDecrypt}
        onReset={handleReset}
        onFilterModeChange={setFilterMode}
        onDateChange={setSelectedDate}
        onMonthChange={setSelectedMonth}
      />

      <DecryptProgress
        isDecrypting={isDecrypting}
        progress={progress}
        currentFile={currentFile}
        totalFiles={totalFiles}
        status={status}
      />

      <DecryptStats stats={stats} />

      <DecryptLogs
        decryptedFiles={decryptedFiles}
        failedFiles={failedFiles}
        logs={logs}
      />
    </div>
  );
};

export default DecryptPage;