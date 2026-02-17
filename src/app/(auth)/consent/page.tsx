'use client';

import React, { useState } from 'react';
import { ShieldIcon, MicroscopeIcon, HeartPulseIcon, ClipboardIcon } from '@/components/icons';

export default function ConsentPage() {
  const [consents, setConsents] = useState({
    data_optimization: false,
    research_use: false,
    biometric: false,
  });

  const handleToggle = (key: keyof typeof consents) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    if (!consents.data_optimization) return;
    // TODO: Save consent flags to children record
    console.log('Consents:', consents);
  };

  const consentItems = [
    {
      key: 'data_optimization' as const,
      icon: <ShieldIcon size={20} style={{ color: 'var(--color-primary)' }} />,
      title: '個別最適化のためのデータ利用',
      required: true,
      description: 'ゲーム中の行動データ（反応時間、正答率など）を、お子さまに合った難易度調整やフィードバックのために使用します。データはお子さまの支援目的にのみ使用し、第三者への提供はしません。',
    },
    {
      key: 'research_use' as const,
      icon: <MicroscopeIcon size={20} style={{ color: 'var(--color-info)' }} />,
      title: '研究利用',
      required: false,
      description: '匿名化したデータをサービス改善や学術研究に活用することに同意します。個人を特定できる情報は含まれません。後から撤回できます。',
    },
    {
      key: 'biometric' as const,
      icon: <HeartPulseIcon size={20} style={{ color: 'var(--color-accent)' }} />,
      title: '生体情報の推定',
      required: false,
      description: '将来的にカメラ映像からの心拍推定等を行う場合があります。この機能は現在開発中であり、精度に限界があります。',
      warning: '現在この機能はご利用いただけません（開発中）',
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center p-4"
         style={{ background: 'linear-gradient(160deg, var(--color-bg) 0%, var(--color-primary-bg) 100%)' }}>
      <div className="w-full max-w-lg animate-fade-in-up">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
               style={{ background: 'var(--color-info-bg)' }}>
            <ClipboardIcon size={28} style={{ color: 'var(--color-info)' }} />
          </div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            データの利用について
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Manasはお子さまの学びを支援するためにデータを活用します。
            以下の内容をご確認のうえ、同意をお願いします。
          </p>
        </div>

        <div className="space-y-3">
          {consentItems.map((item, i) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleToggle(item.key)}
              className={`card card-hover w-full text-left p-5 animate-fade-in-up stagger-${i + 1}`}
              style={{
                borderColor: consents[item.key] ? 'var(--color-primary-light)' : undefined,
                background: consents[item.key] ? 'var(--color-primary-bg)' : undefined,
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                     style={{
                       background: consents[item.key] ? 'var(--color-primary)' : 'var(--color-border-light)',
                       border: consents[item.key] ? 'none' : '2px solid var(--color-border)',
                     }}>
                  {consents[item.key] && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center">{item.icon}</span>
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                      {item.title}
                    </span>
                    {item.required && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent)' }}>
                        必須
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {item.description}
                  </p>
                  {item.warning && (
                    <p className="text-xs mt-2 flex items-center gap-1"
                       style={{ color: 'var(--color-warning)' }}>
                      <span>&#9888;</span> {item.warning}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 p-3.5 rounded-xl flex items-start gap-2"
             style={{ background: 'var(--color-info-bg)' }}>
          <span className="text-sm">&#9432;</span>
          <p className="text-xs leading-relaxed" style={{ color: '#4A90D9' }}>
            同意はいつでも設定画面から変更・撤回できます。
            データの削除やエクスポートもいつでも可能です。
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!consents.data_optimization}
          className="btn btn-primary w-full py-3.5 text-base tap-target mt-6 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          同意して次へ
        </button>
      </div>
    </div>
  );
}
