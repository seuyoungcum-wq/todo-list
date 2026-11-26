import React, { useEffect } from 'react';
import { CloseIcon } from './Icons';

interface ToastProps {
  message: string | null;
  onUndo: () => void;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onUndo, onClose }) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="toast-container" role="region" aria-label="알림 메시지">
      <div className="toast" role="status" aria-live="polite">
        <span className="toast-msg">{message}</span>
        <button
          type="button"
          className="toast-undo-btn"
          onClick={onUndo}
          aria-label="삭제한 할 일 복원하기"
        >
          실행 취소
        </button>
        <button
          type="button"
          className="toast-close-btn"
          onClick={onClose}
          aria-label="알림 닫기"
        >
          <CloseIcon size={14} />
        </button>
      </div>
    </div>
  );
};
