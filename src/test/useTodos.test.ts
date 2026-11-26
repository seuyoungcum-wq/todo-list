import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTodos } from '../hooks/useTodos';
import { getTodayYYMMDD, getTomorrowYYMMDD } from '../lib/format';

describe('useTodos Hook (비즈니스 로직, 카테고리, 날짜 및 통계)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('초기 상태가 정상적으로 설정된다', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toEqual([]);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.completedCount).toBe(0);
    expect(result.current.todayRemainingCount).toBe(0);
    expect(result.current.tomorrowRemainingCount).toBe(0);
  });

  it('카테고리와 YYMMDD 날짜를 지정하여 할 일을 추가할 수 있다', () => {
    const { result } = renderHook(() => useTodos());
    const today = getTodayYYMMDD();

    act(() => {
      result.current.addTodo('회의 준비하기', '업무', today);
    });

    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].text).toBe('회의 준비하기');
    expect(result.current.todos[0].category).toBe('업무');
    expect(result.current.todos[0].targetDate).toBe(today);
    expect(result.current.todayRemainingCount).toBe(1);
    expect(result.current.tomorrowRemainingCount).toBe(0);
  });

  it('오늘 남은 할 일과 내일 해야 할 일 개수를 정확히 집계한다', () => {
    const { result } = renderHook(() => useTodos());
    const today = getTodayYYMMDD();
    const tomorrow = getTomorrowYYMMDD();

    act(() => {
      result.current.addTodo('오늘 할 일 1', '업무', today);
      result.current.addTodo('오늘 할 일 2', '개인', today);
      result.current.addTodo('내일 할 일 1', '건강', tomorrow);
      result.current.addTodo('내일 할 일 2', '취미', tomorrow);
    });

    expect(result.current.totalCount).toBe(4);
    expect(result.current.todayRemainingCount).toBe(2);
    expect(result.current.tomorrowRemainingCount).toBe(2);

    // 오늘 할 일 1 완료 처리
    const todayTodo = result.current.todos.find((t) => t.text === '오늘 할 일 1')!;
    act(() => {
      result.current.toggleTodo(todayTodo.id);
    });

    // 오늘 남은 할 일이 1개로 줄어듦
    expect(result.current.todayRemainingCount).toBe(1);
    // 내일 할 일은 여전히 2개
    expect(result.current.tomorrowRemainingCount).toBe(2);
  });

  it('카테고리별 필터링이 정상 동작한다', () => {
    const { result } = renderHook(() => useTodos());

    act(() => {
      result.current.addTodo('기획서 작성', '업무');
      result.current.addTodo('조깅하기', '건강');
      result.current.addTodo('영화 보기', '취미');
    });

    expect(result.current.filteredTodos).toHaveLength(3);

    act(() => {
      result.current.setSelectedCategory('건강');
    });
    expect(result.current.filteredTodos).toHaveLength(1);
    expect(result.current.filteredTodos[0].text).toBe('조깅하기');

    act(() => {
      result.current.setSelectedCategory('all');
    });
    expect(result.current.filteredTodos).toHaveLength(3);
  });

  it('할 일의 내용뿐만 아니라 카테고리와 날짜도 수정할 수 있다', () => {
    const { result } = renderHook(() => useTodos());
    const today = getTodayYYMMDD();
    const tomorrow = getTomorrowYYMMDD();

    act(() => {
      result.current.addTodo('산책', '개인', today);
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.editTodo(id, '러닝 머신', '건강', tomorrow);
    });

    expect(result.current.todos[0].text).toBe('러닝 머신');
    expect(result.current.todos[0].category).toBe('건강');
    expect(result.current.todos[0].targetDate).toBe(tomorrow);
    expect(result.current.todayRemainingCount).toBe(0);
    expect(result.current.tomorrowRemainingCount).toBe(1);
  });

  it('삭제 후 실행 취소 시 원래 데이터와 카테고리, 날짜가 그대로 복원된다', () => {
    const { result } = renderHook(() => useTodos());
    const tomorrow = getTomorrowYYMMDD();

    act(() => {
      result.current.addTodo('복원 대상', '취미', tomorrow);
    });

    const id = result.current.todos[0].id;

    act(() => {
      result.current.deleteTodo(id);
    });
    expect(result.current.todos).toHaveLength(0);

    act(() => {
      result.current.undoDelete();
    });
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].category).toBe('취미');
    expect(result.current.todos[0].targetDate).toBe(tomorrow);
  });
});
