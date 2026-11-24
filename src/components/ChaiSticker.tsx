import type { JSX } from 'react';
import { useEffect, useState } from 'react';

export interface ChaiStickerProps {
  readonly size?: 'desktop' | 'mobile';
  readonly className?: string;
}

export function ChaiSticker({
  size = 'desktop',
  className = '',
}: ChaiStickerProps): JSX.Element | null {
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

  if (prefersReducedMotion) {
    return null;
  }

  const isDesktop = size === 'desktop';
  const width = isDesktop ? 120 : 90;
  const height = isDesktop ? 205 : 154;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        style={{ width: `${width}px`, height: `${height}px` }}
        className="relative overflow-visible"
      >
        <img
          src="https://media.giphy.com/media/3NhxVrZrxIoPtVyJ3x/giphy.webp"
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          alt="Animated chai sticker"
          className="pointer-events-none select-none object-contain"
          style={{ width: `${width}px`, height: `${height}px` }}
        />
      </div>
      <a
        href="https://giphy.com/stickers/gifartist-procreate-viduladoodles-3NhxVrZrxIoPtVyJ3x"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 text-[11px] text-chai-muted underline underline-offset-2 transition-colors hover:text-chai-ink"
      >
        via GIPHY
      </a>
    </div>
  );
}
