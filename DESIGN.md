# TodoList 웹앱 디자인 명세서 (DESIGN.md)

## 1. 개요 및 프로덕트 비전
- **목표**: 하루의 할 일을 신속하고 직관적으로 추가, 관리, 완료할 수 있는 높은 완성도의 한국어 개인용 TodoList 웹애플리케이션.
- **핵심 가치**:
  - **직관성**: 군더더기 없는 레이아웃과 명확한 시각적 위계.
  - **반응성**: 모바일(360px)부터 데스크톱(1440px+)까지 끊김 없는 유연한 레이아웃.
  - **신뢰성**: 로컬 스토리지 자동 저장, 안전한 스키마 검증, 복원 가능한 실행 취소(Undo) 지원.
  - **접근성 (A11y)**: WCAG 2.1 AA 기준 준수(명도 대비 4.5:1 이상), 키보드 전용 조작 완전 지원, 한글 IME 조합 이슈 방지.

---

## 2. 디자인 토큰 (CSS Custom Properties)

앱의 모든 스타일은 CSS 커스텀 프로퍼티를 기반으로 선언되어 일관성을 보장합니다.

```css
:root {
  /* 색상 팔레트 - Neutrals */
  --color-bg-app: #f8fafc;
  --color-bg-surface: #ffffff;
  --color-bg-subtle: #f1f5f9;
  --color-border: #e2e8f0;
  --color-border-hover: #cbd5e1;
  --color-border-focus: #3b82f6;

  /* 텍스트 색상 (명도 대비 4.5:1 이상 충족) */
  --color-text-main: #0f172a;       /* slate-900 (대비 15.5:1 on #fff) */
  --color-text-muted: #475569;      /* slate-600 (대비 5.8:1 on #fff) */
  --color-text-subtle: #64748b;     /* slate-500 (대비 4.6:1 on #fff) */
  --color-text-inverted: #ffffff;

  /* 브랜드 및 상태 색상 */
  --color-primary: #2563eb;         /* blue-600 */
  --color-primary-hover: #1d4ed8;   /* blue-700 */
  --color-primary-subtle: #eff6ff;  /* blue-50 */
  --color-success: #16a34a;         /* green-600 */
  --color-success-subtle: #f0fdf4;  /* green-50 */
  --color-danger: #dc2626;          /* red-600 */
  --color-danger-hover: #b91c1c;    /* red-700 */
  --color-danger-subtle: #fef2f2;   /* red-50 */
  --color-warning: #d97706;         /* amber-600 */

  /* 타이포그래피 */
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Pretendard Variable", Pretendard, sans-serif;
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;

  /* 간격 및 여백 */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */

  /* 외곽선 및 둥글기 */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* 그림자 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  /* 전환 효과 */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);

  /* 터치 및 조작 영역 */
  --min-touch-target: 44px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 3. 정보 구조 및 화면 구성

```
[헤더 영역]
 ├── 앱 타이틀 (오늘의 할 일) + 실시간 날짜
 └── 저장 상태 표시 배지 (자동 저장됨 / 저장 실패 경고)

[진행 현황 대시보드]
 ├── 통계 지표: 전체, 진행 중, 완료
 └── 진행률 프로그레스 바 (0~100%, 0 나눗셈 방어)

[할 일 입력 폼]
 ├── 텍스트 입력창 (최대 200자, 한글 조합 대응, 플레이스홀더)
 ├── 글자 수 카운터 (예: 15/200)
 └── 추가 버튼 (최소 44px 터치 영역)

[조작 툴바: 필터 및 검색]
 ├── 검색 입력창 (실시간 필터링 + 검색어 즉시 초기화 버튼)
 ├── 상태 필터 탭: 전체 / 진행 중 / 완료 (aria-selected, 카운트 뱃지)
 └── 완료 항목 정리(일괄 삭제) 버튼 (완료 0건 시 disabled)

[할 일 목록 (Todo List)]
 ├── 정렬: 최신 등록순 (createdAt DESC)
 ├── 개별 아이템:
 │    ├── 체크박스 (완료 토글, 완료 시 텍스트 취소선 및 색상 감쇄)
 │    ├── 본문 텍스트 (줄바꿈 및 긴 단어 break-word 방어)
 │    ├── 등록/수정 시간 표시
 │    └── 액션: 수정 버튼, 삭제 버튼
 └── 빈 상태 (Empty States):
      ├── 1) 등록된 할 일이 없을 때: 따뜻한 안내 문구 및 입력 유도
      └── 2) 검색/필터 결과가 없을 때: 검색어 초기화 제안

[하단 피드백 및 모달]
 ├── 실행 취소(Undo) 토스트 알림 (삭제 직후 5초간 노출, 클릭 시 원래 인덱스 복원)
 └── 일괄 삭제 확인 모달 대화상자 (삭제 건수 명시, 포커스 트랩, Esc 닫기)
```

---

## 4. 데이터 모델 및 스키마

```typescript
export interface TodoItem {
  id: string;              // crypto.randomUUID() 기반 고유 ID
  text: string;            // 할 일 내용 (1~200자, trim 처리)
  completed: boolean;      // 완료 여부
  createdAt: string;       // ISO 8601 문자열 (예: '2026-11-26T11:20:00.000Z')
  updatedAt: string;       // ISO 8601 문자열
}

export interface TodoStorageSchema {
  version: number;         // 스키마 버전 (현재: 1)
  todos: TodoItem[];       // 할 일 목록
  lastSavedAt: string;     // 마지막 저장 시각
}
```

- **정렬 기준**: 기본 목록은 `createdAt` 내림차순(최신 등록 항목이 상단).
- **무결성 검증**: 로드 시 필수 필드 존재 여부, 타입 검사 및 200자 초과 방어.

---

## 5. 인터랙션 및 접근성 (A11y) 명세

1. **한글 IME 조합 보호**:
   - `onKeyDown` 이벤트 시 `event.nativeEvent.isComposing` 확인하여 Enter 키에 의한 이중 등록/저장 차단.
2. **키보드 내비게이션**:
   - 모든 대화형 요소(체크박스, 버튼, 입력창, 탭)는 `Tab` 키로 포커스 가능.
   - 포커스 링: `outline: 2px solid var(--color-border-focus); outline-offset: 2px;`.
   - 수정 모드: `Enter`로 저장, `Escape`로 취소.
   - 모달 대화상자: 열릴 때 첫 번째 액션 버튼으로 포커스 진입, `Tab` 순환(Focus Trap), `Escape` 닫기, 닫힌 후 트리거 버튼으로 포커스 복귀.
3. **스크린 리더 친화성**:
   - 상태 변경 및 삭제/실행 취소 메시지는 `aria-live="polite"` 영역을 통해 안내.
   - 필터 탭에 `role="tab"`, `aria-selected="true/false"`, `aria-controls` 적용.
   - 아이콘 전용 버튼에 명확한 `aria-label` 부여 (예: "할 일 '장보기' 삭제", "할 일 '장보기' 수정").
4. **실행 취소(Undo) 큐 안정성**:
   - 삭제된 항목의 원래 데이터와 인덱스 위치를 보존하여 복원 시 원래 위치에 정확히 재삽입.
   - 연속 삭제 시 가장 최근 삭제 건을 대상으로 스택/토스트를 갱신하며, 다중 삭제 시에도 혼동이 없도록 명확한 텍스트 피드백 제공.
