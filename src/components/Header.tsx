import React from 'react';
import { formatToday } from '../lib/format';
import { CheckCircleIcon, AlertCircleIcon } from './Icons';

interface HeaderProps {
  saveError: string | null;
}

export const Header: React.FC<HeaderProps> = ({ saveError }) => {
  return (
    <header className="app-header">
      <div className="header-title-group">
        <h1>오늘의 할 일</h1>
        <div className="header-date">{formatToday()}</div>
      </div>
      <div>
        {saveError ? (
          <div className="storage-status-badge error" role="status" aria-live="polite">
            <AlertCircleIcon size={14} />
            <span>저장 실패</span>
          </div>
        ) : (
          <div className="storage-status-badge saved" role="status" aria-label="브라우저 로컬 저장소에 자동 저장됨">
            <CheckCircleIcon size={14} />
            <span>자동 저장됨</span>
          </div>
        )}
      </div>
    </header>
  );
};
