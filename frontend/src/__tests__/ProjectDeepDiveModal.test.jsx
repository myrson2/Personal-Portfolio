import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProjectDeepDiveModal from '../components/Modals/ProjectDeepDiveModal';
import * as api from '../services/api';

const MOCK_PROJECT = {
  slug: 'smartstock-ai',
  title: 'SmartStock AI',
  tagline: 'Autonomous inventory optimization system forecasting supply volatility.',
  category: 'AI & Systems Engineering',
  tags: ['Python', 'FastAPI', 'React'],
  github_url: 'https://github.com/myrson2',
  demo_url: null,
  architecture_overview: 'Distributed predictive inventory architecture.',
  components: [
    {
      name: 'Forecast Gateway',
      description: 'Asynchronous API coordinating predictions.',
      tech: 'FastAPI',
    },
  ],
  challenges: [
    {
      challenge: 'Model inference latency.',
      solution: 'In-memory TTL caching tier.',
      impact: 'Reduced p99 latency to 42ms.',
    },
  ],
  tech_rationale: [
    {
      technology: 'FastAPI',
      role: 'Backend Gateway',
      rationale: 'Async ASGI performance.',
    },
  ],
  metrics: [
    {
      label: 'Stockout Reduction',
      value: '-40%',
      description: 'Fewer out-of-stock incidents.',
    },
  ],
  demo_instructions: 'Simulate SKU check.',
  simulated_steps: [
    {
      command: 'python cli.py predict',
      output: 'Predicted demand: 320 units.',
    },
    {
      command: 'python cli.py order',
      output: 'Order PO-9912 placed.',
    },
  ],
};

describe('ProjectDeepDiveModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ProjectDeepDiveModal slug="smartstock-ai" isOpen={false} onClose={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders project case study content and metrics when loaded', async () => {
    vi.spyOn(api, 'fetchProjectDetails').mockResolvedValueOnce({
      status: 'success',
      data: MOCK_PROJECT,
    });

    render(
      <ProjectDeepDiveModal slug="smartstock-ai" isOpen={true} onClose={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('SmartStock AI')).toBeInTheDocument();
      expect(screen.getByText('-40%')).toBeInTheDocument();
      expect(screen.getByText('Stockout Reduction')).toBeInTheDocument();
    });
  });

  it('switches tabs to display engineering challenges and architecture', async () => {
    vi.spyOn(api, 'fetchProjectDetails').mockResolvedValueOnce({
      status: 'success',
      data: MOCK_PROJECT,
    });

    render(
      <ProjectDeepDiveModal slug="smartstock-ai" isOpen={true} onClose={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('SmartStock AI')).toBeInTheDocument();
    });

    // Switch to Architecture tab
    fireEvent.click(screen.getByRole('button', { name: /Architecture/i }));
    expect(screen.getByText('Subsystem Architecture')).toBeInTheDocument();
    expect(screen.getByText('Forecast Gateway')).toBeInTheDocument();

    // Switch to Engineering Challenges tab
    fireEvent.click(screen.getByRole('button', { name: /Engineering Challenges/i }));
    expect(screen.getByText('Engineering Roadblocks & Solutions')).toBeInTheDocument();
    expect(screen.getByText('Model inference latency.')).toBeInTheDocument();
    expect(screen.getByText(/Reduced p99 latency to 42ms/i)).toBeInTheDocument();
  });

  it('allows interacting with the simulated sandbox terminal', async () => {
    vi.spyOn(api, 'fetchProjectDetails').mockResolvedValueOnce({
      status: 'success',
      data: MOCK_PROJECT,
    });

    render(
      <ProjectDeepDiveModal slug="smartstock-ai" isOpen={true} onClose={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('SmartStock AI')).toBeInTheDocument();
    });

    // Switch to Live Sandbox tab
    fireEvent.click(screen.getByRole('button', { name: /Live Sandbox Demo/i }));
    expect(screen.getByText('Interactive Sandbox Terminal')).toBeInTheDocument();
    expect(screen.getByText('$ python cli.py predict')).toBeInTheDocument();

    // Run next step
    fireEvent.click(screen.getByRole('button', { name: /Run Next Command/i }));
    expect(screen.getByText('$ python cli.py order')).toBeInTheDocument();
    expect(screen.getByText('Order PO-9912 placed.')).toBeInTheDocument();
  });

  it('renders a notice when project is not found', async () => {
    vi.spyOn(api, 'fetchProjectDetails').mockResolvedValueOnce({
      status: 'not_found',
      message: 'Project not found',
    });

    render(
      <ProjectDeepDiveModal slug="invalid-slug" isOpen={true} onClose={() => {}} />
    );

    await waitFor(() => {
      expect(
        screen.getByText('This project case study is not yet implemented or does not exist.')
      ).toBeInTheDocument();
    });
  });
});
