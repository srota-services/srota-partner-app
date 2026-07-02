import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CloseButton from '../src/components/common/CloseButton';

describe('CloseButton', () => {
  it('renders with the default accessible label', () => {
    render(<CloseButton />);
    expect(
      screen.getByRole('button', { name: 'Close' })
    ).toBeInTheDocument();
  });

  it('uses a custom label when provided', () => {
    render(<CloseButton label="Close preview" />);
    expect(
      screen.getByRole('button', { name: 'Close preview' })
    ).toBeInTheDocument();
  });

  it('applies the size modifier and any custom class', () => {
    render(<CloseButton size="sm" className="custom-close" />);
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button).toHaveClass('close-button');
    expect(button).toHaveClass('close-button--sm');
    expect(button).toHaveClass('custom-close');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<CloseButton onClick={handleClick} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<CloseButton onClick={handleClick} disabled />);
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
