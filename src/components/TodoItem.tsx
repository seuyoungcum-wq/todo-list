import React, { useState, useRef, useEffect } from 'react';
import { TodoItem as TodoItemType, TodoCategory, CATEGORIES } from '../types/todo';
import { formatTime, formatYYMMDD, isValidYYMMDD } from '../lib/format';
import { CheckIcon, EditIcon, TrashIcon } from './Icons';

interface TodoItemProps {
  todo: TodoItemType;
  onToggle: (id: string) => void;
  onEdit: (id: string, newText: string, category?: TodoCategory, targetDate?: string) => boolean;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [editCategory, setEditCategory] = useState<TodoCategory>(todo.category);
  const [editDate, setEditDate] = useState<string>(todo.targetDate);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setEditText(todo.text);
      setEditCategory(todo.category);
      setEditDate(todo.targetDate);
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [isEditing, todo]);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (!trimmed) return;

    const finalDate = isValidYYMMDD(editDate) ? editDate : todo.targetDate;
    const success = onEdit(todo.id, trimmed, editCategory, finalDate);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setEditCategory(todo.category);
    setEditDate(todo.targetDate);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {/* 커스텀 체크박스 */}
      <div className="todo-checkbox-wrapper">
        <button
          type="button"
          role="checkbox"
          aria-checked={todo.completed}
          className="todo-checkbox"
          onClick={() => onToggle(todo.id)}
          aria-label={`할 일 '${todo.text}' ${todo.completed ? '완료 취소' : '완료로 표시'}`}
        >
          {todo.completed && <CheckIcon size={14} />}
        </button>
      </div>

      {/* 내용 영역 */}
      <div className="todo-content-col">
        {isEditing ? (
          <div className="edit-form">
            <div className="edit-options-row">
              <div className="category-select-group">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-pill cat-${cat} ${editCategory === cat ? 'active' : ''}`}
                    onClick={() => setEditCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <input
                type="text"
                className="todo-date-input"
                placeholder="YYMMDD"
                maxLength={6}
                value={editDate}
                onChange={(e) => setEditDate(e.target.value.replace(/\D/g, '').slice(0, 6))}
                title="6자리 날짜 (YYMMDD)"
              />
            </div>

            <label htmlFor={`edit-input-${todo.id}`} className="sr-only">
              할 일 내용 수정
            </label>
            <input
              id={`edit-input-${todo.id}`}
              ref={editInputRef}
              type="text"
              className="edit-input"
              value={editText}
              maxLength={200}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="edit-actions">
              <button
                type="button"
                className="edit-btn save"
                onClick={handleSave}
                disabled={!editText.trim()}
              >
                저장
              </button>
              <button
                type="button"
                className="edit-btn cancel"
                onClick={handleCancel}
              >
                취소 (Esc)
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="todo-header-tags">
              <span className={`badge-category cat-${todo.category}`}>
                {todo.category}
              </span>
              <span className="badge-target-date">
                {formatYYMMDD(todo.targetDate)}
              </span>
            </div>

            <span className="todo-text">{todo.text}</span>

            <div className="todo-meta">
              <time dateTime={todo.createdAt}>등록 {formatTime(todo.createdAt)}</time>
              {todo.updatedAt !== todo.createdAt && <span>• 수정됨</span>}
            </div>
          </>
        )}
      </div>

      {/* 액션 버튼 */}
      {!isEditing && (
        <div className="todo-action-group">
          <button
            type="button"
            className="icon-btn edit"
            onClick={() => setIsEditing(true)}
            aria-label={`할 일 '${todo.text}' 수정`}
          >
            <EditIcon size={17} />
          </button>
          <button
            type="button"
            className="icon-btn delete"
            onClick={() => onDelete(todo.id)}
            aria-label={`할 일 '${todo.text}' 삭제`}
          >
            <TrashIcon size={17} />
          </button>
        </div>
      )}
    </li>
  );
};
