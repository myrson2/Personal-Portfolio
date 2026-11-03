import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProfileHeader from '../components/Header/ProfileHeader';

describe('ProfileHeader Component', () => {
  it('renders personal identity and metadata badges', () => {
    render(<ProfileHeader onScheduleMeeting={() => {}} onDownloadCV={() => {}} onJoinCommunity={() => {}} />);
    expect(screen.getByText('Jose Myrson O. Beros')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Philippines')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('renders all 3 CTA buttons and handles click events', () => {
    const handleSchedule = vi.fn();
    const handleCV = vi.fn();
    const handleCommunity = vi.fn();

    render(
      <ProfileHeader
        onScheduleMeeting={handleSchedule}
        onDownloadCV={handleCV}
        onJoinCommunity={handleCommunity}
      />
    );

    const scheduleBtn = screen.getByText('Schedule meeting');
    const cvBtn = screen.getByText('Download CV');
    const communityBtn = screen.getByText('Join Community');

    expect(scheduleBtn).toBeInTheDocument();
    expect(cvBtn).toBeInTheDocument();
    expect(communityBtn).toBeInTheDocument();

    fireEvent.click(scheduleBtn);
    expect(handleSchedule).toHaveBeenCalledTimes(1);

    fireEvent.click(cvBtn);
    expect(handleCV).toHaveBeenCalledTimes(1);

    fireEvent.click(communityBtn);
    expect(handleCommunity).toHaveBeenCalledTimes(1);
  });
});

