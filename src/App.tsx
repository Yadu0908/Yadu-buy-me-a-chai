import type { JSX } from 'react';
import { Bio } from './components/Bio.tsx';
import { DemoBanner } from './components/DemoBanner.tsx';
import { Footer } from './components/Footer.tsx';
import { Masthead } from './components/Masthead.tsx';
import { PaymentCard } from './components/PaymentCard.tsx';
import { Profile } from './components/Profile.tsx';
import { ReferralNote } from './components/ReferralNote.tsx';
import { Works } from './components/Works.tsx';
import { config } from './config/config.ts';
import { strings } from './strings.ts';

export default function App(): JSX.Element {
  const { creator, works } = config;
  const hasBio = creator.bio !== undefined && creator.bio.trim().length > 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#chai-pay"
        className="sr-only rounded-full bg-chai-ink px-4 py-2 text-[14px] font-semibold text-chai-bg focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50"
      >
        {strings.skipToPayment}
      </a>

      {__CHAI_DEMO__ && <DemoBanner />}

      <Masthead />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:py-8">
          <ReferralNote />
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Top: the about block (avatar, name, tagline, bio, "Things I make"), compact */}
            <div
              className="chai-rise flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-8"
              style={{ animationDelay: '0ms' }}
            >
              <div className="flex-1 space-y-3">
                <Profile creator={creator} />
                {hasBio && creator.bio !== undefined && (
                  <div className="max-w-[560px]">
                    <Bio bio={creator.bio} />
                  </div>
                )}
              </div>
              {works.length > 0 && (
                <div className="w-full lg:max-w-[420px] lg:shrink-0">
                  <Works works={works} />
                </div>
              )}
            </div>

            {/* Below it: one full-width payment card laid out horizontally */}
            <div
              id="chai-pay"
              tabIndex={-1}
              className="chai-rise scroll-mt-4 outline-none"
              style={{ animationDelay: '60ms' }}
            >
              <PaymentCard config={config} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
