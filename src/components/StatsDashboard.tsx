import React from 'react';

interface StatsDashboardProps {
  totalCount: number;
  completedCount: number;
  completionRate: number;
  todayRemainingCount: number;
  tomorrowRemainingCount: number;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({
  totalCount,
  completedCount,
  completionRate,
  todayRemainingCount,
  tomorrowRemainingCount,
}) => {
  return (
    <section className="surface-card stats-dashboard" aria-label="할 일 진행 현황">
      {/* 핵심 요구사항: 오늘 남은 할 일 & 아래에 내일 해야 할 일 표시 */}
      <div className="daily-stats-card">
        <div className="daily-stat-row today-stat">
          <span className="daily-stat-badge today">오늘</span>
          <span className="daily-stat-label">오늘 남은 할 일</span>
          <span className="daily-stat-count" aria-live="polite">
            <strong>{todayRemainingCount}</strong>개
          </span>
        </div>
        <div className="daily-stat-divider" aria-hidden="true" />
        <div className="daily-stat-row tomorrow-stat">
          <span className="daily-stat-badge tomorrow">내일</span>
          <span className="daily-stat-label">내일 해야 할 일</span>
          <span className="daily-stat-count" aria-live="polite">
            <strong>{tomorrowRemainingCount}</strong>개
          </span>
        </div>
      </div>

      {/* 전체 통계 및 달성률 */}
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">전체</span>
          <span className="stat-value">{totalCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">완료</span>
          <span className="stat-value">{completedCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">달성률</span>
          <span className="stat-value">{completionRate}%</span>
        </div>
      </div>

      <div className="progress-section">
        <div
          className="progress-bar-track"
          role="progressbar"
          aria-valuenow={completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`할 일 달성률 ${completionRate}%`}
        >
          <div
            className="progress-bar-fill"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </section>
  );
};
