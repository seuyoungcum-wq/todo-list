import React from 'react';
import { FilterType, TodoCategory, CATEGORIES } from '../types/todo';
import { SearchIcon, CloseIcon, TrashIcon } from './Icons';

interface TodoToolbarProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  selectedCategory: TodoCategory | 'all';
  onCategoryChange: (category: TodoCategory | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  activeCount: number;
  completedCount: number;
  onOpenClearModal: () => void;
}

export const TodoToolbar: React.FC<TodoToolbarProps> = ({
  filter,
  onFilterChange,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  totalCount,
  activeCount,
  completedCount,
  onOpenClearModal,
}) => {
  return (
    <div className="todo-toolbar">
      {/* 검색 입력창 */}
      <div className="search-box">
        <span className="search-icon">
          <SearchIcon size={16} />
        </span>
        <label htmlFor="todo-search-field" className="sr-only">
          할 일 검색
        </label>
        <input
          id="todo-search-field"
          type="text"
          className="search-input"
          placeholder="할 일, 범주(업무/개인/건강/취미), 날짜(YYMMDD)로 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            aria-label="검색어 지우기"
          >
            <CloseIcon size={14} />
          </button>
        )}
      </div>

      {/* 카테고리 필터 칩 */}
      <div className="category-filter-chips" role="group" aria-label="범주별 필터">
        <button
          type="button"
          className={`cat-chip ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => onCategoryChange('all')}
        >
          전체 범주
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`cat-chip cat-${cat} ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 상태 필터 탭 & 일괄 삭제 버튼 */}
      <div className="filter-actions-row">
        <div className="filter-tabs" role="tablist" aria-label="할 일 상태 필터">
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => onFilterChange('all')}
          >
            전체 <span className="tab-badge">{totalCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'active'}
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => onFilterChange('active')}
          >
            진행 중 <span className="tab-badge">{activeCount}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'completed'}
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => onFilterChange('completed')}
          >
            완료 <span className="tab-badge">{completedCount}</span>
          </button>
        </div>

        <button
          type="button"
          className="clear-completed-btn"
          disabled={completedCount === 0}
          onClick={onOpenClearModal}
          aria-label={`완료 항목 정리 (${completedCount}개)`}
        >
          <TrashIcon size={15} />
          <span>완료 항목 정리</span>
        </button>
      </div>
    </div>
  );
};
