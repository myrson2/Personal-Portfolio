import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ScheduleMeetingModal from '../components/Modals/ScheduleMeetingModal';
import * as api from '../services/api';

describe('ScheduleMeetingModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<ScheduleMeetingModal isOpen={false} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders form inputs and handles submission', async () => {
    vi.spyOn(api, 'postContactPlaceholder').mockResolvedValueOnce({
      status: 'success',
      message: 'Meeting recorded successfully',
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
      expect(screen.getByText('Meeting recorded successfully')).toBeInTheDocument();
    });
  });
});

