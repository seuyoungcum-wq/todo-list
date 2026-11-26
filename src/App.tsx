import React, { useState } from 'react';
import { useTodos } from './hooks/useTodos';
import { Header } from './components/Header';
import { StatsDashboard } from './components/StatsDashboard';
import { TodoInput } from './components/TodoInput';
import { TodoToolbar } from './components/TodoToolbar';
import { TodoList } from './components/TodoList';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast } from './components/Toast';

export const App: React.FC = () => {
  const {
    filteredTodos,
    filter,
    setFilter,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    saveError,
    deletedToastMessage,
    addTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    undoDelete,
    dismissToast,
    clearCompleted,
    totalCount,
    completedCount,
    activeCount,
    completionRate,
    todayRemainingCount,
    tomorrowRemainingCount,
  } = useTodos();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilter('all');
    setSelectedCategory('all');
  };

  return (
    <div className="app-container">
      {/* 헤더 */}
      <Header saveError={saveError} />

      {/* 통계 현황 (오늘 남은 할 일, 내일 해야 할 일) */}
      <StatsDashboard
        totalCount={totalCount}
        completedCount={completedCount}
        completionRate={completionRate}
        todayRemainingCount={todayRemainingCount}
        tomorrowRemainingCount={tomorrowRemainingCount}
      />

      {/* 할 일 입력 (날짜 YYMMDD, 범주 선택 지원) */}
      <TodoInput onAdd={addTodo} />

      {/* 필터 및 검색 툴바 */}
      <TodoToolbar
        filter={filter}
        onFilterChange={setFilter}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalCount={totalCount}
        activeCount={activeCount}
        completedCount={completedCount}
        onOpenClearModal={() => setIsModalOpen(true)}
      />

      {/* 할 일 목록 */}
      <TodoList
        todos={filteredTodos}
        totalCount={totalCount}
        onToggle={toggleTodo}
        onEdit={editTodo}
        onDelete={deleteTodo}
        onResetFilters={handleResetFilters}
      />

      {/* 일괄 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={isModalOpen}
        count={completedCount}
        onConfirm={clearCompleted}
        onClose={() => setIsModalOpen(false)}
      />

      {/* 실행 취소(Undo) 토스트 */}
      <Toast
        message={deletedToastMessage}
        onUndo={undoDelete}
        onClose={dismissToast}
      />
    </div>
  );
};

export default App;
