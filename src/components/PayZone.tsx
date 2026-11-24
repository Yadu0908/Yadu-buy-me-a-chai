import { Check, Copy, Download, Smartphone } from 'lucide-react';
import type { JSX } from 'react';
import { useCallback, useEffect, useId, useState } from 'react';
import { track } from '../analytics/index.ts';
import { useIsMobile } from '../hooks/useIsMobile.ts';
import { useToast } from '../hooks/useToast.ts';
import type { UpiQr } from '../hooks/useUpiIntent.ts';
import { formatRupees } from '../lib/amount.ts';
import { copyText } from '../lib/clipboard.ts';
import { downloadDataUrl } from '../lib/download.ts';
import type { UpiError, UpiIntent } from '../lib/upi.ts';
import { strings, upiErrorStrings } from '../strings.ts';
import { GiphyChai } from './GiphyChai.tsx';
import { QrCode } from './QrCode.tsx';
import { Toast } from './Toast.tsx';

export interface PayZoneProps {
  readonly intent: UpiIntent | null;
  readonly errors: readonly UpiError[];
  readonly qr: UpiQr | null;
  readonly onPaidClick?: () => void;
}

export function PayZone({ intent, errors, qr, onPaidClick }: PayZoneProps): JSX.Element {
  const isMobile = useIsMobile();
  const { toast, showToast } = useToast();
  const warningId = useId();

  const payableRupees = intent === null ? null : Number.parseInt(intent.amount, 10);

  const [displayAmount, setDisplayAmount] = useState<number | null>(payableRupees);
  const [prevAmount, setPrevAmount] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (payableRupees !== displayAmount) {
      setPrevAmount(displayAmount);
      setDisplayAmount(payableRupees);
      const timer = setTimeout(() => {
        setPrevAmount(null);
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [payableRupees, displayAmount]);

  const handleCopy = useCallback((): void => {
    if (intent === null || payableRupees === null) return;
    track({ name: 'pay_clicked', method: 'copy_vpa', amount: payableRupees });
    void copyText(intent.vpa).then((ok) => {
      if (ok) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1500);
      }
      showToast(ok ? strings.copyConfirmation(formatRupees(payableRupees)) : strings.copyFailed);
    });
  }, [intent, payableRupees, showToast]);

  const handleSaveQr = useCallback((): void => {
    if (intent === null || payableRupees === null || qr === null) return;
    track({ name: 'pay_clicked', method: 'qr_download', amount: payableRupees });
    downloadDataUrl(qr.toPngDataUrl(), strings.qrDownloadFilename(intent.vpa, payableRupees));
  }, [intent, payableRupees, qr]);

  return (
    <div className="w-full">
      <div aria-live="polite">
        {errors.length > 0 && (
          <ul className="mb-3 space-y-1 text-[13px] text-chai-error">
            {errors.map((error) => (
              <li key={error.code}>{upiErrorStrings[error.code]}</li>
            ))}
          </ul>
        )}
      </div>

      {intent === null || payableRupees === null ? (
        errors.length === 0 && (
          <p className="py-6 text-center text-[13px] text-chai-muted">{strings.amountPrompt}</p>
        )
      ) : (
        <div className="flex flex-col items-center gap-4">
          {/* 
            Desktop: GIF on top -> Amount & UPI -> QR -> Buttons -> "I've paid" -> Note.
            Phones: Amount & UPI -> Deeplink button -> GIF -> QR -> Buttons -> "I've paid" -> Note.
          */}

          {/* GIF slot: desktop order 1, phone order 3 */}
          <div className="order-3 lg:order-1">
            <GiphyChai />
          </div>

          {/* Amount and UPI ID: phone order 1, desktop order 2 */}
          <div className="order-1 flex flex-col items-center lg:order-2">
            <p className="sr-only">{strings.payingTo(formatRupees(payableRupees), intent.vpa)}</p>
            <div
              aria-hidden="true"
              className="chai-numeral flex items-baseline justify-center gap-1"
            >
              <span className="text-[22px] font-semibold leading-none text-chai-accent">₹</span>
              <span className="relative inline-block h-[44px] overflow-hidden">
                {prevAmount !== null && (
                  <span
                    className="chai-amount-out absolute left-0 top-0 inline-block text-[42px] font-bold leading-none tracking-[-0.03em]"
                    aria-hidden="true"
                  >
                    {formatRupees(prevAmount)}
                  </span>
                )}
                <span
                  key={displayAmount}
                  className={`${prevAmount !== null ? 'chai-amount-in' : ''} inline-block text-[42px] font-bold leading-none tracking-[-0.03em]`}
                >
                  {formatRupees(displayAmount ?? 0)}
                </span>
              </span>
            </div>
            <p aria-hidden="true" className="mt-1.5">
              <span className="inline-block whitespace-nowrap rounded-lg bg-chai-accent-soft px-2.5 py-1 font-vpa text-[12px] text-chai-ink">
                {intent.vpa}
              </span>
            </p>
          </div>

          {/* Mobile deeplink button: phone order 2, hidden on desktop */}
          {isMobile && (
            <div className="order-2 w-full pt-1 text-center lg:hidden">
              <a
                href={intent.uri}
                aria-describedby={warningId}
                onClick={() => {
                  track({
                    name: 'pay_clicked',
                    method: 'deeplink',
                    amount: payableRupees,
                  });
                }}
                className="chai-interactive-hover inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-chai-accent px-5 py-2.5 text-[14px] font-semibold text-chai-accent-ink transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chai-accent"
              >
                <Smartphone aria-hidden="true" className="h-4 w-4" />
                <span>{strings.payDirectly}</span>
                <span className="rounded-full bg-chai-accent-ink/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  {strings.experimentalTag}
                </span>
              </a>
              <p
                id={warningId}
                className="mx-auto mt-1.5 max-w-[19rem] text-[11px] leading-snug text-chai-muted"
              >
                {strings.payDirectlyWarning}
              </p>
            </div>
          )}

          {/* QR code: phone order 4, desktop order 3 */}
          <div className="order-4 flex justify-center lg:order-3">
            {qr !== null ? (
              <QrCode
                svgDataUrl={qr.svgDataUrl}
                alt={strings.qrAlt(intent.vpa, formatRupees(payableRupees))}
              />
            ) : (
              <p className="py-6 text-center text-[13px] text-chai-muted">
                {strings.qrUnavailable}
              </p>
            )}
          </div>

          {/* Action buttons in one row: phone order 5, desktop order 4 */}
          <div className="order-5 flex w-full max-w-[320px] gap-2 pt-1 lg:order-4">
            <button
              type="button"
              onClick={handleCopy}
              aria-live="polite"
              className="chai-interactive-hover inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full border border-chai-line px-3 text-[13px] font-semibold text-chai-ink transition-colors hover:border-chai-accent hover:text-chai-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chai-accent"
            >
              {isCopied ? (
                <>
                  <Check aria-hidden="true" className="h-4 w-4 text-chai-accent" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy aria-hidden="true" className="h-4 w-4" />
                  <span>{strings.copyUpiId}</span>
                </>
              )}
            </button>
            {qr !== null && (
              <button
                type="button"
                onClick={handleSaveQr}
                className="chai-interactive-hover inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-full border border-chai-line px-3 text-[13px] font-semibold text-chai-ink transition-colors hover:border-chai-accent hover:text-chai-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chai-accent"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                <span>{strings.qrDownload}</span>
              </button>
            )}
          </div>

          {/* Secondary "I've paid" button: phone order 6, desktop order 5 */}
          <div className="order-6 text-center lg:order-5">
            <button
              type="button"
              onClick={onPaidClick}
              className="chai-interactive-hover inline-flex min-h-[36px] items-center rounded-full border border-chai-line/60 bg-transparent px-3.5 py-1 text-[12px] font-medium text-chai-muted transition-colors hover:border-chai-accent hover:text-chai-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chai-accent"
            >
              I&apos;ve paid
            </button>
          </div>

          {/* One-line "Scan with any UPI app" note: phone order 7, desktop order 6 */}
          <p className="order-7 text-center text-[11px] leading-snug text-chai-muted lg:order-6">
            {strings.qrCaption}
          </p>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
