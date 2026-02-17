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
 * BottomNav - 宇宙テーマ 下部ナビゲーション
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-around py-2 px-1"
         style={{
           background: 'rgba(26, 26, 64, 0.95)',
           backdropFilter: 'blur(8px)',
           borderTop: '1px solid rgba(108, 60, 225, 0.15)',
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
              background: isActive ? 'rgba(108, 60, 225, 0.2)' : 'transparent',
            }}
          >
            <Icon
              size={24}
              style={{
                color: isActive ? '#8B5CF6' : '#8888AA',
              }}
            />
            <span className="text-[10px] font-medium"
                  style={{
                    color: isActive ? '#8B5CF6' : '#8888AA',
                  }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
