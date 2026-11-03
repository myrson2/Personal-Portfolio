import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GitHubCalendarGrid from '../components/Calendar/GitHubCalendarGrid';

describe('GitHubCalendarGrid Component', () => {
  it('renders contribution counter and activity squares', () => {
    const mockCalendar = {
      username: 'myrson2',
      total_contributions: 1420,
      is_mock: false,
      weeks: [
        {
          days: [
            { date: '2026-01-01', count: 3, level: 2 },
            { date: '2026-01-02', count: 0, level: 0 },
          ],
        },
      ],
    };

    render(<GitHubCalendarGrid calendarData={mockCalendar} loading={false} />);

    expect(screen.getByText('1,420 Contributions in the Last Year')).toBeInTheDocument();
    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('displays sample indicator when is_mock is true', () => {
    const mockCalendar = {
      username: 'myrson2',
      total_contributions: 1420,
      is_mock: true,
      weeks: [],
    };

    render(<GitHubCalendarGrid calendarData={mockCalendar} loading={false} />);
    expect(screen.getByText('Sample Activity')).toBeInTheDocument();
  });
});

