import type { Metadata } from 'next';
import { Zen_Maru_Gothic } from 'next/font/google';
import './globals.css';

/**
 * Zen Maru Gothic: 丸ゴシック体
 * - 丸みのある字形が子どもに親しみやすい
 * - ディスレクシアの可読性研究で丸ゴシック体が推奨 (British Dyslexia Association)
 * - 日本語の可読性が高く、ひらがな中心のUIに最適
 */
const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Manas - 認知トレーニング',
  description: '子どもの認知機能を楽しくトレーニングするプラットフォーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={`${zenMaruGothic.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
