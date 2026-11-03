import React from 'react';
import { GitCommit } from 'lucide-react';

export default function GitHubCalendarGrid({ calendarData, loading }) {
  const totalContributions = calendarData?.total_contributions ?? 1420;
  const weeks = calendarData?.weeks ?? [];
  const isMock = calendarData?.is_mock ?? false;

  return (
    <div className="github-calendar-box">
      <div className="calendar-header">
        <h4 className="calendar-title">
          <GitCommit size={16} />
          <span>{totalContributions.toLocaleString()} Contributions in the Last Year</span>
        </h4>
        {isMock && (
          <span className="badge bg-light text-dark border font-monospace" style={{ fontSize: '0.7rem' }}>
            Sample Activity
          </span>
        )}
      </div>

      <div className="calendar-grid-wrapper">
        {loading ? (
          <div className="text-center py-4 text-muted small font-monospace">
            Loading contribution heat map...
          </div>
        ) : (
          <div className="calendar-weeks-container">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="calendar-week-col">
                {week.days.map((day, dIdx) => (
                  <div
                    key={`${wIdx}-${dIdx}`}
                    className={`calendar-day-cell level-${day.level}`}
                    title={`${day.count} contributions on ${day.date}`}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-1">
        <span className="d-block d-md-none text-muted font-monospace" style={{ fontSize: '0.65rem' }}>
          ⇄ Scroll horizontally for full activity
        </span>
        <div className="calendar-legend ms-auto">
          <span>Less</span>
          <div className="calendar-day-cell level-0"></div>
          <div className="calendar-day-cell level-1"></div>
          <div className="calendar-day-cell level-2"></div>
          <div className="calendar-day-cell level-3"></div>
          <div className="calendar-day-cell level-4"></div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

