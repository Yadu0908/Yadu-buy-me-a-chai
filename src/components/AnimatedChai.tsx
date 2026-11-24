import type { JSX } from 'react';
import { config } from '../config/config.ts';

export interface AnimatedChaiProps {
  readonly className?: string;
  readonly gifUrl?: string;
}

export function AnimatedChai({ className = 'h-8 w-8', gifUrl }: AnimatedChaiProps): JSX.Element {
  const customGif = gifUrl ?? config.creator.chaiGif;

  if (customGif && customGif.trim().length > 0) {
    return (
      <img src={customGif} alt="Chai" className={`${className} inline-block object-contain`} />
    );
  }

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        className="h-full w-full drop-shadow-xs"
        aria-hidden="true"
      >
        {/* Steam line 1 */}
        <path
          d="M13 11 C 11.5 8, 14.5 5.5, 13 2.5"
          stroke="var(--chai-accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="chai-steam-line-1"
        />
        {/* Steam line 2 */}
        <path
          d="M18 10 C 16.5 7, 19.5 4.5, 18 1.5"
          stroke="var(--chai-accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="chai-steam-line-2"
        />
        {/* Steam line 3 */}
        <path
          d="M23 11 C 21.5 8, 24.5 5.5, 23 2.5"
          stroke="var(--chai-accent)"
          strokeWidth="1.8"
          strokeLinecap="round"
          className="chai-steam-line-1"
          style={{ animationDelay: '0.9s' }}
        />
        {/* Saucer */}
        <ellipse cx="18" cy="31" rx="13" ry="2.5" fill="var(--chai-line-strong)" />
        {/* Cup Body */}
        <path
          d="M8 14 L10 26 C 10.5 28.5, 13 30, 18 30 C 23 30, 25.5 28.5, 26 26 L28 14 Z"
          fill="var(--chai-accent)"
        />
        {/* Cup Rim */}
        <ellipse cx="18" cy="14" rx="10" ry="2.5" fill="var(--chai-accent-soft)" />
        {/* Hot Chai Liquid */}
        <ellipse cx="18" cy="15" rx="8.5" ry="1.8" fill="#783c16" />
        {/* Cup Handle */}
        <path
          d="M26 16 C 30.5 16, 30.5 24, 25 24"
          stroke="var(--chai-accent)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
}
