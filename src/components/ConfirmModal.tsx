import React, { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  count: number;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  count,
  onConfirm,
  onClose,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      // 열릴 때 기본으로 취소 또는 확인 버튼에 포커스
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);
    } else {
      // 닫힐 때 원래 트리거 요소로 포커스 복귀
      triggerRef.current?.focus();
    }
  }, [isOpen]);

  // Esc 닫기 및 키보드 트랩
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Tab') {
        const focusable = [cancelBtnRef.current, confirmBtnRef.current].filter(Boolean) as HTMLElement[];
        if (focusable.length < 2) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-confirm-title"
        aria-describedby="modal-confirm-desc"
      >
        <div className="modal-header">
          <h2 id="modal-confirm-title">완료 항목 일괄 삭제</h2>
        </div>

        <div className="modal-body" id="modal-confirm-desc">
          완료된 할 일 <strong>{count}개</strong>를 목록에서 완전히 삭제하시겠습니까? 이 작업은 실행 취소되지 않습니다.
        </div>

        <div className="modal-footer">
          <button
            ref={cancelBtnRef}
            type="button"
            className="modal-btn cancel"
            onClick={onClose}
          >
            취소
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className="modal-btn confirm-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            삭제 ({count}개)
          </button>
        </div>
      </div>
    </div>
  );
};
