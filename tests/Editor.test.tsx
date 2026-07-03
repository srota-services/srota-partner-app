import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Editor from '../src/pages/editor/Editor';

function renderEditor(initialEntry = '/editor') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/editor/*" element={<Editor />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Editor', () => {
  it('shows breadcrumb for the default mock page selection', () => {
    renderEditor();

    const contextNav = screen.getByRole('navigation', { name: 'Editor context' });
    expect(within(contextNav).getByText('The Great Epic')).toBeInTheDocument();
    expect(within(contextNav).getByText(/introduction/i)).toBeInTheDocument();
    expect(within(contextNav).getByText('Page 1')).toBeInTheDocument();
  });

  it('updates breadcrumb when selecting a different page', async () => {
    const user = userEvent.setup();
    renderEditor();

    const pageTwo = screen.getByRole('treeitem', { name: /^page 2$/i });
    await user.click(pageTwo);

    const contextNav = screen.getByRole('navigation', { name: 'Editor context' });
    expect(within(contextNav).getByText('Page 2')).toBeInTheDocument();
    expect(within(contextNav).getByText(/introduction/i)).toBeInTheDocument();
  });

  it('expands and collapses chapter nodes in the directory tree', async () => {
    const user = userEvent.setup();
    renderEditor();

    const chapterButton = screen.getByRole('button', {
      name: /toggle chapter the journey begins/i,
    });

    expect(chapterButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(chapterButton);
    expect(chapterButton).toHaveAttribute('aria-expanded', 'true');

    const tree = screen.getByRole('tree', { name: 'Audiobook directory' });
    expect(
      within(tree).getAllByRole('treeitem', { name: /^page 1$/i }).length
    ).toBeGreaterThanOrEqual(1);

    await user.click(chapterButton);
    expect(chapterButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders the Tiptap editor workspace', () => {
    renderEditor();

    expect(screen.getByTestId('tiptap-editor-body')).toBeInTheDocument();
    expect(screen.getByLabelText(/typing language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/heading level/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add note/i })).toBeInTheDocument();
  });

  it('shows audiobook creation control in the directory tree', () => {
    renderEditor();

    expect(screen.getByRole('button', { name: /^audiobook$/i })).toBeInTheDocument();
    expect(screen.getByRole('separator', { name: /resize editor sidebar/i })).toBeInTheDocument();
  });

  it('adds a new audiobook row and opens rename input', async () => {
    const user = userEvent.setup();
    renderEditor('/editor');

    await user.click(screen.getByRole('button', { name: /^audiobook$/i }));

    expect(screen.getByRole('textbox', { name: /rename audiobook/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue(/new audiobook/i)).toBeInTheDocument();
    expect(screen.getByText('New Audiobook 4')).toBeInTheDocument();
  });

  it('shows delete controls beside add controls in the directory tree', () => {
    renderEditor();

    const tree = screen.getByRole('tree', { name: 'Audiobook directory' });

    expect(
      within(tree).getByRole('button', { name: /delete the great epic/i })
    ).toBeInTheDocument();
    expect(
      within(tree).getByRole('button', { name: /delete chapter introduction/i })
    ).toBeInTheDocument();
    expect(
      within(tree).getByRole('button', { name: /delete page 2/i })
    ).toBeInTheDocument();
  });
});
