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

  const aboutNode = (
    <div className="chai-rise flex flex-col gap-3" style={{ animationDelay: '0ms' }}>
      <Profile creator={creator} />
      {hasBio && creator.bio !== undefined && (
        <div className="max-w-[560px]">
          <Bio bio={creator.bio} />
        </div>
      )}
    </div>
  );

  const worksNode =
    works.length > 0 ? (
      <div className="chai-rise" style={{ animationDelay: '60ms' }}>
        <Works works={works} />
      </div>
    ) : null;

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
        <div className="mx-auto w-full max-w-[1240px] px-4 pt-4 pb-6 sm:pt-6 sm:pb-8">
          <ReferralNote />
          <PaymentCard config={config} about={aboutNode} works={worksNode} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
