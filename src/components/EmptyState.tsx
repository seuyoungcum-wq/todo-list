import React from 'react';
import { EmptyBoxIcon, SearchIcon } from './Icons';

interface EmptyStateProps {
  isSearchOrFilter: boolean;
  onResetSearch?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isSearchOrFilter,
  onResetSearch,
}) => {
  return (
    <div className="empty-state" role="status">
      {isSearchOrFilter ? (
        <>
          <SearchIcon size={44} className="empty-icon" />
          <h2 className="empty-title">일치하는 할 일이 없습니다</h2>
          <p className="empty-desc">
            검색어나 상태 필터 조건을 확인해보세요.
          </p>
          {onResetSearch && (
            <button
              type="button"
              className="empty-action-btn"
              onClick={onResetSearch}
            >
              검색어 및 필터 초기화
            </button>
          )}
        </>
      ) : (
        <>
          <EmptyBoxIcon size={48} className="empty-icon" />
          <h2 className="empty-title">할 일 목록이 비어 있습니다</h2>
          <p className="empty-desc">
            오늘 해야 할 새로운 작업을 위에 입력하고 하루를 시작해보세요!
          </p>
        </>
      )}
    </div>
  );
};
