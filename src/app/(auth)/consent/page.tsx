'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StarField } from '@/components/map/StarField';
import Luna from '@/components/mascot/Luna';
import { CosmicButton } from '@/components/ui/CosmicButton';
import { ShieldIcon, MicroscopeIcon, HeartPulseIcon } from '@/components/icons';
import { isSupabaseEnabled, supabase } from '@/lib/supabase/client';
import { setLocalConsents, getLocalChildProfile, setLocalChildProfile } from '@/lib/local-profile';

export default function ConsentPage() {
  const router = useRouter();
  const [consents, setConsents] = useState({
    data_optimization: false,
    research_use: false,
    biometric: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = (key: keyof typeof consents) => {
    setConsents(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    if (!consents.data_optimization) return;
    setSaving(true);
    setError('');

    try {
      // Local/demo mode: persist consents locally and continue
      if (!isSupabaseEnabled) {
        setLocalConsents(consents);
        const local = getLocalChildProfile();
        if (local) {
          setLocalChildProfile({ ...local, consentFlags: consents });
        }
        router.push('/select');
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError('ログイン状態が確認できません');
        return;
      }

      const { error: updateError } = await supabase
        .from('children')
        .update({ consent_flags: consents })
        .eq('parent_user_id', userData.user.id);

      if (updateError) {
        setError('保存に失敗しました');
        console.error(updateError);
        return;
      }

      router.push('/select');
    } catch {
      setError('保存中にエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  const consentItems = [
    {
      key: 'data_optimization' as const,
      icon: <ShieldIcon size={20} style={{ color: '#6C3CE1' }} />,
      title: '個別最適化のためのデータ利用',
      required: true,
      description: 'ゲーム中の行動データ（反応時間、正答率など）を、お子さまに合った難易度調整やフィードバックのために使用します。データはお子さまの支援目的にのみ使用し、第三者への提供はしません。',
    },
    {
      key: 'research_use' as const,
      icon: <MicroscopeIcon size={20} style={{ color: '#4ECDC4' }} />,
      title: '研究利用',
      required: false,
      description: '匿名化したデータをサービス改善や学術研究に活用することに同意します。個人を特定できる情報は含まれません。後から撤回できます。',
    },
    {
      key: 'biometric' as const,
      icon: <HeartPulseIcon size={20} style={{ color: '#FFD43B' }} />,
      title: '生体情報の推定',
      required: false,
      description: 'カメラ映像からの心拍推定・注意度推定を行います。映像は端末内でのみ処理され、サーバーに送信されません。推定結果のみが保存されます。',
    },
  ];

  return (
    <div className="min-h-screen bg-space relative overflow-hidden flex items-center justify-center p-4">
      <StarField count={60} />

      <div className="relative z-10 w-full max-w-lg animate-fade-in-up">
        <div className="flex justify-center mb-4">
          <Luna expression="thinking" pose="standing" size={80} />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold" style={{ color: '#F0F0FF' }}>
            データの利用について
          </h1>
          <p className="text-sm mt-2" style={{ color: '#B8B8D0' }}>
            Manasはお子さまの学びを支援するためにデータを活用します。
          </p>
        </div>

        <div className="space-y-3">
          {consentItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleToggle(item.key)}
              className="w-full text-left p-5 rounded-2xl transition-all"
              style={{
                background: consents[item.key]
                  ? 'rgba(108, 60, 225, 0.15)'
                  : 'rgba(42, 42, 90, 0.4)',
                border: consents[item.key]
                  ? '2px solid rgba(108, 60, 225, 0.5)'
                  : '2px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                     style={{
                       background: consents[item.key] ? '#6C3CE1' : 'rgba(255,255,255,0.1)',
                       border: consents[item.key] ? 'none' : '2px solid rgba(255,255,255,0.2)',
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
                    <span className="font-medium" style={{ color: '#F0F0FF' }}>
                      {item.title}
                    </span>
                    {item.required && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'rgba(78, 205, 196, 0.2)', color: '#4ECDC4' }}>
                        必須
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#B8B8D0' }}>
                    {item.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-3.5 rounded-xl flex items-start gap-2"
             style={{ background: 'rgba(78, 205, 196, 0.1)' }}>
          <span className="text-sm" style={{ color: '#4ECDC4' }}>&#9432;</span>
          <p className="text-xs leading-relaxed" style={{ color: '#7EDDD6' }}>
            同意はいつでも設定画面から変更・撤回できます。
            データの削除やエクスポートもいつでも可能です。
          </p>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 p-3 rounded-xl text-sm"
               style={{ background: 'rgba(255, 212, 59, 0.15)', color: '#FFD43B' }}>
            <span>&#9888;</span>
            <span>{error}</span>
          </div>
        )}

        <CosmicButton
          variant="primary"
          size="lg"
          className="w-full mt-6"
          disabled={!consents.data_optimization || saving}
          onClick={handleSubmit}
        >
          {saving ? '保存中...' : '同意して次へ'}
        </CosmicButton>
      </div>
    </div>
  );
}
