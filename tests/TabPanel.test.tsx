import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TabPanel from '../src/components/common/TabPanel';

describe('TabPanel', () => {
  it('renders the active tab content', () => {
    render(
      <TabPanel activeKey="linked">
        <p>Linked authors</p>
      </TabPanel>
    );
    expect(screen.getByText('Linked authors')).toBeInTheDocument();
  });

  it('swaps content when the active key changes', async () => {
    const { rerender } = render(
      <TabPanel activeKey="linked">
        <p>Linked authors</p>
      </TabPanel>
    );
    expect(screen.getByText('Linked authors')).toBeInTheDocument();

    rerender(
      <TabPanel activeKey="invitations">
        <p>Pending invitations</p>
      </TabPanel>
    );

    // AnimatePresence mode="wait" plays the exit animation before mounting the
    // new child, so the swapped content appears asynchronously.
    expect(
      await screen.findByText('Pending invitations')
    ).toBeInTheDocument();
    expect(screen.queryByText('Linked authors')).not.toBeInTheDocument();
  });

  it('applies the provided className to the animated container', () => {
    const { container } = render(
      <TabPanel activeKey="a" className="tab-content">
        <span>Body</span>
      </TabPanel>
    );
    expect(container.querySelector('.tab-content')).toBeTruthy();
  });
});
