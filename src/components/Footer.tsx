import type { JSX } from 'react';

export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-chai-line">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col items-center px-4 py-8 text-center text-chai-muted">
        <p className="text-[12px] text-chai-muted">Made with love by Yadu</p>
      </div>
    </footer>
  );
}
