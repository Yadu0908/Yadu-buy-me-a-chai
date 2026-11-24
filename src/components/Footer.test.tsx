import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer.tsx';

describe('Footer', () => {
  it('renders "Made with love by Yadu" only', () => {
    render(<Footer />);

    expect(screen.getByText('Made with love by Yadu')).toBeInTheDocument();
    expect(screen.queryByText(/Forked from/)).not.toBeInTheDocument();
  });
});
