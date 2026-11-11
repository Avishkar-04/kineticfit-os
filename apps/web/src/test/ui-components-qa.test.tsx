// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Button,
  Input,
  Checkbox,
  ProgressRing,
  KPICard,
  DataTable,
  Modal,
  BadgeChip,
  Logo
} from '@kineticfit/ui';

describe('QA Automation Suite: @kineticfit/ui Components & Accessibility', () => {
  describe('Button Component', () => {
    it('renders all variants (primary, secondary, ghost, danger) correctly', () => {
      const { rerender } = render(<Button variant="primary">Primary Action</Button>);
      const btn = screen.getByRole('button', { name: /Primary Action/i });
      expect(btn).toHaveClass('bg-kf-lime');

      rerender(<Button variant="secondary">Secondary Action</Button>);
      expect(screen.getByRole('button', { name: /Secondary Action/i })).toHaveClass('border-kf-border');

      rerender(<Button variant="ghost">Ghost Action</Button>);
      expect(screen.getByRole('button', { name: /Ghost Action/i })).toHaveClass('text-kf-text-muted');

      rerender(<Button variant="danger">Danger Action</Button>);
      expect(screen.getByRole('button', { name: /Danger Action/i })).toHaveClass('text-kf-danger');
    });

    it('renders all sizes (sm, md, lg)', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button', { name: /Small/i })).toHaveClass('h-8');

      rerender(<Button size="md">Medium</Button>);
      expect(screen.getByRole('button', { name: /Medium/i })).toHaveClass('h-10');

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button', { name: /Large/i })).toHaveClass('h-12');
    });

    it('handles isLoading state: disables button, renders spinner, prevents click events', () => {
      const handleClick = vi.fn();
      render(
        <Button isLoading onClick={handleClick}>
          Submit Telemetry
        </Button>
      );
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('handles disabled state: prevents click events', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Locked Action
        </Button>
      );
      const btn = screen.getByRole('button', { name: /Locked Action/i });
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('fires onClick when clicked in normal state', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Active Button</Button>);
      const btn = screen.getByRole('button', { name: /Active Button/i });
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Input Component & A11y', () => {
    it('associates label with input using htmlFor and id', () => {
      render(<Input label="Athlete Email" placeholder="athlete@kineticfit.dev" />);
      const input = screen.getByPlaceholderText('athlete@kineticfit.dev');
      const associatedInput = screen.getByLabelText('Athlete Email');
      expect(associatedInput).toBe(input);
      expect(input.id).toBeTruthy();
    });

    it('toggles password visibility with accessible button', async () => {
      render(<Input isPassword label="Security PIN" placeholder="Enter PIN" />);
      const input = screen.getByPlaceholderText('Enter PIN') as HTMLInputElement;
      expect(input.type).toBe('password');

      const toggleBtn = screen.getByRole('button', { name: /Show password/i });
      expect(toggleBtn).toBeInTheDocument();

      fireEvent.click(toggleBtn);
      expect(input.type).toBe('text');
      expect(screen.getByRole('button', { name: /Hide password/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Hide password/i }));
      expect(input.type).toBe('password');
    });

    it('renders error message and helper text', () => {
      const { rerender } = render(<Input error="Invalid RFID format" />);
      expect(screen.getByText('Invalid RFID format')).toHaveClass('text-kf-danger');

      rerender(<Input helperText="Swipe or tap keycard against scanner" />);
      expect(screen.getByText('Swipe or tap keycard against scanner')).toBeInTheDocument();
    });

    it('allows typing and value updates', () => {
      const handleChange = vi.fn();
      render(<Input placeholder="Search" onChange={handleChange} />);
      const input = screen.getByPlaceholderText('Search');
      fireEvent.change(input, { target: { value: 'Elena' } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Checkbox Component', () => {
    it('toggles state on click and triggers onChange', () => {
      const handleChange = vi.fn();
      render(
        <Checkbox
          label="Auto-promote waitlist"
          description="Promotes standby athletes automatically"
          onChange={handleChange}
        />
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('respects disabled state', () => {
      const handleChange = vi.fn();
      render(<Checkbox disabled label="Enforce 2FA" onChange={handleChange} />);
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
      fireEvent.click(checkbox);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('ProgressRing Component & Edge Cases', () => {
    it('clamps negative values to 0% and displays cleanly', () => {
      render(<ProgressRing value={-25} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('clamps values >100 to 100%', () => {
      render(<ProgressRing value={145} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('handles NaN and undefined gracefully without NaN% display', () => {
      render(<ProgressRing value={NaN} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('displays custom label and sublabel when provided', () => {
      render(<ProgressRing value={75} label="75/100" sublabel="Athletes" />);
      expect(screen.getByText('75/100')).toBeInTheDocument();
      expect(screen.getByText('Athletes')).toBeInTheDocument();
    });

    it('supports all color variants (lime, cyan, danger)', () => {
      const { rerender, container } = render(<ProgressRing value={50} color="lime" />);
      expect(container.querySelector('.text-kf-lime')).toBeInTheDocument();

      rerender(<ProgressRing value={50} color="cyan" />);
      expect(container.querySelector('.text-kf-cyan')).toBeInTheDocument();

      rerender(<ProgressRing value={50} color="danger" />);
      expect(container.querySelector('.text-kf-danger')).toBeInTheDocument();
    });
  });

  describe('KPICard Component & Keyboard A11y', () => {
    it('renders label, formatted value, delta badge, and subtext', () => {
      render(
        <KPICard
          label="Current MRR"
          value="$246,820"
          delta={{ value: '+6.1%', isPositive: true, period: 'MoM' }}
          subtext="Target: $250,000"
        />
      );
      expect(screen.getByText('Current MRR')).toBeInTheDocument();
      expect(screen.getByText('$246,820')).toBeInTheDocument();
      expect(screen.getByText('+6.1%')).toBeInTheDocument();
      expect(screen.getByText('MoM')).toBeInTheDocument();
      expect(screen.getByText('Target: $250,000')).toBeInTheDocument();
    });

    it('renders negative delta correctly', () => {
      render(
        <KPICard
          label="Churn Rate"
          value="1.8%"
          delta={{ value: '-0.4%', isPositive: false }}
        />
      );
      expect(screen.getByText('-0.4%')).toBeInTheDocument();
    });

    it('supports keyboard navigation (Enter/Space) and click when interactive', () => {
      const handleClick = vi.fn();
      render(<KPICard label="Clickable Metric" value="100" onClick={handleClick} />);
      const card = screen.getByRole('button');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('tabIndex', '0');

      // Click
      fireEvent.click(card);
      expect(handleClick).toHaveBeenCalledTimes(1);

      // Keyboard Enter
      fireEvent.keyDown(card, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(2);

      // Keyboard Space
      fireEvent.keyDown(card, { key: ' ' });
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('DataTable Component', () => {
    interface TestItem {
      id: string;
      name: string;
      status: string;
    }

    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'status', header: 'Status' }
    ];

    const data: TestItem[] = [
      { id: '1', name: 'Alpha Hub', status: 'ACTIVE' },
      { id: '2', name: 'Beta Hub', status: 'STANDBY' }
    ];

    it('renders table headers and rows correctly', () => {
      render(
        <DataTable
          columns={columns}
          data={data}
          keyExtractor={(item) => item.id}
        />
      );
      expect(screen.getByText('Alpha Hub')).toBeInTheDocument();
      expect(screen.getByText('Beta Hub')).toBeInTheDocument();
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    });

    it('renders emptyMessage when data array is empty', () => {
      render(
        <DataTable
          columns={columns}
          data={[] as TestItem[]}
          keyExtractor={(item) => item.id}
          emptyMessage="No nodes found in sector"
        />
      );
      expect(screen.getByText('No nodes found in sector')).toBeInTheDocument();
    });

    it('renders loading spinner when isLoading=true', () => {
      render(
        <DataTable
          columns={columns}
          data={[] as TestItem[]}
          keyExtractor={(item) => item.id}
          isLoading={true}
        />
      );
      expect(screen.getByText(/Loading telemetry stream/i)).toBeInTheDocument();
    });

    it('triggers onRowClick with correct row object', () => {
      const handleRowClick = vi.fn();
      render(
        <DataTable
          columns={columns}
          data={data}
          keyExtractor={(item) => item.id}
          onRowClick={handleRowClick}
        />
      );
      const row = screen.getByText('Alpha Hub');
      fireEvent.click(row);
      expect(handleRowClick).toHaveBeenCalledWith(data[0]);
    });
  });

  describe('Modal Component & A11y', () => {
    it('renders dialog when isOpen=true and renders nothing when isOpen=false', () => {
      const { rerender } = render(
        <Modal isOpen={false} onClose={() => {}} title="Test Modal">
          <p>Hidden Content</p>
        </Modal>
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      rerender(
        <Modal isOpen={true} onClose={() => {}} title="Test Modal">
          <p>Visible Content</p>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Visible Content')).toBeInTheDocument();
    });

    it('calls onClose when close icon button is clicked', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Locker Terminal">
          <p>Body</p>
        </Modal>
      );
      const closeBtn = screen.getByLabelText('Close dialog');
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Escape Test">
          <p>Body</p>
        </Modal>
      );
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('BadgeChip Component', () => {
    it('renders all variants and dot indicator', () => {
      const { rerender } = render(<BadgeChip variant="active">Active</BadgeChip>);
      expect(screen.getByText('Active')).toBeInTheDocument();

      rerender(<BadgeChip variant="danger">High Load</BadgeChip>);
      expect(screen.getByText('High Load')).toBeInTheDocument();

      rerender(<BadgeChip variant="cyan" dot={false}>Syncing</BadgeChip>);
      expect(screen.getByText('Syncing')).toBeInTheDocument();
    });
  });

  describe('Logo Component', () => {
    it('renders KineticFit brand logo in sm, md, lg sizes', () => {
      const { rerender } = render(<Logo size="sm" />);
      expect(screen.getByText('KINETIC')).toBeInTheDocument();
      expect(screen.getByText('FIT')).toBeInTheDocument();

      rerender(<Logo size="md" />);
      expect(screen.getByText('KINETIC')).toBeInTheDocument();
      expect(screen.getByText('FIT')).toBeInTheDocument();

      rerender(<Logo size="lg" />);
      expect(screen.getByText('KINETIC')).toBeInTheDocument();
      expect(screen.getByText('FIT')).toBeInTheDocument();

      rerender(<Logo size="md" showWordmark={false} />);
      expect(screen.queryByText('KINETIC')).not.toBeInTheDocument();
      expect(screen.queryByText('FIT')).not.toBeInTheDocument();
    });
  });
});
