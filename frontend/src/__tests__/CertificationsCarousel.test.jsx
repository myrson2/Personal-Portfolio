import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CertificationsCarousel from '../components/Certifications/CertificationsCarousel';

describe('CertificationsCarousel Component', () => {
  it('renders certification credentials and category badges', () => {
    render(<CertificationsCarousel />);

    expect(screen.getAllByText('AWS Certified Cloud Practitioner').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Google Cloud Certified Professional').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cloud Architecture').length).toBeGreaterThan(0);
  });

  it('renders step navigation arrow controls and cycles through loop', () => {
    render(<CertificationsCarousel />);

    const prevBtn = screen.getByLabelText('Previous Certification');
    const nextBtn = screen.getByLabelText('Next Certification');

    expect(prevBtn).toBeInTheDocument();
    expect(nextBtn).toBeInTheDocument();
    expect(screen.getByText('1/4')).toBeInTheDocument();

    // Click next -> 2/4
    fireEvent.click(nextBtn);
    expect(screen.getByText('2/4')).toBeInTheDocument();

    // Click next 3 more times to loop around -> 3/4 -> 4/4 -> 1/4
    fireEvent.click(nextBtn);
    expect(screen.getByText('3/4')).toBeInTheDocument();
    fireEvent.click(nextBtn);
    expect(screen.getByText('4/4')).toBeInTheDocument();
    fireEvent.click(nextBtn);
    expect(screen.getByText('1/4')).toBeInTheDocument();

    // Click prev from 1/4 -> wraps backwards to 4/4
    fireEvent.click(prevBtn);
    expect(screen.getByText('4/4')).toBeInTheDocument();
  });

  it('pauses auto-play on mouse enter and resumes on mouse leave', () => {
    const { container } = render(<CertificationsCarousel />);
    const block = container.querySelector('.certifications-block');

    expect(screen.getByText('Looping')).toBeInTheDocument();

    fireEvent.mouseEnter(block);
    expect(screen.getByText('Paused')).toBeInTheDocument();

    fireEvent.mouseLeave(block);
    expect(screen.getByText('Looping')).toBeInTheDocument();
  });
});

