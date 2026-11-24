import { Coffee } from 'lucide-react';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';

export function GiphyChai(): JSX.Element {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[170px] w-[170px] overflow-hidden rounded-[16px] bg-chai-accent-soft shadow-inner">
        {/* Soft placeholder with cup icon */}
        {(!iframeLoaded || prefersReducedMotion) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-chai-accent-soft text-chai-accent"
            aria-hidden="true"
          >
            <Coffee className="h-10 w-10 text-chai-accent opacity-75" />
            <span className="text-[12px] font-medium opacity-75">Hot Masala Chai</span>
          </div>
        )}

        {/* Sandboxed iframe embed — skipped under prefers-reduced-motion */}
        {!prefersReducedMotion && (
          <iframe
            src="https://giphy.com/embed/i1T0cqIGtwHdH7EYif"
            loading="lazy"
            title="Chai GIF"
            referrerPolicy="no-referrer"
            tabIndex={-1}
            style={{ border: 0 }}
            onLoad={() => setIframeLoaded(true)}
            className="pointer-events-none absolute inset-0 h-full w-full"
          />
        )}
      </div>

      <a
        href="https://giphy.com/gifs/ThePahadiStory-tea-chai-masala-i1T0cqIGtwHdH7EYif"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 text-[11px] text-chai-muted underline underline-offset-2 transition-colors hover:text-chai-ink"
      >
        via GIPHY
      </a>
    </div>
  );
}
