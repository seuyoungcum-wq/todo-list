# 웹앱 아키텍처 및 구현 설계서 (ARCHITECTURE.md)

## 1. 컴포넌트 구조
```
src/
├── types/
│   └── todo.ts             # TodoItem, TodoStorageSchema, FilterType 정의
├── lib/
│   ├── storage.ts          # localStorage 연동, 스키마 검증, 예외 방어
│   └── format.ts           # 날짜 및 시간 포맷팅 헬퍼
├── hooks/
│   ├── useTodos.ts         # Todo 추가, 수정, 토글, 삭제, 복원, 통계, 일괄 삭제 상태 훅
│   └── useKeyboard.ts      # IME 조합 및 키보드 단축키 유틸리티
├── styles/
│   ├── tokens.css          # CSS Custom Properties 디자인 토큰
│   ├── reset.css           # 모던 리셋 및 기본 베이스 스타일
│   └── app.css             # 메인 레이아웃 및 컴포넌트 스타일
├── components/
│   ├── Header.tsx          # 헤더 (타이틀, 날짜, 동기화 상태)
│   ├── StatsDashboard.tsx  # 현황 대시보드 및 프로그레스 바
│   ├── TodoInput.tsx       # 할 일 입력 폼 (IME 대응, 글자 수 카운터)
│   ├── TodoToolbar.tsx     # 검색창, 상태 필터 탭, 완료 일괄 삭제 버튼
│   ├── TodoList.tsx        # 할 일 리스트 컨테이너
│   ├── TodoItem.tsx        # 개별 할 일 아이템 (체크박스, 인라인 편집, 삭제)
│   ├── EmptyState.tsx      # 결과 없음 / 목록 비어있음 뷰
│   ├── ConfirmModal.tsx    # 일괄 삭제 확인 모달 대화상자 (Focus Trap)
│   └── Toast.tsx           # 실행 취소(Undo) 및 알림 토스트 (aria-live)
├── App.tsx                 # 최상위 조합 컴포넌트
└── main.tsx                # 진입점
```

## 2. 상태 흐름 및 신뢰성 보장
1. **단일 진실 공급원 (Single Source of Truth)**:
   - `useTodos` 훅에서 상태와 저장 로직을 집중 관리.
   - 상태 변경 시마다 `saveTodosToStorage`를 통해 localStorage 동기화.
   - 동기화 실패(QuotaExceededError, 보안 설정 등) 발생 시에도 인메모리 상태는 유지하고, 사용자에게 명확한 경고 토스트 노출.

2. **실행 취소(Undo) 아키텍처**:
   - 단일 아이템 삭제 시 `{ item: TodoItem, index: number }` 형태로 최근 삭제 기록을 보관.
   - 토스트에서 "실행 취소" 클릭 시 원래 인덱스 위치에 그대로 복원하여 목록 순서 보존.
