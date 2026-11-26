import React from 'react';
import { TodoItem as TodoItemType } from '../types/todo';
import { TodoItem } from './TodoItem';
import { EmptyState } from './EmptyState';

interface TodoListProps {
  todos: TodoItemType[];
  totalCount: number;
  onToggle: (id: string) => void;
  onEdit: (id: string, newText: string) => boolean;
  onDelete: (id: string) => void;
  onResetFilters: () => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  totalCount,
  onToggle,
  onEdit,
  onDelete,
  onResetFilters,
}) => {
  if (todos.length === 0) {
    return (
      <EmptyState
        isSearchOrFilter={totalCount > 0}
        onResetSearch={onResetFilters}
      />
    );
  }

  return (
    <section className="todo-list-section" aria-label="할 일 목록">
      <ul className="todo-list-ul">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </section>
  );
};
