'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChildName } from '@/features/onboarding-profile';
import type { ConcernTag, Honorific } from '@/features/onboarding-profile';

const CONCERN_MESSAGES: Record<ConcernTag, { concern: string; solution: string }> = {
  emotion_regulation: {
    concern: '気持ちの切り替えが難しい',
    solution: '気持ちをコントロールする練習ができるゲームを用意しています。',
  },
  attention: {
    concern: '集中が続かない',
    solution: '注意力を高める練習ができるゲームを用意しています。',
  },
  communication: {
    concern: '言葉でのやりとりが難しい',
    solution: '言葉の理解と表現を練習できるゲームを用意しています。',
  },
  social: {
    concern: '友達や人との関わりが難しい',
    solution: '人の気持ちを理解する練習ができるゲームを用意しています。',
  },
  learning: {
    concern: '読み書きや学習が難しい',
    solution: '学習の基礎となる力を練習できるゲームを用意しています。',
  },
  motor: {
    concern: '手先の不器用さが気になる',
    solution: '手先の操作を練習できるゲームを用意しています。',
  },
  flexibility: {
    concern: '予定や変化への対応が難しい',
    solution: 'ルールの切り替えを練習できるゲームを用意しています。',
  },
  memory: {
    concern: '物事を覚えるのが難しい',
    solution: '記憶力を高める練習ができるゲームを用意しています。',
  },
};

interface ExpectationCardsProps {
  concernTags: ConcernTag[];
  childName: string;
  honorific: Honorific | '';
  dailyGoalMinutes: number;
  onComplete: () => void;
}

export function ExpectationCards({ concernTags, childName, honorific, dailyGoalMinutes, onComplete }: ExpectationCardsProps) {
  const [currentCard, setCurrentCard] = useState(0);
  const displayName = getChildName(childName, honorific);

  const primaryConcern = concernTags[0];
  const message = primaryConcern ? CONCERN_MESSAGES[primaryConcern] : null;

  const cards = [
    // Card 1: Concern-linked message
    <div key="card1" className="flex flex-col items-center gap-6 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-cosmic/20 flex items-center justify-center">
        <span className="text-3xl">{'\uD83C\uDF31'}</span>
      </div>
      {concernTags.length === 1 && message ? (
        <>
          <p className="text-base text-moon">
            「{message.concern}」と教えてくれましたね。
          </p>
          <p className="text-lg font-bold text-stardust">
            Manasでは、{message.solution}
          </p>
          <p className="text-base text-moon">
            一緒に取り組んでいきましょう。
          </p>
        </>
      ) : concernTags.length >= 2 ? (
        <>
          <p className="text-base text-moon">
            選んでくれた困りごとが、ゲームを通して少しずつ楽になっていきます。
          </p>
          <p className="text-lg font-bold text-stardust">
            {displayName}に合ったゲームを用意しています。
          </p>
          <p className="text-base text-moon">
            一緒に取り組んでいきましょう。
          </p>
        </>
      ) : (
        <p className="text-lg font-bold text-stardust">
          お子さまに合ったゲームを用意しています。<br />一緒に取り組んでいきましょう。
        </p>
      )}
    </div>,

    // Card 2: Goal-linked message
    <div key="card2" className="flex flex-col items-center gap-6 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-cosmic/20 flex items-center justify-center">
        <span className="text-3xl">{'\uD83D\uDCC5'}</span>
      </div>
      <p className="text-lg font-bold text-stardust">
        毎日{dailyGoalMinutes}分、続けてみてください。
      </p>
      <p className="text-base text-moon">
        {displayName}の成長の記録が、今日から始まりました。<br />
        続けるほど、得意なことと伸びしろが見えてきます。
      </p>
    </div>,
  ];

  return (
    <div className="flex flex-col items-center min-h-screen justify-center p-6" style={{ background: '#0D0D2B' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCard}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[400px]"
        >
          {cards[currentCard]}
        </motion.div>
      </AnimatePresence>

      {/* Dots indicator */}
      <div className="flex gap-2 mt-8">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentCard ? 'bg-cosmic w-6' : 'bg-galaxy-light'
            }`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => {
          if (currentCard < cards.length - 1) {
            setCurrentCard(currentCard + 1);
          } else {
            onComplete();
          }
        }}
        className="mt-8 w-full max-w-[400px] h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg active:scale-[0.98]"
      >
        {currentCard < cards.length - 1 ? 'つぎへ' : 'はじめましょう！'}
      </button>
    </div>
  );
}
