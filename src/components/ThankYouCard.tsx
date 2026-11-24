import { Coffee } from 'lucide-react';
import type React from 'react';
import type { JSX } from 'react';
import { useEffect, useRef, useState } from 'react';

// 24 confetti particles with pre-calculated vectors (transform and opacity only)
const CONFETTI_PIECES = Array.from({ length: 24 }, (_, i) => {
  const angle = (i * 360) / 24 + (i % 3) * 5;
  const rad = (angle * Math.PI) / 180;
  const dist = 75 + (i % 4) * 25;
  const tx = Math.cos(rad) * dist;
  const ty = Math.sin(rad) * dist - 25; // slight upward bias
  const rot = (i * 75) % 360;
  const colors = ['#c4622d', '#a34e22', '#e08a4f', '#fbeadf', '#8a5a12', '#2b1d14'];
  const color = colors[i % colors.length] ?? '#c4622d';
  return { id: i, tx: `${tx}px`, ty: `${ty}px`, rot: `${rot}deg`, color };
});

export interface ThankYouCardProps {
  readonly onBack: () => void;
}

export function ThankYouCard({ onBack }: ThankYouCardProps): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    headingRef.current?.focus();
    if (prefersReducedMotion) {
      setShowConfetti(false);
      return;
    }
    const timer = setTimeout(() => setShowConfetti(false), 1200);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  return (
    <div
      aria-live="polite"
      className="relative flex min-h-[380px] w-full flex-col items-center justify-center p-8 text-center"
    >
      {/* 24-piece lightweight CSS confetti burst */}
      {showConfetti && !prefersReducedMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {CONFETTI_PIECES.map((p) => (
            <span
              key={p.id}
              className="chai-confetti-piece"
              style={
                {
                  '--tx': p.tx,
                  '--ty': p.ty,
                  '--rot': p.rot,
                  backgroundColor: p.color,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Steaming cup with fast steam animation */}
      <div className="relative mb-5 inline-flex items-center justify-center">
        {!prefersReducedMotion && (
          <svg
            viewBox="0 0 20 10"
            className="pointer-events-none absolute -top-3 left-1/2 h-3 w-6 -translate-x-1/2"
            aria-hidden="true"
          >
            <path
              d="M6 9 C 5 6, 7 3, 6 1"
              fill="none"
              stroke="var(--chai-accent)"
              strokeWidth="1.4"
              strokeLinecap="round"
              className="chai-steam-fast-1"
            />
            <path
              d="M12 9 C 11 6, 13 3, 12 1"
              fill="none"
              stroke="var(--chai-accent)"
              strokeWidth="1.4"
              strokeLinecap="round"
              className="chai-steam-fast-2"
            />
          </svg>
        )}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-chai-accent-soft text-chai-accent ring-1 ring-chai-line">
          <Coffee className="h-8 w-8" aria-hidden="true" />
        </div>
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-[32px] font-bold leading-tight tracking-[-0.02em] text-chai-ink outline-none sm:text-[36px]"
      >
        Thanks for the chai!
      </h2>

      <p className="mt-2 text-[15px] leading-relaxed text-chai-muted">
        It really helps. Chai is on me next time.
      </p>

      <button
        type="button"
        onClick={onBack}
        className="chai-interactive-hover mt-6 inline-flex min-h-[44px] items-center text-[13px] font-medium text-chai-muted underline underline-offset-2 transition-colors hover:text-chai-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chai-accent"
      >
        ← Back to payment
      </button>
    </div>
  );
}
