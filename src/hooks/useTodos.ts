import { useState, useEffect, useCallback, useMemo } from 'react';
import { TodoItem, FilterType, DeletedTodoHistory, TodoCategory } from '../types/todo';
import { loadTodosFromStorage, saveTodosToStorage } from '../lib/storage';
import { getTodayYYMMDD, getTomorrowYYMMDD, isValidYYMMDD } from '../lib/format';

export function useTodos() {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    const res = loadTodosFromStorage();
    return res.todos;
  });

  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] = useState<TodoCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [recentDeleted, setRecentDeleted] = useState<DeletedTodoHistory | null>(null);
  const [deletedToastMessage, setDeletedToastMessage] = useState<string | null>(null);

  // Todo 상태 변경 시 자동 저장
  useEffect(() => {
    const { success, error } = saveTodosToStorage(todos);
    if (!success) {
      setSaveError(error);
    } else {
      setSaveError(null);
    }
  }, [todos]);

  // 할 일 추가 (최신 항목이 상단에 배치되도록 내림차순 정렬)
  const addTodo = useCallback(
    (rawText: string, category: TodoCategory = '개인', rawTargetDate?: string): boolean => {
      const text = rawText.trim();
      if (!text) return false;

      const targetDate = rawTargetDate && isValidYYMMDD(rawTargetDate)
        ? rawTargetDate
        : getTodayYYMMDD();

      const now = new Date().toISOString();
      const newTodo: TodoItem = {
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `todo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        text: text.slice(0, 200),
        completed: false,
        category,
        targetDate,
        createdAt: now,
        updatedAt: now,
      };

      setTodos((prev) => [newTodo, ...prev]);
      return true;
    },
    []
  );

  // 완료 상태 토글
  const toggleTodo = useCallback((id: string) => {
    setTodos((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: !item.completed,
              updatedAt: new Date().toISOString(),
            }
          : item
      )
    );
  }, []);

  // 내용, 카테고리, 날짜 수정
  const editTodo = useCallback(
    (
      id: string,
      rawText: string,
      category?: TodoCategory,
      rawTargetDate?: string
    ): boolean => {
      const text = rawText.trim();
      if (!text) return false;

      setTodos((prev) =>
        prev.map((item) => {
          if (item.id !== id) return item;

          const updatedCategory = category || item.category;
          const updatedTargetDate =
            rawTargetDate && isValidYYMMDD(rawTargetDate)
              ? rawTargetDate
              : item.targetDate;

          return {
            ...item,
            text: text.slice(0, 200),
            category: updatedCategory,
            targetDate: updatedTargetDate,
            updatedAt: new Date().toISOString(),
          };
        })
      );
      return true;
    },
    []
  );

  // 개별 삭제 및 실행 취소 히스토리 보관
  const deleteTodo = useCallback((id: string) => {
    setTodos((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx === -1) return prev;

      const target = prev[idx];
      setRecentDeleted({
        item: target,
        originalIndex: idx,
      });

      const truncated = target.text.length > 20 ? `${target.text.slice(0, 20)}...` : target.text;
      setDeletedToastMessage(`"${truncated}" 항목이 삭제되었습니다.`);

      return prev.filter((item) => item.id !== id);
    });
  }, []);

  // 삭제 실행 취소 (원래 위치에 복원)
  const undoDelete = useCallback(() => {
    if (!recentDeleted) return;

    setTodos((prev) => {
      const next = [...prev];
      const targetIndex = Math.min(Math.max(0, recentDeleted.originalIndex), next.length);
      next.splice(targetIndex, 0, recentDeleted.item);
      return next;
    });

    setRecentDeleted(null);
    setDeletedToastMessage(null);
  }, [recentDeleted]);

  // 토스트 닫기
  const dismissToast = useCallback(() => {
    setRecentDeleted(null);
    setDeletedToastMessage(null);
  }, []);

  // 완료된 항목 일괄 삭제
  const clearCompleted = useCallback(() => {
    setTodos((prev) => prev.filter((item) => !item.completed));
    setRecentDeleted(null);
    setDeletedToastMessage(null);
  }, []);

  // 통계 계산
  const todayYYMMDD = useMemo(() => getTodayYYMMDD(), []);
  const tomorrowYYMMDD = useMemo(() => getTomorrowYYMMDD(), []);

  const totalCount = todos.length;
  const completedCount = useMemo(() => todos.filter((t) => t.completed).length, [todos]);
  const activeCount = totalCount - completedCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // 오늘 남은 할 일: 오늘 날짜(또는 이전 지연)이면서 미완료인 항목
  const todayRemainingCount = useMemo(() => {
    return todos.filter((t) => !t.completed && t.targetDate <= todayYYMMDD).length;
  }, [todos, todayYYMMDD]);

  // 내일 해야 할 일: 내일 날짜이면서 미완료인 항목
  const tomorrowRemainingCount = useMemo(() => {
    return todos.filter((t) => !t.completed && t.targetDate === tomorrowYYMMDD).length;
  }, [todos, tomorrowYYMMDD]);

  // 필터, 카테고리 및 검색 적용된 목록
  const filteredTodos = useMemo(() => {
    return todos.filter((item) => {
      // 1. 상태 필터
      if (filter === 'active' && item.completed) return false;
      if (filter === 'completed' && !item.completed) return false;

      // 2. 카테고리 필터
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // 3. 검색어 필터
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const textMatch = item.text.toLowerCase().includes(query);
        const categoryMatch = item.category.toLowerCase().includes(query);
        const dateMatch = item.targetDate.includes(query);
        return textMatch || categoryMatch || dateMatch;
      }

      return true;
    });
  }, [todos, filter, selectedCategory, searchQuery]);

  return {
    todos,
    filteredTodos,
    filter,
    setFilter,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    saveError,
    recentDeleted,
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
  };
}
