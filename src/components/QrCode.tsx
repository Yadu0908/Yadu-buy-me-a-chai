import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { strings } from '../strings.ts';

export interface QrCodeProps {
  readonly svgDataUrl: string;
  readonly alt: string;
  readonly showCaption?: boolean;
}

export function QrCode({ svgDataUrl, alt, showCaption = true }: QrCodeProps): JSX.Element {
  const [currentUrl, setCurrentUrl] = useState(svgDataUrl);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);

  useEffect(() => {
    if (svgDataUrl !== currentUrl) {
      setPrevUrl(currentUrl);
      setCurrentUrl(svgDataUrl);
      const timer = setTimeout(() => {
        setPrevUrl(null);
      }, 160);
      return () => clearTimeout(timer);
    }
  }, [svgDataUrl, currentUrl]);

  return (
    <figure className="flex flex-col items-center gap-1.5">
      <div className="relative h-[180px] w-[180px] overflow-hidden rounded-[16px] bg-white p-2.5 shadow-[0_1px_2px_rgb(43_29_20/0.08),0_8px_24px_rgb(43_29_20/0.08)] ring-1 ring-chai-line">
        {prevUrl !== null && (
          <img
            src={prevUrl}
            alt=""
            aria-hidden="true"
            className="chai-qr-fade-out pointer-events-none absolute inset-2.5 h-[160px] w-[160px]"
          />
        )}
        <img
          key={currentUrl}
          src={currentUrl}
          alt={alt}
          className="chai-qr-fade-in absolute inset-2.5 h-[160px] w-[160px]"
        />
      </div>

      {showCaption && (
        <figcaption className="text-center text-[12px] leading-snug text-chai-muted">
          {strings.qrCaption}
        </figcaption>
      )}
    </figure>
  );
}
