import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { strings } from '../strings.ts';
import { Masthead } from './Masthead.tsx';

describe('Masthead', () => {
  it('renders the locked brand wordmark inside the page banner', () => {
    render(<Masthead />);

    expect(screen.getByRole('banner')).toHaveTextContent(strings.brandName);
  });

  it('keeps the wordmark a logotype, not a heading', () => {
    render(<Masthead />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});
