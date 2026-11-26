export type TodoCategory = '업무' | '개인' | '건강' | '취미';

export const CATEGORIES: TodoCategory[] = ['업무', '개인', '건강', '취미'];

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  category: TodoCategory;
  targetDate: string; // YYMMDD 형식 (예: '261126')
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type FilterType = 'all' | 'active' | 'completed';

export interface TodoStorageSchema {
  version: number;
  todos: TodoItem[];
  lastSavedAt: string;
}

export interface DeletedTodoHistory {
  item: TodoItem;
  originalIndex: number;
}
