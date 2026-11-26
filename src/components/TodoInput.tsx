import React, { useState, useRef } from 'react';
import { TodoCategory, CATEGORIES } from '../types/todo';
import { getTodayYYMMDD, isValidYYMMDD } from '../lib/format';
import { PlusIcon } from './Icons';

interface TodoInputProps {
  onAdd: (text: string, category: TodoCategory, targetDate: string) => boolean;
}

export const TodoInput: React.FC<TodoInputProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<TodoCategory>('업무');
  const [targetDate, setTargetDate] = useState<string>(getTodayYYMMDD());
  const inputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  const maxLength = 200;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isComposingRef.current) return;

    const trimmed = text.trim();
    if (!trimmed) return;

    // 날짜 유효성 검사 (6자리 아니면 오늘로 보정)
    const finalDate = isValidYYMMDD(targetDate) ? targetDate : getTodayYYMMDD();

    const success = onAdd(trimmed, category, finalDate);
    if (success) {
      setText('');
      // 입력창 포커스 유지
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || isComposingRef.current) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isTooLong = text.length >= maxLength;
  const isDateInvalid = targetDate.length === 6 && !isValidYYMMDD(targetDate);

  return (
    <form className="surface-card todo-input-form" onSubmit={handleSubmit} noValidate>
      {/* 범주 선택 및 날짜 입력 옵션 바 */}
      <div className="input-options-row">
        {/* 범주 선택 */}
        <div className="category-select-group" role="group" aria-label="할 일 범주 선택">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill cat-${cat} ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
              aria-pressed={category === cat}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 날짜 입력 (YYMMDD) */}
        <div className="date-input-wrapper">
          <label htmlFor="todo-target-date" className="date-label">
            날짜(YYMMDD)
          </label>
          <input
            id="todo-target-date"
            type="text"
            className={`todo-date-input ${isDateInvalid ? 'invalid' : ''}`}
            placeholder="YYMMDD"
            value={targetDate}
            maxLength={6}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setTargetDate(val);
            }}
            title="6자리 날짜 (예: 261126)"
          />
        </div>
      </div>

      {/* 할 일 본문 입력창 및 추가 버튼 */}
      <div className="input-row">
        <label htmlFor="todo-input-field" className="sr-only">
          새로운 할 일 입력
        </label>
        <input
          ref={inputRef}
          id="todo-input-field"
          type="text"
          className="todo-text-input"
          placeholder="오늘 어떤 일을 계획하고 있나요? (최대 200자)"
          value={text}
          maxLength={maxLength}
          onChange={(e) => setText(e.target.value)}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false;
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        <button
          type="submit"
          className="todo-add-btn"
          disabled={!text.trim()}
          aria-label="할 일 추가"
        >
          <PlusIcon size={20} />
          <span>추가</span>
        </button>
      </div>

      <div className="input-footer">
        <span>Enter를 눌러 빠르게 등록하세요</span>
        <span className={`char-counter ${isTooLong ? 'warning' : ''}`} aria-live="polite">
          {text.length}/{maxLength}자
        </span>
      </div>
    </form>
  );
};
