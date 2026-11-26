import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadTodosFromStorage,
  saveTodosToStorage,
  isValidTodoItem,
  STORAGE_KEY,
  CURRENT_SCHEMA_VERSION,
} from '../lib/storage';
import { TodoItem } from '../types/todo';
import { getTodayYYMMDD } from '../lib/format';

describe('Storage Utility (localStorage 및 무결성 검증)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const sampleTodo: TodoItem = {
    id: 'test-1',
    text: '테스트 할 일',
    completed: false,
    category: '업무',
    targetDate: '261126',
    createdAt: '2026-11-26T11:00:00.000Z',
    updatedAt: '2026-11-26T11:00:00.000Z',
  };

  it('올바른 TodoItem 구조를 정확히 판별한다 (isValidTodoItem)', () => {
    expect(isValidTodoItem(sampleTodo)).toBe(true);
    expect(isValidTodoItem(null)).toBe(false);
    expect(isValidTodoItem({})).toBe(false);
    expect(isValidTodoItem({ id: '', text: '할 일' })).toBe(false);
    expect(isValidTodoItem({ ...sampleTodo, completed: 'false' as any })).toBe(false);
  });

  it('정상적인 Todo 목록을 저장하고 복원한다', () => {
    const todos = [sampleTodo];
    const saveRes = saveTodosToStorage(todos);
    expect(saveRes.success).toBe(true);
    expect(saveRes.error).toBeNull();

    const loadRes = loadTodosFromStorage();
    expect(loadRes.todos).toHaveLength(1);
    expect(loadRes.todos[0].text).toBe('테스트 할 일');
    expect(loadRes.todos[0].category).toBe('업무');
    expect(loadRes.todos[0].targetDate).toBe('261126');
    expect(loadRes.error).toBeNull();
    expect(loadRes.recovered).toBe(false);
  });

  it('레거시 데이터(category, targetDate 누락)를 읽어올 때 기본값으로 안전하게 보정한다', () => {
    const legacyItem = {
      id: 'legacy-1',
      text: '기존 할 일',
      completed: false,
      createdAt: '2026-11-25T10:00:00.000Z',
      updatedAt: '2026-11-25T10:00:00.000Z',
    };
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: CURRENT_SCHEMA_VERSION,
        todos: [legacyItem],
        lastSavedAt: new Date().toISOString(),
      })
    );

    const loadRes = loadTodosFromStorage();
    expect(loadRes.todos).toHaveLength(1);
    expect(loadRes.todos[0].category).toBe('개인');
    expect(loadRes.todos[0].targetDate).toBe(getTodayYYMMDD());
  });

  it('비어있는 저장소에서는 빈 배열을 반환한다', () => {
    const res = loadTodosFromStorage();
    expect(res.todos).toEqual([]);
    expect(res.error).toBeNull();
    expect(res.recovered).toBe(false);
  });

  it('JSON 파싱이 불가능한 잘못된 데이터가 들어있을 때 안전하게 복구한다', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid json {{{');
    const res = loadTodosFromStorage();
    expect(res.todos).toEqual([]);
    expect(res.recovered).toBe(true);
  });

  it('배열 내에 손상된 항목이 섞여 있을 때 유효한 항목만 골라내고 200자 제한을 적용한다', () => {
    const longText = 'A'.repeat(250);
    const mixedData = {
      version: CURRENT_SCHEMA_VERSION,
      todos: [
        sampleTodo,
        { id: 'broken', text: null },
        { ...sampleTodo, id: 'test-long', text: longText },
      ],
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mixedData));

    const res = loadTodosFromStorage();
    expect(res.todos).toHaveLength(2);
    expect(res.recovered).toBe(true);
    expect(res.todos[1].text.length).toBe(200);
  });

  it('localStorage 접근 시 에러가 발생해도 예외를 던지지 않고 안전하게 에러를 반환한다', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const res = saveTodosToStorage([sampleTodo]);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
