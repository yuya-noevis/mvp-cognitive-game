import type { Metadata, Viewport } from 'next';
import { M_PLUS_Rounded_1c } from 'next/font/google';
import { BottomNav } from '@/components/ui/BottomNav';
import { LayoutContent } from '@/components/ui/LayoutContent';
import './globals.css';

const roundedMplus = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Manas - 認知トレーニング',
  description: '子どもの認知機能を楽しくトレーニングするプラットフォーム',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${roundedMplus.className} antialiased`}>
        <div className="mx-auto max-w-[430px] min-h-dvh relative bg-deep-space">
          <LayoutContent>{children}</LayoutContent>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
