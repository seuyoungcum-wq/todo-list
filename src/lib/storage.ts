import { TodoItem, TodoStorageSchema, CATEGORIES, TodoCategory } from '../types/todo';
import { getTodayYYMMDD, isValidYYMMDD } from './format';

export const CURRENT_SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'antigravity_todolist_v1';

export interface StorageLoadResult {
  todos: TodoItem[];
  error: string | null;
  recovered: boolean;
}

/**
 * 객체가 올바른 TodoItem 구조인지 검증 및 하위 호환성 보정
 */
export function isValidTodoItem(item: unknown): item is TodoItem {
  if (!item || typeof item !== 'object') return false;
  const t = item as Partial<TodoItem>;
  return (
    typeof t.id === 'string' &&
    t.id.trim().length > 0 &&
    typeof t.text === 'string' &&
    typeof t.completed === 'boolean' &&
    typeof t.createdAt === 'string' &&
    typeof t.updatedAt === 'string'
  );
}

/**
 * 기존 데이터에 category 또는 targetDate가 없을 경우 안전하게 보정
 */
export function normalizeTodoItem(item: Partial<TodoItem>): TodoItem {
  const category: TodoCategory =
    item.category && CATEGORIES.includes(item.category as TodoCategory)
      ? (item.category as TodoCategory)
      : '개인';

  const targetDate: string =
    item.targetDate && isValidYYMMDD(item.targetDate)
      ? item.targetDate
      : getTodayYYMMDD();

  return {
    id: item.id || `todo_${Date.now()}`,
    text: (item.text || '').slice(0, 200),
    completed: Boolean(item.completed),
    category,
    targetDate,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

/**
 * localStorage로부터 안전하게 Todo 목록을 읽어옵니다.
 */
export function loadTodosFromStorage(): StorageLoadResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { todos: [], error: null, recovered: false };
    }

    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== 'object') {
      console.warn('저장 데이터가 올바른 형식이 아닙니다. 초기화합니다.');
      return { todos: [], error: '저장 데이터 손상', recovered: true };
    }

    const data = parsed as Partial<TodoStorageSchema>;

    if (data.version !== CURRENT_SCHEMA_VERSION || !Array.isArray(data.todos)) {
      console.warn('스키마 버전 불일치 또는 잘못된 todos 배열');
      return { todos: [], error: '지원되지 않는 데이터 버전', recovered: true };
    }

    const validTodos: TodoItem[] = [];
    let hasInvalid = false;

    for (const item of data.todos) {
      if (isValidTodoItem(item)) {
        validTodos.push(normalizeTodoItem(item));
      } else {
        hasInvalid = true;
      }
    }

    return {
      todos: validTodos,
      error: null,
      recovered: hasInvalid,
    };
  } catch (err) {
    console.error('localStorage 데이터 로드 실패:', err);
    return {
      todos: [],
      error: '저장소 데이터를 읽는 중 오류가 발생했습니다.',
      recovered: true,
    };
  }
}

/**
 * Todo 목록을 localStorage에 저장합니다.
 */
export function saveTodosToStorage(todos: TodoItem[]): { success: boolean; error: string | null } {
  try {
    const payload: TodoStorageSchema = {
      version: CURRENT_SCHEMA_VERSION,
      todos,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return { success: true, error: null };
  } catch (err) {
    console.error('localStorage 저장 실패:', err);
    let msg = '자동 저장에 실패했습니다.';
    if (err instanceof Error && err.name === 'QuotaExceededError') {
      msg = '브라우저 저장 용량을 초과하여 저장하지 못했습니다.';
    }
    return { success: false, error: msg };
  }
}
