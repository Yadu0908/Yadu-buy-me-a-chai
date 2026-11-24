import type React from 'react';
import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { track } from '../analytics/index.ts';
import type { ChaiConfig } from '../config/schema.ts';
import { useUpiIntent } from '../hooks/useUpiIntent.ts';
import { formatRupees, parseRupees, sanitizeAmountInput } from '../lib/amount.ts';
import { MAX_NOTE_LENGTH } from '../lib/upi.ts';
import { strings } from '../strings.ts';
import { ChaiSticker } from './ChaiSticker.tsx';
import { PayZone } from './PayZone.tsx';

/** Emoji detection for the "some apps drop emojis" nudge. Non-global: no lastIndex state. */
const EMOJI_RE = /\p{Extended_Pictographic}/u;

/**
 * How long a custom amount must hold still before it counts as chosen
 * (docs/ANALYTICS.md).
 */
const CUSTOM_AMOUNT_DEBOUNCE_MS = 800;

type Selection = { readonly kind: 'preset'; readonly amount: number } | { readonly kind: 'custom' };

export interface PaymentCardProps {
  readonly config: ChaiConfig;
  readonly about?: React.ReactNode;
  readonly works?: React.ReactNode;
}

export function PaymentCard({ config, about, works }: PaymentCardProps): JSX.Element {
  const { creator, chai } = config;
  const presets = chai.presets;

  const [selection, setSelection] = useState<Selection>(() => ({
    kind: 'preset',
    amount: presets[0]?.amount ?? 1,
  }));
  const [customInput, setCustomInput] = useState('');
  const [message, setMessage] = useState('');
  const [pressedAmount, setPressedAmount] = useState<number | null>(null);
  const [hasPaid, setHasPaid] = useState(false);

  const amount = selection.kind === 'preset' ? selection.amount : parseRupees(customInput);

  const { intent, errors, qr } = useUpiIntent({
    vpa: creator.vpa,
    name: creator.name,
    amount,
    note: message,
    defaultNote: chai.defaultNote,
    softCapRupees: chai.maxAmountWarning,
  });

  const selectPreset = (presetAmount: number): void => {
    setPressedAmount(presetAmount);
    setTimeout(() => setPressedAmount(null), 160);
    setSelection({ kind: 'preset', amount: presetAmount });
    setCustomInput('');
    track({ name: 'amount_selected', amount: presetAmount, preset: true });
  };

  const customRupees = selection.kind === 'custom' ? parseRupees(customInput) : null;
  useEffect(() => {
    if (customRupees === null) return;
    const timer = setTimeout(() => {
      track({ name: 'amount_selected', amount: customRupees, preset: false });
    }, CUSTOM_AMOUNT_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [customRupees]);

  const handleCustomChange = (raw: string): void => {
    setCustomInput(sanitizeAmountInput(raw));
    setSelection({ kind: 'custom' });
  };

  const handleMessageChange = (raw: string): void => {
    const points = Array.from(raw);
    setMessage(points.length > MAX_NOTE_LENGTH ? points.slice(0, MAX_NOTE_LENGTH).join('') : raw);
  };

  const messageLength = Array.from(message).length;

  const activePresetIndex =
    selection.kind === 'preset' ? presets.findIndex((p) => p.amount === selection.amount) : -1;

  return (
    <div className="grid w-full grid-cols-1 items-start gap-4 lg:grid-cols-2 lg:gap-8">
      {/* ── Left Column: About, Works (aligned with Controls Card top) ──── */}
      <div className="contents lg:col-start-1 lg:row-start-1 lg:flex lg:flex-col lg:gap-4">
        {about && <div className="order-1">{about}</div>}
        {works && <div className="order-2">{works}</div>}
      </div>

      {/* ── Right Column: Controls Card + 12px gap + QR Block ──────────── */}
      <div className="contents lg:col-start-2 lg:row-start-1 lg:flex lg:flex-col lg:gap-3">
        {/* Controls Card: 24px padding, 12px gaps */}
        <section
          id="chai-pay"
          tabIndex={-1}
          aria-labelledby="chai-payment-heading"
          className="relative order-3 w-full scroll-mt-4 rounded-[20px] border border-chai-line bg-chai-surface p-6 shadow-sm outline-none"
        >
          {/* Desktop Sticker: Top right corner, rising into top padding space */}
          <ChaiSticker
            size="desktop"
            className="pointer-events-none absolute -top-[20px] right-4 z-10 hidden lg:flex"
          />

          <div className="flex flex-col gap-3">
            <div className="min-h-[50px] pr-[75px]">
              <p className="text-balance text-[11px] font-semibold uppercase tracking-[0.16em] text-chai-accent">
                {strings.disclosure}
              </p>
              <h2
                id="chai-payment-heading"
                className="mt-0.5 font-display text-[24px] font-bold leading-tight tracking-[-0.02em] text-chai-ink sm:text-[26px]"
              >
                {strings.paymentCardTitle}
              </h2>
            </div>

            {/* ── Amount Chips (P0.3) ── */}
            <fieldset className="border-0 p-0">
              <legend className="sr-only">{strings.amountGroupLabel}</legend>
              <div className="relative flex items-stretch gap-2">
                {activePresetIndex >= 0 && (
                  <div
                    className="pointer-events-none absolute inset-y-0 rounded-[14px] ring-2 ring-chai-accent transition-transform duration-160 ease-out"
                    style={{
                      width: `calc((100% - ${(presets.length - 1) * 8}px) / ${presets.length})`,
                      transform: `translateX(calc(${activePresetIndex} * (100% + 8px)))`,
                    }}
                    aria-hidden="true"
                  />
                )}
                {presets.map((preset) => {
                  const checked = selection.kind === 'preset' && selection.amount === preset.amount;
                  const isPressed = pressedAmount === preset.amount;
                  return (
                    <label key={preset.amount} className="flex-1">
                      <input
                        type="radio"
                        name="chai-amount"
                        className="peer sr-only"
                        value={preset.amount}
                        checked={checked}
                        onChange={() => selectPreset(preset.amount)}
                        aria-label={strings.presetChipLabel(
                          preset.label,
                          formatRupees(preset.amount),
                        )}
                      />
                      <span
                        className={`chai-interactive-hover flex h-full min-h-[52px] cursor-pointer flex-col items-center justify-center rounded-[14px] border border-chai-line px-2 py-1.5 text-chai-ink transition-colors hover:border-chai-line-strong ${
                          checked
                            ? 'border-chai-accent bg-chai-accent-soft font-medium shadow-[0_4px_12px_-4px_rgb(120_60_20/0.25)]'
                            : 'bg-chai-surface'
                        } ${isPressed ? 'chip-pressed' : ''} peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-chai-accent`}
                      >
                        {preset.emoji !== undefined && (
                          <span
                            aria-hidden="true"
                            className="text-[13px] leading-none tracking-tighter"
                          >
                            {preset.emoji}
                          </span>
                        )}
                        <span
                          aria-hidden="true"
                          className="mt-0.5 flex flex-1 items-center text-balance text-center text-[11px] leading-tight text-chai-muted"
                        >
                          {preset.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className="chai-numeral mt-0.5 text-[13px] font-bold leading-none text-chai-ink"
                        >
                          {strings.presetChipPrice(formatRupees(preset.amount))}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* ── Custom Amount & Message: one row, two columns ── */}
            {(chai.allowCustomAmount || chai.allowDonorMessage) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {chai.allowCustomAmount && (
                  <div>
                    <label
                      htmlFor="chai-custom-amount"
                      className="block text-[12px] font-medium text-chai-muted"
                    >
                      {strings.customAmountLabel}
                    </label>
                    <div className="mt-1 flex h-[44px] min-h-[44px] items-center gap-1.5 rounded-[12px] border border-chai-line px-3 focus-within:border-chai-accent">
                      <span
                        aria-hidden="true"
                        className="text-[14px] font-semibold text-chai-muted"
                      >
                        ₹
                      </span>
                      <input
                        id="chai-custom-amount"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="off"
                        placeholder={strings.customAmountPlaceholder}
                        value={customInput}
                        onChange={(event) => handleCustomChange(event.target.value)}
                        className="h-full w-full bg-transparent text-[14px] font-semibold outline-none placeholder:font-normal placeholder:text-chai-muted"
                      />
                    </div>
                    {intent?.exceedsSoftCap === true && (
                      <p className="mt-1 text-[11px] text-chai-warn">
                        {strings.largeAmountWarning}
                      </p>
                    )}
                  </div>
                )}

                {chai.allowDonorMessage && (
                  <div>
                    <div className="flex items-baseline justify-between gap-1">
                      <label
                        htmlFor="chai-message"
                        className="block truncate text-[12px] font-medium text-chai-muted"
                      >
                        {strings.messageLabel}
                      </label>
                      <span aria-hidden="true" className="chai-numeral text-[11px] text-chai-muted">
                        {strings.messageCounter(messageLength, MAX_NOTE_LENGTH)}
                      </span>
                    </div>
                    <input
                      id="chai-message"
                      type="text"
                      autoComplete="off"
                      aria-describedby="chai-message-hint"
                      placeholder={chai.defaultNote}
                      value={message}
                      onChange={(event) => handleMessageChange(event.target.value)}
                      className="mt-1 flex h-[44px] min-h-[44px] w-full items-center rounded-[12px] border border-chai-line bg-transparent px-3 text-[14px] outline-none placeholder:text-chai-muted focus:border-chai-accent"
                    />
                    {EMOJI_RE.test(message) && (
                      <p className="mt-1 text-[11px] text-chai-warn">
                        {strings.messageEmojiWarning}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Compact QR Block directly below controls card */}
        <div className="order-4 w-full">
          <PayZone
            intent={intent}
            errors={errors}
            qr={qr}
            onPaidClick={() => setHasPaid(true)}
            hasPaid={hasPaid}
            onBackToPay={() => setHasPaid(false)}
          />
        </div>
      </div>

      {/* ── Mobile Sticker: last in single-column order (smaller, centered) ── */}
      <div className="order-5 flex w-full justify-center py-2 lg:hidden">
        <ChaiSticker size="mobile" />
      </div>
    </div>
  );
}
