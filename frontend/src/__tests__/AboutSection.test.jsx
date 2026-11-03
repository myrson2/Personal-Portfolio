import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AboutSection from '../components/About/AboutSection';

describe('AboutSection Component', () => {
  it('renders narrative and exact social channels', () => {
    render(<AboutSection overviewData={{ total_repos: 42, total_commits: 5300, is_mock: false }} />);

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText(/I am a full-stack engineer who turns messy business workflows/i)).toBeInTheDocument();

    expect(screen.getByText('github')).toHaveAttribute('href', 'https://github.com/myrson2');
    expect(screen.getByText('linkedin')).toHaveAttribute('href', 'https://linkedin.com');
    expect(screen.getByText('facebook')).toHaveAttribute('href', 'https://facebook.com');
    expect(screen.getByText('instagram')).toHaveAttribute('href', 'https://instagram.com');
  });

  it('renders 4-column proof-of-work stat counters', () => {
    render(<AboutSection overviewData={{ total_repos: 45, total_commits: 5600, is_mock: false }} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Tech Stacks')).toBeInTheDocument();

    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('Repositories')).toBeInTheDocument();

    expect(screen.getByText('10x')).toBeInTheDocument();
    expect(screen.getByText('Hackathons')).toBeInTheDocument();

    expect(screen.getByText('5k+')).toBeInTheDocument();
    expect(screen.getByText('Commits')).toBeInTheDocument();
  });
});

