'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeFilledIcon, PuzzleIcon, ChestIcon, HeartIcon, MoreDotsIcon } from '@/components/icons';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/select', icon: HomeFilledIcon, label: 'ホーム' },
  { href: '/select?tab=free', icon: PuzzleIcon, label: 'スキル' },
  { href: '/select', icon: ChestIcon, label: 'ショップ' },
  { href: '/dashboard', icon: HeartIcon, label: 'プロフィール' },
  { href: '/settings', icon: MoreDotsIcon, label: 'その他' },
];

/**
 * BottomNav - Duolingo風下部ナビゲーション
 * 5つのアイコンタブ、選択中はハイライト
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-around py-2 px-1"
         style={{
           background: 'var(--duo-nav-bg, var(--color-surface))',
           borderTop: '1px solid var(--duo-nav-border, var(--color-border-light))',
         }}>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href === '/select' && pathname?.startsWith('/select'));
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl tap-interactive transition-all"
            style={{
              background: isActive ? 'var(--duo-node-active, var(--color-primary))' + '20' : 'transparent',
            }}
          >
            <Icon
              size={24}
              style={{
                color: isActive ? 'var(--duo-node-active, var(--color-primary))' : 'var(--color-text-muted)',
              }}
            />
            <span className="text-[10px] font-medium"
                  style={{
                    color: isActive ? 'var(--duo-node-active, var(--color-primary))' : 'var(--color-text-muted)',
                  }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
