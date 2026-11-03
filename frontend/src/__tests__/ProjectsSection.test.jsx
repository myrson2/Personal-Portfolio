import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProjectsSection from '../components/Projects/ProjectsSection';

describe('ProjectsSection Component', () => {
  it('renders 2 featured cards and compact rows', () => {
    render(<ProjectsSection />);

    expect(screen.getByText('Projects')).toBeInTheDocument();

    // Featured Hero Projects
    expect(screen.getByText('SmartStock AI')).toBeInTheDocument();
    expect(screen.getByText('Depths Descents: Game Engine')).toBeInTheDocument();

    // Compact Projects
    expect(screen.getByText('Personal Portfolio Architecture')).toBeInTheDocument();
    expect(screen.getByText('GDG PUP Community Portal')).toBeInTheDocument();
    expect(screen.getByText('AWS Cloud Club Assistant')).toBeInTheDocument();

    // All Projects link
    const allProjectsLink = screen.getByText(/All Projects/i);
    expect(allProjectsLink).toBeInTheDocument();
    expect(allProjectsLink).toHaveAttribute('href', 'https://github.com/myrson2?tab=repositories');
  });

  it('renders Case Study buttons for featured projects', () => {
    render(<ProjectsSection />);
    const caseStudyBtns = screen.getAllByRole('button', { name: /case study/i });
    expect(caseStudyBtns.length).toBe(2);
  });
});

