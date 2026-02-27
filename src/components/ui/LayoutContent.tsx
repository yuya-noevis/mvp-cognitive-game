'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

/** Routes where the bottom nav is hidden (same as BottomNav) — no bottom padding needed */
const HIDDEN_ROUTES = ['/onboarding', '/login', '/consent', '/play/', '/stage/', '/game/'];

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isNavHidden = HIDDEN_ROUTES.some((r) => pathname?.startsWith(r));

  return (
    <div className={isNavHidden ? undefined : 'pb-20'}>
      {children}
    </div>
  );
}
