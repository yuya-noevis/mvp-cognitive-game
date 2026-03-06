'use client';

import { useState } from 'react';
import Mogura from '@/components/mascot/Mogura';
import { StickyNextButton } from '../../components/StickyNextButton';
import { getChildName } from '@/features/onboarding-profile';
import type { OnboardingV2Data } from '../types';
import type { SpeechLevel, TabletOperation, AuditorySensitivity, Honorific } from '@/features/onboarding-profile';

/* ============================================================
   Screen 1: Age (direct selection 3-18) + Name + Honorific
   ============================================================ */

const AGES = Array.from({ length: 16 }, (_, i) => i + 3); // 3-18

const HONORIFIC_OPTIONS: { label: string; value: Honorific }[] = [
  { label: '〜くん', value: 'kun' },
  { label: '〜ちゃん', value: 'chan' },
  { label: '名前で呼ぶ', value: 'name_only' },
];

export function AgeNameScreen({
  data,
  onUpdate,
  onNext,
}: {
  data: OnboardingV2Data;
  onUpdate: (partial: Partial<OnboardingV2Data>) => void;
  onNext: () => void;
}) {
  const [skipName, setSkipName] = useState(false);
  const childDisplay = getChildName(data.childName, data.honorific);

  return (
    <div className="flex flex-col items-center gap-5">
      <Mogura expression="happy" size={120} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">お子さまの年齢をおしえてください</h2>
        <p className="text-sm text-moon mt-1">お子さまに合った体験をお届けします</p>
      </div>

      {/* Age grid */}
      <div className="w-full grid grid-cols-4 gap-2">
        {AGES.map((age) => (
          <button
            key={age}
            type="button"
            onClick={() => onUpdate({ age })}
            className={`h-12 rounded-xl text-base font-bold transition-all ${
              data.age === age
                ? 'bg-cosmic text-white shadow-md'
                : 'bg-galaxy-light text-moon hover:bg-galaxy-light/80'
            }`}
          >
            {age}歳
          </button>
        ))}
      </div>

      {/* Name input */}
      <div className="w-full mt-2">
        <label className="text-sm text-moon mb-2 block">
          おなまえ（ニックネーム）
          <span className="text-moon/50 ml-1">任意</span>
        </label>
        <input
          type="text"
          value={data.childName}
          onChange={(e) => onUpdate({ childName: e.target.value })}
          placeholder="例: たろう"
          className="w-full h-14 px-4 rounded-xl text-lg bg-galaxy-light text-stardust outline-none border-2 border-transparent focus:border-cosmic placeholder:text-moon text-center"
        />
        {!data.childName && !skipName && (
          <button
            type="button"
            onClick={() => setSkipName(true)}
            className="mt-2 text-sm text-moon/60 underline"
          >
            あとで決める
          </button>
        )}
      </div>

      {/* Honorific selection - only show when name is entered */}
      {data.childName && (
        <div className="w-full">
          <label className="text-sm text-moon mb-2 block">呼び方</label>
          <div className="flex gap-2">
            {HONORIFIC_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate({ honorific: opt.value })}
                className={`flex-1 h-12 rounded-xl text-sm font-bold transition-all ${
                  data.honorific === opt.value
                    ? 'bg-cosmic text-white shadow-md'
                    : 'bg-galaxy-light text-moon hover:bg-galaxy-light/80'
                }`}
              >
                {opt.value === 'name_only' ? opt.label : `${data.childName}${opt.value === 'kun' ? 'くん' : 'ちゃん'}`}
              </button>
            ))}
          </div>
          {data.honorific && (
            <p className="text-sm text-center mt-2" style={{ color: '#4ECDC4' }}>
              {childDisplay}とお呼びしますね
            </p>
          )}
        </div>
      )}

      <StickyNextButton
        label="つぎへ"
        disabled={data.age === null}
        onClick={onNext}
      />
    </div>
  );
}

/* ============================================================
   Screen 2: Speech Level (5 choices with icons)
   ============================================================ */

const SPEECH_OPTIONS: { label: string; value: SpeechLevel; icon: string }[] = [
  { label: 'まだ言葉は出ていない', value: 'nonverbal', icon: '\uD83D\uDD07' },
  { label: '単語をいくつか話す（「ジュース」「ママ」など）', value: 'single_word', icon: '\uD83D\uDCAC' },
  { label: '2語で話す（「ジュースちょうだい」など）', value: 'two_word', icon: '\uD83D\uDCAC\uD83D\uDCAC' },
  { label: '短い文で話す（「おなかすいた」「あれとって」）', value: 'short_sentence', icon: '\uD83D\uDDE3\uFE0F' },
  { label: '会話ができる（質問に答えたり話しかけたりする）', value: 'conversational', icon: '\uD83D\uDDE3\uFE0F\uD83D\uDDE3\uFE0F' },
];

export function SpeechLevelScreen({
  data,
  onUpdate,
  onNext,
}: {
  data: OnboardingV2Data;
  onUpdate: (partial: Partial<OnboardingV2Data>) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      <Mogura expression="encouraging" size={120} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">
          お子さまの普段の話し方に<br />一番近いものを選んでください
        </h2>
      </div>

      <div className="w-full flex flex-col rounded-2xl overflow-hidden border border-galaxy-light">
        {SPEECH_OPTIONS.map((opt, i) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onUpdate({ speechLevel: opt.value })}
            className={`w-full flex items-center gap-3 px-4 py-4 transition-all ${
              i > 0 ? 'border-t border-galaxy-light' : ''
            } ${
              data.speechLevel === opt.value ? 'bg-cosmic/20' : ''
            }`}
          >
            <span className="text-2xl flex-shrink-0">{opt.icon}</span>
            <span className="text-base text-stardust flex-1 text-left">{opt.label}</span>
            {data.speechLevel === opt.value && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#6C3CE1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs text-moon/60 text-center">
        迷ったら下の方を選んでください
      </p>

      <StickyNextButton
        label="つぎへ"
        disabled={!data.speechLevel}
        onClick={onNext}
      />
    </div>
  );
}

/* ============================================================
   Screen 3: Tablet Operation (3 choices)
   ============================================================ */

const TABLET_OPTIONS: { label: string; value: TabletOperation; icon: string }[] = [
  { label: '自分でできる', value: 'independent', icon: '\uD83D\uDC4D' },
  { label: '手を添えてあげればできる', value: 'assisted', icon: '\uD83E\uDD1D' },
  { label: 'まだ難しい', value: 'not_yet', icon: '\uD83D\uDE4F' },
];

export function TabletOperationScreen({
  data,
  onUpdate,
  onNext,
}: {
  data: OnboardingV2Data;
  onUpdate: (partial: Partial<OnboardingV2Data>) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      <Mogura expression="pointing" size={120} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">
          お子さまはタブレットや画面を<br />指でタッチして操作できますか？
        </h2>
      </div>

      <div className="w-full flex flex-col gap-3">
        {TABLET_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onUpdate({ tabletOperation: opt.value })}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all border ${
              data.tabletOperation === opt.value
                ? 'bg-cosmic/20 border-cosmic/40'
                : 'bg-galaxy-light/50 border-galaxy-light'
            }`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="text-base text-stardust flex-1 text-left">{opt.label}</span>
            {data.tabletOperation === opt.value && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#6C3CE1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>

      {(data.tabletOperation === 'not_yet' || data.tabletOperation === 'assisted') && (
        <div
          className="w-full rounded-xl px-4 py-3 text-center"
          style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.2)' }}
        >
          <p className="text-sm text-moon">
            {data.tabletOperation === 'not_yet'
              ? '保護者の方が一緒に操作してあげてください'
              : '保護者の方のサポートをおすすめします'}
          </p>
        </div>
      )}

      <StickyNextButton
        label="つぎへ"
        disabled={!data.tabletOperation}
        onClick={onNext}
      />
    </div>
  );
}

/* ============================================================
   Screen 4: Auditory Sensitivity (4 choices)
   ============================================================ */

const AUDITORY_OPTIONS: { label: string; value: AuditorySensitivity; icon: string }[] = [
  { label: 'とても嫌がる', value: 'severe', icon: '\uD83D\uDE31' },
  { label: '少し嫌がる', value: 'mild', icon: '\uD83D\uDE1F' },
  { label: '特に気にしない', value: 'none', icon: '\uD83D\uDE0A' },
  { label: 'むしろ音が好き', value: 'enjoys', icon: '\uD83C\uDFB5' },
];

export function AuditorySensitivityScreen({
  data,
  onUpdate,
  onNext,
}: {
  data: OnboardingV2Data;
  onUpdate: (partial: Partial<OnboardingV2Data>) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5">
      <Mogura expression="happy" size={120} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">
          お子さまは、大きな音や<br />突然の音を嫌がりますか？
        </h2>
        <p className="text-sm text-moon mt-1">
          掃除機・ブザー・花火など
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        {AUDITORY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onUpdate({ auditorySensitivity: opt.value })}
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all border ${
              data.auditorySensitivity === opt.value
                ? 'bg-cosmic/20 border-cosmic/40'
                : 'bg-galaxy-light/50 border-galaxy-light'
            }`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <span className="text-base text-stardust flex-1 text-left">{opt.label}</span>
            {data.auditorySensitivity === opt.value && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="#6C3CE1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs text-moon/60">
          回答すると音の設定を自動で調整します
        </p>
        <p className="text-xs text-moon/40">
          あとで設定画面から変更できます
        </p>
      </div>

      <StickyNextButton
        label="つぎへ"
        disabled={!data.auditorySensitivity}
        onClick={onNext}
      />
    </div>
  );
}

/* ============================================================
   Screen 5: Diagnosis / Traits (multi-select + ID severity)
   ============================================================ */

const DIAGNOSIS_OPTIONS: { label: string; value: string; icon: string }[] = [
  { label: 'ASD（自閉スペクトラム症）', value: 'asd', icon: '\uD83D\uDD35' },
  { label: 'ADHD（注意欠如・多動症）', value: 'adhd', icon: '\uD83D\uDFE1' },
  { label: '知的障害・発達の遅れ', value: 'id', icon: '\uD83D\uDFE3' },
  { label: '学習障害（LD・読み書き等）', value: 'ld', icon: '\uD83D\uDFE2' },
  { label: 'ダウン症', value: 'down_syndrome', icon: '\uD83D\uDD34' },
  { label: 'グレーゾーン・未診断', value: 'undiagnosed', icon: '\u26AA' },
  { label: 'まだわからない・検査中', value: 'unknown', icon: '\u2753' },
];

const ID_SEVERITY_OPTIONS: { label: string; value: string }[] = [
  { label: '軽度（日常会話ができる）', value: 'id_mild' },
  { label: '中度（簡単な言葉は理解できる）', value: 'id_moderate' },
  { label: '重度（言葉の理解が難しい）', value: 'id_severe' },
  { label: 'わからない', value: 'id_unknown' },
];

export function DiagnosisScreen({
  data,
  onUpdate,
  onNext,
}: {
  data: OnboardingV2Data;
  onUpdate: (partial: Partial<OnboardingV2Data>) => void;
  onNext: () => void;
}) {
  const toggleDiagnosis = (tag: string) => {
    const current = data.diagnosisTags;
    if (current.includes(tag)) {
      const next = current.filter((t) => t !== tag);
      onUpdate({
        diagnosisTags: next,
        ...(tag === 'id' ? { idSeverity: '' } : {}),
      });
    } else {
      onUpdate({ diagnosisTags: [...current, tag] });
    }
  };

  const showIdSeverity = data.diagnosisTags.includes('id');

  return (
    <div className="flex flex-col items-center gap-4">
      <Mogura expression="encouraging" size={100} />

      <div className="text-center">
        <h2 className="text-lg font-bold text-stardust">
          お子さまについて、あてはまるものを<br />選んでください
        </h2>
        <p className="text-sm text-moon mt-1">複数選択可・任意</p>
      </div>

      <div className="w-full flex flex-col gap-2">
        {DIAGNOSIS_OPTIONS.map((opt) => {
          const selected = data.diagnosisTags.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggleDiagnosis(opt.value)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border text-left ${
                selected
                  ? 'bg-cosmic/20 border-cosmic/40'
                  : 'bg-galaxy-light/50 border-galaxy-light'
              }`}
            >
              <span className="text-xl flex-shrink-0">{opt.icon}</span>
              <span className="text-sm text-stardust flex-1">{opt.label}</span>
              {selected && (
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                  <path d="M4 10l4 4 8-8" stroke="#6C3CE1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* ID severity sub-question */}
      {showIdSeverity && (
        <div className="w-full">
          <p className="text-sm font-bold text-stardust mb-2">
            どの程度の遅れがありますか？
          </p>
          <div className="flex flex-col gap-2">
            {ID_SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate({ idSeverity: opt.value })}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all border text-left ${
                  data.idSeverity === opt.value
                    ? 'bg-cosmic/20 border-cosmic/40'
                    : 'bg-galaxy-light/50 border-galaxy-light'
                }`}
              >
                <span className="text-sm text-stardust flex-1">{opt.label}</span>
                {data.idSeverity === opt.value && (
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                    <path d="M4 10l4 4 8-8" stroke="#6C3CE1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <StickyNextButton
        label="つぎへ"
        disabled={showIdSeverity && !data.idSeverity}
        onClick={onNext}
      />

      <button
        type="button"
        onClick={() => {
          onUpdate({ diagnosisTags: [], idSeverity: '' });
          onNext();
        }}
        className="text-sm text-moon/60 underline"
      >
        わからない・スキップ
      </button>
    </div>
  );
}
