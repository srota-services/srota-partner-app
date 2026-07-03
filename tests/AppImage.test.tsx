import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import AppImage from '../src/components/common/AppImage';

describe('AppImage', () => {
  it('renders an organization placeholder when src is null', () => {
    const { container } = render(
      <AppImage src={null} alt="Organization logo" variant="organization" />
    );

    expect(container.querySelector('img')).toBeNull();
    expect(
      container.querySelector('.app-image--organization.app-image--placeholder')
    ).toBeInTheDocument();
  });

  it('renders an author placeholder when src is null', () => {
    const { container } = render(
      <AppImage src={null} alt="Author photo" variant="author" />
    );

    expect(container.querySelector('img')).toBeNull();
    expect(
      container.querySelector('.app-image--author.app-image--placeholder')
    ).toBeInTheDocument();
  });

  it('renders a placeholder when src is empty or whitespace', () => {
    const { container } = render(<AppImage src="   " variant="thumbnail" />);

    expect(container.querySelector('img')).toBeNull();
    expect(
      container.querySelector('.app-image--thumbnail.app-image--placeholder')
    ).toBeInTheDocument();
  });

  it('renders an image when src is valid', () => {
    render(
      <AppImage
        src="https://example.com/cover.jpg"
        alt="Audiobook cover"
        variant="cover"
      />
    );

    const image = screen.getByRole('img', { name: 'Audiobook cover' });
    expect(image).toHaveAttribute('src', 'https://example.com/cover.jpg');
    expect(image).toHaveClass('app-image--loaded');
  });

  it('shows a placeholder after the image fails to load', () => {
    const { container } = render(
      <AppImage
        src="https://example.com/broken.jpg"
        alt="Broken image"
        variant="cover"
      />
    );

    const image = screen.getByRole('img', { name: 'Broken image' });
    fireEvent.error(image);

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.app-image--placeholder')).toBeInTheDocument();
  });

  it('renders custom fallback content when provided', () => {
    render(
      <AppImage
        src={null}
        variant="author"
        fallback={<span data-testid="avatar-fallback">JD</span>}
      />
    );

    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JD');
    expect(screen.queryByRole('img')).toBeNull();
  });
});
