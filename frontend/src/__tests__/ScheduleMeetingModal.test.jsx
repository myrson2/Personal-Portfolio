import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ScheduleMeetingModal from '../components/Modals/ScheduleMeetingModal';
import * as api from '../services/api';

describe('ScheduleMeetingModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<ScheduleMeetingModal isOpen={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders form inputs and handles successful submission', async () => {
    vi.spyOn(api, 'sendContact').mockResolvedValueOnce({
      status: 'sent',
      message: "Message sent! I'll get back to you within 24 hours.",
    });

    render(<ScheduleMeetingModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('Schedule a Meeting')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. Alex Vance')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('alex@company.com')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('e.g. Alex Vance'), { target: { value: 'Jane Developer' } });
    fireEvent.change(screen.getByPlaceholderText('alex@company.com'), { target: { value: 'jane@example.com' } });

    fireEvent.click(screen.getByText('Confirm Request'));

    await waitFor(() => {
      expect(screen.getByText('Request Received!')).toBeInTheDocument();
      expect(screen.getByText(/Message sent! I'll get back to you within 24 hours\./i)).toBeInTheDocument();
    });
  });

  it('handles rate limiting response gracefully', async () => {
    vi.spyOn(api, 'sendContact').mockResolvedValueOnce({
      status: 'rateLimit',
      message: 'Too many requests. Please wait a few minutes before trying again.',
    });

    render(<ScheduleMeetingModal isOpen={true} onClose={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('e.g. Alex Vance'), { target: { value: 'Jane Developer' } });
    fireEvent.change(screen.getByPlaceholderText('alex@company.com'), { target: { value: 'jane@example.com' } });

    fireEvent.click(screen.getByText('Confirm Request'));

    await waitFor(() => {
      expect(screen.getByText(/Too many requests/i)).toBeInTheDocument();
    });
  });

  it('handles delivery error with fallback link', async () => {
    vi.spyOn(api, 'sendContact').mockResolvedValueOnce({
      status: 'error',
      message: 'Failed to send. Please try again or email me directly at contact@joseberos.dev.',
    });

    render(<ScheduleMeetingModal isOpen={true} onClose={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText('e.g. Alex Vance'), { target: { value: 'Jane Developer' } });
    fireEvent.change(screen.getByPlaceholderText('alex@company.com'), { target: { value: 'jane@example.com' } });

    fireEvent.click(screen.getByText('Confirm Request'));

    await waitFor(() => {
      expect(screen.getByText(/Failed to send/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /contact@joseberos\.dev/i })).toBeInTheDocument();
    });
  });
});
