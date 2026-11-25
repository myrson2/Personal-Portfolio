import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import ProjectsSection from '../components/Projects/ProjectsSection';
import * as api from '../services/api';

const MOCK_PROJECTS = [
  {
    name: 'eMSME',
    language: 'Python',
    description: 'AI-powered enterprise inventory and operations platform.',
    html_url: 'https://github.com/myrson2/eMSME',
  },
  {
    name: 'ColorGame',
    language: 'JavaScript',
    description: 'Interactive web simulation of carnival color game.',
    html_url: 'https://github.com/myrson2/ColorGame',
  },
];

describe('ProjectsSection Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders loading skeleton while fetch is pending', () => {
    vi.spyOn(api, 'fetchProjects').mockImplementation(() => new Promise(() => {}));
    render(<ProjectsSection />);
    expect(screen.getByLabelText('Loading projects')).toBeInTheDocument();
  });

  it('renders project rows with name, italic description, language tag, and github link', async () => {
    vi.spyOn(api, 'fetchProjects').mockResolvedValueOnce({
      projects: MOCK_PROJECTS,
      is_mock: false,
      source: 'live',
    });

    render(<ProjectsSection />);

    await waitFor(() => {
      expect(screen.getByText('eMSME')).toBeInTheDocument();
      expect(screen.getByText('ColorGame')).toBeInTheDocument();
    });

    // Check descriptions
    expect(screen.getByText('AI-powered enterprise inventory and operations platform.')).toBeInTheDocument();
    expect(screen.getByText('Interactive web simulation of carnival color game.')).toBeInTheDocument();

    // Check language badges
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();

    // Check GitHub redirect links
    const emsmeLink = screen.getByLabelText('View eMSME repository on GitHub');
    expect(emsmeLink).toHaveAttribute('href', 'https://github.com/myrson2/eMSME');
    expect(emsmeLink).toHaveAttribute('target', '_blank');
    expect(emsmeLink).toHaveAttribute('rel', 'noopener noreferrer');

    const colorGameLink = screen.getByLabelText('View ColorGame repository on GitHub');
    expect(colorGameLink).toHaveAttribute('href', 'https://github.com/myrson2/ColorGame');

    // All Projects link
    const allProjectsLink = screen.getByText(/All Projects/i);
    expect(allProjectsLink).toBeInTheDocument();
    expect(allProjectsLink).toHaveAttribute('href', 'https://github.com/myrson2?tab=repositories');
  });

  it('omits description line when description is null and omits badge when language is null', async () => {
    vi.spyOn(api, 'fetchProjects').mockResolvedValueOnce({
      projects: [
        {
          name: 'minimal-repo',
          language: null,
          description: null,
          html_url: 'https://github.com/myrson2/minimal-repo',
        },
      ],
      is_mock: false,
      source: 'live',
    });

    const { container } = render(<ProjectsSection />);

    await waitFor(() => {
      expect(screen.getByText('minimal-repo')).toBeInTheDocument();
    });

    expect(container.querySelector('.compact-project-desc')).toBeNull();
    expect(container.querySelector('.project-tags')).toBeNull();
    expect(screen.getByLabelText('View minimal-repo repository on GitHub')).toBeInTheDocument();
  });

  it('renders clean empty state when no projects are returned and localStorage is empty', async () => {
    vi.spyOn(api, 'fetchProjects').mockResolvedValueOnce({
      projects: [],
      is_mock: true,
      source: 'fixture',
    });

    render(<ProjectsSection />);

    await waitFor(() => {
      expect(
        screen.getByText('No repositories currently available to display.')
      ).toBeInTheDocument();
    });

    const allProjectsLink = screen.getByText(/All Projects/i);
    expect(allProjectsLink).toBeInTheDocument();
  });
});
