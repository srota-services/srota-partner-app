import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TiptapEditor from '../src/components/editor/TiptapEditor';

describe('TiptapEditor', () => {
  it('renders an editable region', async () => {
    const onChange = vi.fn();

    render(
      <TiptapEditor
        content={{
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Hello page' }],
            },
          ],
        }}
        onChange={onChange}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('tiptap-editor-body')).toBeInTheDocument();
    });

    expect(screen.getByText('Hello page')).toBeInTheDocument();
  });
});
