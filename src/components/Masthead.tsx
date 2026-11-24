import { Coffee } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { config } from '../config/config.ts';
import { strings } from '../strings.ts';

export function Masthead(): JSX.Element {
  const { creator } = config;
  const hasPortfolio = Boolean(creator.portfolioUrl && creator.portfolioUrl.trim().length > 0);

  const [isTabHidden, setIsTabHidden] = useState(false);
  useEffect(() => {
    const onVisibilityChange = () => {
      setIsTabHidden(document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return (
    <header className="border-b border-chai-line">
      <div className="mx-auto flex w-full max-w-[480px] items-center justify-between gap-3 px-4 py-3 lg:max-w-[1040px]">
        <span className="inline-flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-chai-ink">
          <span className="relative inline-flex items-center">
            <svg
              viewBox="0 0 20 10"
              className={`chai-steam pointer-events-none absolute -top-2.5 left-1/2 h-2.5 w-5 -translate-x-1/2 ${
                isTabHidden ? 'chai-steam-paused' : ''
              }`}
              aria-hidden="true"
            >
              <path
                d="M6 9 C 5 6, 7 4, 6 1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                className="chai-steam-line-1 text-chai-accent"
              />
              <path
                d="M12 9 C 11 6, 13 4, 12 1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                className="chai-steam-line-2 text-chai-accent"
              />
            </svg>
            <Coffee aria-hidden="true" className="h-[18px] w-[18px] text-chai-accent" />
          </span>
          {strings.brandName}
        </span>

        {hasPortfolio && (
          <a
            href={creator.portfolioUrl}
            className="inline-flex min-h-[44px] items-center text-[13px] font-medium text-chai-muted transition-colors hover:text-chai-ink"
          >
            Back to portfolio
          </a>
        )}
      </div>
    </header>
  );
}
