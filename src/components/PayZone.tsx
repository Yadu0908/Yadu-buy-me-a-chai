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
import { QrCode } from './QrCode.tsx';
import { ThankYouCard } from './ThankYouCard.tsx';
import { Toast } from './Toast.tsx';

export interface PayZoneProps {
  readonly intent: UpiIntent | null;
  readonly errors: readonly UpiError[];
  readonly qr: UpiQr | null;
  readonly onPaidClick?: () => void;
  readonly hasPaid?: boolean;
  readonly onBackToPay?: () => void;
}

export function PayZone({
  intent,
  errors,
  qr,
  onPaidClick,
  hasPaid = false,
  onBackToPay,
}: PayZoneProps): JSX.Element {
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
      ) : hasPaid ? (
        <div className="w-full rounded-[20px] border border-chai-line bg-chai-surface p-4 shadow-sm sm:p-5">
          <ThankYouCard onBack={onBackToPay ?? (() => {})} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Mobile deeplink button: on phones, sits right above the QR block */}
          {isMobile && (
            <div className="w-full text-center lg:hidden">
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

          {/* Compact card: total block height at most 220px on desktop */}
          <div className="w-full rounded-[20px] border border-chai-line bg-chai-surface px-3 py-2 shadow-sm sm:px-3.5 sm:py-2.5">
            {/* Top row: Amount & UPI ID on left, QR (about 130px) on right */}
            <div className="flex items-center justify-between gap-3">
              {/* Left: Amount and UPI ID */}
              <div className="flex flex-col items-start justify-center">
                <p className="sr-only">
                  {strings.payingTo(formatRupees(payableRupees), intent.vpa)}
                </p>
                <div aria-hidden="true" className="chai-numeral flex items-baseline gap-1">
                  <span className="text-[18px] font-semibold leading-none text-chai-accent sm:text-[20px]">
                    ₹
                  </span>
                  <span className="relative inline-block h-[38px] overflow-hidden">
                    {prevAmount !== null && (
                      <span
                        className="chai-amount-out absolute left-0 top-0 inline-block text-[34px] font-bold leading-none tracking-[-0.03em] sm:text-[36px]"
                        aria-hidden="true"
                      >
                        {formatRupees(prevAmount)}
                      </span>
                    )}
                    <span
                      key={displayAmount}
                      className={`${prevAmount !== null ? 'chai-amount-in' : ''} inline-block text-[34px] font-bold leading-none tracking-[-0.03em] sm:text-[36px]`}
                    >
                      {formatRupees(displayAmount ?? 0)}
                    </span>
                  </span>
                </div>
                <p aria-hidden="true" className="mt-1">
                  <span className="inline-block whitespace-nowrap rounded-lg bg-chai-accent-soft px-2 py-0.5 font-vpa text-[12px] text-chai-ink">
                    {intent.vpa}
                  </span>
                </p>
              </div>

              {/* Right: QR Code (about 130px) */}
              <div className="shrink-0">
                {qr !== null ? (
                  <QrCode
                    size="compact"
                    svgDataUrl={qr.svgDataUrl}
                    alt={strings.qrAlt(intent.vpa, formatRupees(payableRupees))}
                    showCaption={false}
                  />
                ) : (
                  <div className="flex h-[126px] w-[126px] items-center justify-center rounded-[12px] bg-chai-accent-soft p-2 text-center text-[12px] text-chai-muted">
                    {strings.qrUnavailable}
                  </div>
                )}
              </div>
            </div>

            {/* Buttons in one row under them: Copy UPI ID, Save QR, I've paid (36px high) */}
            <div className="mt-2 flex w-full gap-2">
              <button
                type="button"
                onClick={handleCopy}
                aria-live="polite"
                className="chai-interactive-hover inline-flex h-9 min-h-[36px] max-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-full border border-chai-line px-2 text-[12px] font-semibold text-chai-ink transition-colors hover:border-chai-accent hover:text-chai-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chai-accent"
              >
                {isCopied ? (
                  <>
                    <Check aria-hidden="true" className="h-3.5 w-3.5 text-chai-accent" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                    <span>{strings.copyUpiId}</span>
                  </>
                )}
              </button>

              {qr !== null && (
                <button
                  type="button"
                  onClick={handleSaveQr}
                  className="chai-interactive-hover inline-flex h-9 min-h-[36px] max-h-[36px] flex-1 items-center justify-center gap-1.5 rounded-full border border-chai-line px-2 text-[12px] font-semibold text-chai-ink transition-colors hover:border-chai-accent hover:text-chai-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chai-accent"
                >
                  <Download aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>{strings.qrDownload}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onPaidClick}
                className="chai-interactive-hover inline-flex h-9 min-h-[36px] max-h-[36px] flex-1 items-center justify-center rounded-full border border-chai-line/80 bg-transparent px-2 text-[12px] font-medium text-chai-muted transition-colors hover:border-chai-accent hover:text-chai-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chai-accent"
              >
                I&apos;ve paid
              </button>
            </div>

            {/* One scan line at 12px */}
            <p className="mt-1 text-center text-[12px] leading-tight text-chai-muted">
              {strings.qrCaption}
            </p>

            {/* Moved "This page can't confirm payments" note into QR block footer, one line at 12px */}
            <p className="mt-0.5 text-balance text-center text-[12px] leading-tight text-chai-muted">
              {strings.noConfirmationNote}
            </p>
          </div>
        </div>
      )}

      <Toast toast={toast} />
    </div>
  );
}
