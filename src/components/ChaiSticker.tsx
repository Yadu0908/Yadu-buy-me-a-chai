import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';

export interface ChaiStickerProps {
  readonly size?: 'desktop' | 'mobile';
  readonly className?: string;
}

export function ChaiSticker({ size = 'desktop', className = '' }: ChaiStickerProps): JSX.Element {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  const [isTabHidden, setIsTabHidden] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisChange = () => setIsTabHidden(document.hidden);
    document.addEventListener('visibilitychange', handleVisChange);
    return () => document.removeEventListener('visibilitychange', handleVisChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setIsIntersecting(entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isDesktop = size === 'desktop';
  const width = isDesktop ? 206 : 120;
  const height = isDesktop ? 350 : 204;
  const isPaused = isTabHidden || !isIntersecting || prefersReducedMotion;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center overflow-visible ${className}`}
    >
      {/* Soft warm radial glow behind sticker (opacity only, no filter) */}
      {isDesktop && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
          aria-hidden="true"
        >
          <div
            className="pointer-events-none h-[340px] w-[340px] rounded-full"
            style={{
              background:
                'radial-gradient(circle at center, rgba(255, 190, 110, 0.18) 0%, rgba(255, 190, 110, 0.06) 45%, rgba(255, 190, 110, 0) 70%, transparent 100%)',
            }}
          />
        </div>
      )}

      {/* Gentle float wrapper (translateY 0 to -6px, 4s ease-in-out loop) */}
      <div
        className={`relative flex flex-col items-center overflow-visible ${
          isPaused ? 'chai-sticker-float paused' : 'chai-sticker-float'
        }`}
      >
        <img
          src="https://media.giphy.com/media/3NhxVrZrxIoPtVyJ3x/giphy.webp"
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          alt="Animated chai sticker"
          className="pointer-events-none select-none object-contain"
          style={{
            width: `${width}px`,
            height: `${height}px`,
            background: 'transparent',
            border: 0,
            outline: 'none',
          }}
        />
        <a
          href="https://giphy.com/stickers/gifartist-procreate-viduladoodles-3NhxVrZrxIoPtVyJ3x"
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={-1}
          className="pointer-events-auto mt-2 text-[10px] leading-none text-chai-muted underline underline-offset-2 transition-colors hover:text-chai-ink"
        >
          via GIPHY
        </a>
      </div>
    </div>
  );
}
