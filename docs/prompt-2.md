プロンプト1でデザインシステムとUIリスキンが完了した前提で、
本プロンプトでは未実装のSupabase接続層をすべて繋ぎ込み、インカメラ生体データ取得を追加します。

========================================
A. 既存の未実装箇所（すべて対応する）
========================================

以下のTODOをすべて解消する:

| ファイル | 対応内容 |
|---------|---------|
| login/page.tsx | Supabase Auth ログイン接続 |
| signup/page.tsx | Supabase Auth 登録接続（※オンボーディングに統合済みなら、signup→onboardingへリダイレクト）|
| consent/page.tsx | 同意フラグの children レコードへの保存 |
| dashboard/page.tsx | Supabase からのリアルデータ取得（モック削除）|
| settings/page.tsx | 設定の Supabase 保存 |
| play/[gameId]/page.tsx | 認証後の子どもプロフィールからの年齢グループ取得 |
| stage/[stageId]/page.tsx | 同上 |

========================================
B. Supabase Auth 設定
========================================

【認証方式】
- メールアドレス＋パスワード認証
- メール確認: MVP段階では無効（フリクション低減）
- セッション管理: @supabase/ssr は未導入なので、@supabase/supabase-js のクライアントサイドセッションで管理

【認証ミドルウェア】
src/middleware.ts を新規作成（Next.js Middleware）:
```typescript
import { createMiddlewareClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res }); // ※既存のclient.tsの設定を参照

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = req.nextUrl.pathname;

  // 公開ルート
  const publicRoutes = ['/login', '/signup'];
  if (publicRoutes.includes(pathname)) {
    if (session) return NextResponse.redirect(new URL('/', req.url));
    return res;
  }

  // 未ログイン → ログインへ
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // オンボーディング未完了チェック
  if (pathname !== '/onboarding') {
    const { data: parent } = await supabase
      .from('children')
      .select('id')
      .eq('parent_id', session.user.id)
      .limit(1);

    // 子供レコードがなければオンボーディング未完了
    if (!parent || parent.length === 0) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
```

【ログイン画面改修 — src/app/(auth)/login/page.tsx】
- 宇宙テーマの背景（galaxy グラデーション + StarField）
- ルナが中央で手を振る
- メール＋パスワード入力
- 「ログイン」CosmicButton
- 「はじめてのかた」→ /onboarding へのリンク
- Supabase auth.signInWithPassword 接続
- エラー時: 「メールアドレスかパスワードがちがうよ」（宇宙テーマのエラー表示）

========================================
C. DBスキーマ拡張
========================================

既存の6テーブルに以下の列・テーブルを追加する。
既存テーブルの構造は壊さず、ALTER TABLE で列追加する形で対応。

【既存テーブルへの列追加】
```sql
-- children テーブルに追加
ALTER TABLE children ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE children ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE children ADD COLUMN IF NOT EXISTS avatar_id TEXT DEFAULT 'avatar_01';
ALTER TABLE children ADD COLUMN IF NOT EXISTS parent_role TEXT DEFAULT 'parent' CHECK (parent_role IN ('parent', 'caregiver'));
ALTER TABLE children ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;
ALTER TABLE children ADD COLUMN IF NOT EXISTS current_mood TEXT;
```

【新規テーブル追加】
```sql
-- 障害・特性プロフィール
CREATE TABLE IF NOT EXISTS child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID UNIQUE REFERENCES children(id) ON DELETE CASCADE,
  disability_types TEXT[] DEFAULT '{}',
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe', 'unspecified')),
  traits TEXT[] DEFAULT '{}',
  sensory_settings JSONB DEFAULT '{"volume": 0.7, "vibration": true, "brightness": 1.0, "animation_speed": "normal"}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_own" ON child_profiles FOR ALL USING (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
);

-- 生体データスナップショット
CREATE TABLE IF NOT EXISTS biometric_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  timestamp_ms BIGINT NOT NULL,
  pupil_diameter_left FLOAT,
  pupil_diameter_right FLOAT,
  heart_rate_bpm FLOAT,
  attention_score FLOAT CHECK (attention_score >= 0 AND attention_score <= 100),
  cognitive_load FLOAT CHECK (cognitive_load >= 0 AND cognitive_load <= 100),
  arousal_level FLOAT CHECK (arousal_level >= 0 AND arousal_level <= 100),
  face_detected BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE biometric_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "biometric_own" ON biometric_snapshots FOR ALL USING (
  session_id IN (
    SELECT id FROM sessions WHERE child_id IN (
      SELECT id FROM children WHERE parent_id = auth.uid()
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_biometric_session ON biometric_snapshots(session_id, timestamp_ms);

-- カメラ同意
CREATE TABLE IF NOT EXISTS camera_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID UNIQUE REFERENCES children(id) ON DELETE CASCADE,
  consented BOOLEAN DEFAULT FALSE,
  consented_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE camera_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consents_own" ON camera_consents FOR ALL USING (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
);

-- AIレポート（4軸認知スコア対応）
CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  report_type TEXT DEFAULT 'daily' CHECK (report_type IN ('daily', 'weekly', 'monthly')),
  summary TEXT NOT NULL,
  domain_scores JSONB NOT NULL, -- 15領域×4軸のスコアデータ（後述）
  strengths TEXT[],
  improvements TEXT[],
  suggestions TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(child_id, report_date, report_type)
);

ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_ai_own" ON ai_reports FOR ALL USING (
  child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
);
```

========================================
D. データ永続化の繋ぎ込み
========================================

【D-1. ゲームセッション保存】
既存の EventLogger.ts や session管理から、Supabaseへの保存を接続。

ゲームセッション開始時:
- sessions テーブルにレコード作成（status: 'active'）
- session_idをstateに保持

各トライアル完了時:
- trials テーブルにレコード挿入
- ローカルバッファリング（5試行ごとにバッチ挿入でパフォーマンス最適化）

セッション終了時:
- sessions テーブルを更新（score, accuracy, duration等）
- 未送信のtrialsを一括挿入
- metrics_daily を更新

【D-2. 設定の保存 — settings/page.tsx】
- child_profiles.sensory_settings をSupabaseに保存/読み込み
- 設定項目:
  - 効果音の音量（0-1, スライダー）
  - バイブレーション ON/OFF
  - 画面の明るさ補正（0.5-1.5）
  - アニメーション速度（slow / normal / fast）
  - カメラ使用 ON/OFF

【D-3. ダッシュボードのリアルデータ化 — dashboard/page.tsx】
- モックデータをすべて削除
- Supabaseから実データを取得:
  - sessions + trials → セッション履歴
  - metrics_daily → 認知スコア
  - ai_reports → レポート
  - biometric_snapshots → 集中度データ

========================================
E. インカメラ生体データ取得（新規機能）
========================================

【必要パッケージ】
```bash
npm install @tensorflow/tfjs @mediapipe/face_mesh
```

【カメラ同意フロー】
ゲーム初回起動時に保護者向け同意画面を表示。
ParentalGate通過後に表示（子供が操作しないように）。

同意画面テキスト（保護者向け）:
- 「お子さまの集中度をより正確に分析するためにカメラを使用します」
- 「映像は保存されません。数値データのみを記録します」
- 「カメラを使わなくてもすべてのゲームは利用できます」
- 2ボタン: 「カメラを使う」(primary) / 「使わない」(secondary)
- 結果 → camera_consents テーブルに保存

【技術実装】

src/features/camera/ を新規作成:

camera-manager.ts:
```typescript
// カメラ初期化
async function initCamera(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 30 } }
  });
}
// video要素はhidden（子供のUIには非表示）
// 解像度320x240（パフォーマンス優先）
```

pupil-tracker.ts:
- MediaPipe Face Mesh → 虹彩ランドマーク(468-477) → 瞳孔径推定
- サンプリング: 5fps
- 認知負荷算出: ベースラインからの瞳孔拡大率

rppg-estimator.ts:
- 額ROIのRGB信号 → CHROM法 → バンドパスフィルタ(0.7-4Hz) → 心拍BPM
- 30秒バッファで安定推定

biometric-aggregator.ts:
- 5秒ごとにデータ集約
- 算出指標:
  - attention_score (0-100): 瞳孔径変動 + 視線安定度
  - cognitive_load (0-100): タスク誘発散瞳反応
  - arousal_level (0-100): 心拍変動(HRV)
- Supabase biometric_snapshots へ挿入
- オフライン時はlocalStorageバッファ

【パフォーマンス対策】
- WebWorkerで Face Mesh 推論（メインスレッド非ブロック）
- 低スペック検出: 初回10フレーム処理時間>100ms → 3fpsに低下
- バッテリー20%以下 → 自動停止、ゲーム継続
- dynamic import: カメラ機能有効時のみTensorFlow.js読み込み

【ゲームとの連携】
既存のDDAEngineに生体データフィードを追加入力として接続:
- attention_score < 30 が3回連続 → 視覚刺激を大きく
- cognitive_load > 80 が3回連続 → 難易度を1段階下げ
- 調整は1試行あたり最大1段階（急激な変化を避ける）

DDAEngine.tsのインターフェースを拡張（既存を壊さない）:
```typescript
// 既存のDDAEngine.adjustDifficulty()に、オプショナルな引数を追加
interface BiometricInput {
  attentionScore?: number;
  cognitiveLoad?: number;
  arousalLevel?: number;
}
// adjust(trialResult, biometricInput?) のように、biometricがなくても動く設計
```

========================================
F. 実行指示
========================================

1. @supabase/ssr が未導入なら追加（またはクライアントサイドで対応）
2. src/middleware.ts 作成（認証・オンボーディングリダイレクト）
3. login/page.tsx を宇宙テーマで改修＋Supabase Auth接続
4. DBスキーマ拡張（マイグレーションSQL作成）
5. オンボーディング完了時のSupabase保存処理を実装
6. consent/page.tsx の同意フラグ保存を実装
7. ゲームセッション・トライアルのSupabase保存を実装
8. settings/page.tsx のSupabase保存を実装
9. dashboard/page.tsx のモックデータ→リアルデータ切り替え
10. @tensorflow/tfjs, @mediapipe/face_mesh インストール
11. src/features/camera/ 作成（camera-manager, pupil-tracker, rppg-estimator, biometric-aggregator）
12. カメラ同意フロー実装
13. DDAEngineに生体データ入力を拡張接続

完了後 vitest 実行。「プロンプト2完了」と報告。