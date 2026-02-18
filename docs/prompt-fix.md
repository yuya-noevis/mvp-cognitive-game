# Manas UI/UX改修プロンプト（最終版）
## docs/prompt-fix.md として保存 → CCに読み込ませる

```
あなたはManas（マナス）の改修を担当するシニアフルスタックエンジニア兼UIデザイナーです。

画像アセットが public/assets/ に配置済みです。
本プロンプトでは以下を行います:
1. SVGキャラ/絵文字アイコンを全てPNG画像に差し替え
2. オンボーディングの全面修正（大人向け設計、障害細分化、施設選択追加）
3. ホーム画面を建物マップUIに改修
4. 全画面をスマートフォン最適化
5. GameShell・フィードバックの画像ベース化
6. デザイン品質の底上げ

⚠️ 以下は一切変更しないでください:
- src/features/dda/ — 難易度調整
- src/features/game-engine/TrialEngine.ts — トライアル管理
- src/features/logging/ — ログ
- src/features/metrics/ — メトリクス
- src/features/safety/ — 安全機構
- src/features/stage-system/ — ステージ
- src/features/scoring/ — 4軸スコア
- src/games/*/config.ts — ゲーム設定
- Supabase接続ロジック

========================================
A. スマートフォンファースト設計（全画面共通）
========================================

このアプリはスマートフォン（縦画面、幅375-430px）で使用される前提。
すべての画面で以下を厳守:

【ビューポート】
- max-width: 430px を基準にデザイン
- 中央寄せ（mx-auto）、外側はgalaxy色
- min-h-dvh（dynamic viewport height）
- overflow-x: hidden（横スクロールはマップ部分のみ許可）

【セーフエリア】
- padding-top: env(safe-area-inset-top)
- padding-bottom: env(safe-area-inset-bottom)
- ノッチ・ホームバー領域を考慮

【タッチ操作】
- touch-action: manipulation（ダブルタップズーム防止）
- タップターゲット: 最小48px × 48px（子供向け画面は56px）
- -webkit-tap-highlight-color: transparent

【レイアウト原則】
- 画面端からの余白: 20-24px（px-5 or px-6）
- 要素間の余白: 16px以上
- フォント: 最小14px（保護者画面）、最小20px（子供向け画面）
- ボタン: 横幅100%（w-full）が基本。横並びは最大2つまで
- カード: w-full、横並びにしない（縦に積む）
- 入力フィールド: h-12（48px）以上、text-base（16px）以上
  ※ iOSで16px未満のinputはオートズームが発生するため絶対に16px以上

【フォント】
Google Fonts "Rounded Mplus 1c" を使用（既に設定済みの場合はそのまま）。
なければ layout.tsx で読み込み追加。

========================================
B. 画像アセットへの全面切り替え
========================================

【禁止事項】
- macOSの絵文字（🎯⚡🧠👁️🤚等）を一切使わない
- システムフォントのアイコンを使わない
- SVGで生成されたキャラクターを使わない

すべてpublic/assets/ のPNG画像、
またはTailwind CSSで作るシンプルな図形に置き換える。

【マスコットコンポーネント】
既存の ManasCharacter.tsx / Luna.tsx を以下に置き換え:

```tsx
// src/components/mascot/Mogura.tsx
'use client';
import Image from 'next/image';

type Expression = 'happy' | 'excited' | 'encouraging' | 'surprised' | 'sleepy' | 'clapping' | 'pointing' | 'waving';

interface MoguraProps {
  expression?: Expression;
  size?: number;
  className?: string;
}

export default function Mogura({ expression = 'happy', size = 120, className = '' }: MoguraProps) {
  return (
    <Image
      src={`/assets/characters/mogura/mogura-${expression}.png`}
      alt="Mogu"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}
```

既存の ManasCharacter / Luna を使っている全箇所を Mogura に差し替え。
後方互換:
```tsx
// src/components/mascot/ManasCharacter.tsx
export { default } from './Mogura';
```

【配置済みアセット】
```
public/assets/
├── characters/mogura/    mogura-{happy,excited,encouraging,surprised,sleepy,clapping,pointing,waving}.png
├── buildings/            building-{hikari,kokoro,hirameki,kankaku,kotoba}.png
├── backgrounds/          bg-{home,onboarding}.png
├── game/                 stimulus-{star,rock,rocket,ufo,planet,alien,sun,shooting-star,comet,moon}.png, card-back.png
├── effects/              effect-{star,heart,confetti,sparkle}.png
└── rocket.png
```

========================================
C. オンボーディング全面修正
========================================

【設計原則】
- 操作者は大人（保護者・支援者）。普通の日本語表記。ひらがなオンリー不要
- 1画面1テーマ（認知負荷を下げる）
- スキップボタンは設置しない（任意項目は空欄で「次へ」可能）
- アバター選択はMVPでは削除
- 全7ステップ

【共通UI】
- 背景: bg-onboarding.png（background-size:cover） + 半透明オーバーレイ（bg-galaxy/60）
- 上部: CosmicProgressBar（7ステップ分）
- ステップ遷移: x方向スライドアニメーション
- 「次へ」ボタン: 画面下部固定（sticky bottom-0）、w-full、h-12、cosmic色
- 「戻る」: 左上に矢印アイコン（stardust色、24px）
- スマホ幅: max-w-[430px] mx-auto px-5

--- ステップ1: アカウント作成 ---

中央: Mogura(waving) size={100}
見出し: 「アカウントを作成」（text-xl font-bold text-stardust）

入力:
- メールアドレス（type="email", h-12, rounded-xl, text-base, bg-galaxy-light, text-stardust, placeholder: "メールアドレス"）
- パスワード（type="password", 同上, 右端に目アイコンで表示切替, placeholder: "パスワード（8文字以上）"）
- バリデーション: メール形式 + パスワード8文字以上
- エラー表示: フィールド下に赤テキスト（14px）

下部: 「すでにアカウントをお持ちの方は ログイン」リンク（comet色、14px）

「次へ」タップ → Supabase auth.signUp 実行

--- ステップ2: あなたの役割 ---

見出し: 「あなたのお立場を教えてください」

2枚のカード（縦並び、各 w-full h-auto py-6）:
  カード1「保護者」:
    - 左にオリジナルアイコン（家の形をCSSまたはシンプルSVGで。24px、cosmic色）
    - 右にテキスト「保護者」（text-lg font-semibold）
    - 下に小さな説明「お子さまの保護者の方」（text-sm, moon色）

  カード2「支援者・関係者」:
    - 左にオリジナルアイコン（ハート形。24px、cosmic色）
    - 右にテキスト「支援者・関係者」
    - 下に「療育・教育関係者の方」

カードスタイル:
  - 未選択: bg-galaxy-light, border border-transparent, rounded-2xl
  - 選択時: bg-galaxy-light, border-2 border-cosmic, rounded-2xl, shadow-lg, scale-[1.02] transition
  - カード間の余白: 16px

--- ステップ3: お子さまの情報 ---

見出し: 「お子さまの情報」

フィールド1 — 名前:
  ラベル「お名前」（text-sm font-medium text-stardust mb-1）
  input（h-12, rounded-xl, text-base, placeholder: "例: たろう"）

フィールド2 — 生年月日:
  ラベル「生年月日」
  カレンダーピッカー（自作またはライブラリ）:
    - 年月をヘッダーで選択（< 2022年3月 >）
    - 日付をグリッド表示（7列カレンダー）
    - 選択した日付がcosmic色で丸くハイライト
    - 年の範囲: 2019-2023
    - スマホ幅に収まるサイズ
    - 選択後、下にフォーマット表示:「2022年3月15日」
  ※ ネイティブのdate inputは使わない（デバイスごとにUIが違うため）
  ※ react-day-picker等のライブラリを使ってもよい

--- ステップ4: 診断・障害の種類 ---

見出し: 「診断・障害について教えてください」
サブ: 「複数選択できます。あとから変更も可能です。」（text-sm text-moon mt-1）

カテゴリ分けされたトグルチップ（複数選択可、スクロール可能）:
コンテナ: max-h-[55vh] overflow-y-auto pb-20（ボタンに被らないように）

■ 発達障害（カテゴリ見出し: text-xs font-semibold text-moon uppercase tracking-wide mt-4 mb-2）
- 自閉スペクトラム症（ASD） → asd
- ADHD — 不注意優勢型 → adhd_inattentive
- ADHD — 多動・衝動優勢型 → adhd_hyperactive
- ADHD — 混合型 → adhd_combined

■ 知的障害
- 知的障害（軽度） → id_mild
- 知的障害（中度） → id_moderate
- 知的障害（重度） → id_severe
- 知的障害（程度不明） → id_unspecified
- 境界知能（ボーダーライン） → borderline_iq

■ 学習障害（LD / SLD）
- 読字障害（ディスレクシア） → ld_dyslexia
- 書字障害（ディスグラフィア） → ld_dysgraphia
- 算数障害（ディスカリキュリア） → ld_dyscalculia

■ 運動・協調
- 発達性協調運動障害（DCD） → dcd

■ コミュニケーション
- 言語発達遅滞 → language_delay
- 構音障害 → articulation_disorder
- 吃音（きつおん） → stuttering
- 場面緘黙（かんもく） → selective_mutism

■ その他の併存症
- てんかん → epilepsy
- チック症 / トゥレット症候群 → tic_tourette
- 愛着障害 → attachment_disorder
- 不安障害 → anxiety_disorder
- 感覚処理障害（SPD） → spd

■ 未診断・その他
- 診断は受けていないが気になる点がある → undiagnosed_concern
- その他 → other

トグルチップのスタイル:
- flex flex-wrap gap-2
- 各チップ: px-3 py-2 rounded-xl text-sm
- 未選択: bg-galaxy-light text-moon border border-galaxy-light
- 選択: bg-cosmic text-white border border-cosmic shadow-sm
- タップでトグル（選択↔解除）

何も選ばなくても「次へ」が押せる。

--- ステップ5: お子さまの特性 ---

見出し: 「お子さまの特性や気になる点」
サブ: 「あてはまるものを選んでください。あとから変更できます。」

同じトグルチップ形式。コンテナ: max-h-[55vh] overflow-y-auto pb-20

■ 感覚
- 音に敏感（聴覚過敏） → auditory_hypersensitive
- 光・色に敏感（視覚過敏） → visual_hypersensitive
- 触られるのが苦手（触覚過敏） → tactile_hypersensitive
- 匂いに敏感（嗅覚過敏） → olfactory_hypersensitive
- 特定の食感が苦手（偏食） → food_texture_sensitive
- 感覚を求める（感覚探求） → sensory_seeking
- 痛みや温度に鈍感（感覚鈍麻） → sensory_hyposensitive

■ コミュニケーション・言語
- 発語がない・少ない → no_speech
- 単語は出るが文にならない → single_words_only
- 会話はできるが一方的になりやすい → one_sided_conversation
- 言葉の意味理解が難しい → poor_comprehension
- 簡単な指示の理解が難しい → difficulty_instructions_basic
- 複数ステップの指示が難しい → difficulty_instructions_complex
- 非言語コミュニケーションの理解が難しい → nonverbal_comprehension_difficulty

■ 行動・情緒
- こだわりが強い（ルーティン固執） → rigid_routine
- 気持ちの切り替えが難しい → emotional_regulation_difficulty
- かんしゃくが起きやすい → frequent_tantrums
- じっとしているのが難しい → hyperactive
- 気が散りやすい → inattentive
- 不安が強い → high_anxiety
- 自傷行為がある → self_injury
- 他害行為がある → aggression

■ 社会性
- 集団活動が苦手 → group_difficulty
- 順番を待つのが難しい → difficulty_taking_turns
- 友達との関わりが難しい → peer_interaction_difficulty
- 目が合いにくい → limited_eye_contact
- 共同注意が難しい → joint_attention_difficulty

■ 運動・身体
- 手先が不器用（微細運動） → fine_motor_difficulty
- 体の動きがぎこちない（粗大運動） → gross_motor_difficulty
- バランスが取りにくい → balance_difficulty
- 姿勢の保持が難しい → posture_difficulty

■ 生活・その他
- 睡眠の問題がある → sleep_issues
- 排泄の自立が遅れている → toileting_delay
- 新しい環境への適応が難しい → adaptation_difficulty

何も選ばなくても「次へ」可能。

--- ステップ6: 通所施設 ---

見出し: 「通っている施設を教えてください」
サブ: 「複数選択できます」

トグルチップ（複数選択可）:
- 児童発達支援センター → child_dev_center
- 児童発達支援事業所 → child_dev_service
- 幼稚園 / 保育園 → kindergarten_nursery
- 放課後等デイサービス → after_school_day
- 特別支援学校 → special_needs_school
- 特別支援学級（通常校内） → special_needs_class
- 通級指導教室 → resource_room
- 療育センター → therapy_center
- その他 → other_facility
- 現在どこにも通っていない → none

何も選ばなくても「次へ」可能。

--- ステップ7: 完了 ---

中央: Mogura(excited) size={160}
テキスト: 「準備ができました！」（text-2xl font-bold text-stardust）
サブ: 「さっそく始めましょう」（text-base text-moon）
「はじめる」ボタン（w-full h-14 bg-cosmic text-white text-lg font-bold rounded-2xl shadow-lg）

タップ →
1. Supabase保存:
   - children: name, birth_date, parent_role
   - child_profiles: disability_types(配列), traits(配列), facilities(TEXT配列)
   ※ child_profiles に facilities カラムがなければ追加:
   ALTER TABLE child_profiles ADD COLUMN IF NOT EXISTS facilities TEXT[] DEFAULT '{}';
2. is_onboarded = true に更新
3. ホーム画面へ遷移

========================================
D. ホーム画面の改修
========================================

【背景】
bg-home.png を全画面背景: background-size: cover, background-position: center
上に薄い暗めオーバーレイ（bg-deep-space/30）で可読性確保

【スマホレイアウト】 max-w-[430px] mx-auto min-h-dvh flex flex-col

【上部バー】 h-14 px-5 flex items-center justify-between
- 左: Mogura(happy) 36px丸フレーム + 子供の名前（text-base text-stardust font-bold）
- 右: 歯車アイコン（オリジナルSVG、24px、moon色）

【メインエリア: 建物マップ（横スクロール）】
flex-1 overflow-x-auto overflow-y-hidden
scroll-snap-type: x mandatory
-webkit-overflow-scrolling: touch
px-5 py-8

建物を横一列に配置。各建物:
- scroll-snap-align: center
- flex-shrink-0
- 幅: 200px
- 建物画像: <Image src="/assets/buildings/building-*.png" /> width={200} アスペクト比維持
- 画像の下: 建物名ラベル（text-sm text-stardust text-center mt-2 font-bold）
- 建物間マージン: mx-5（40px間隔）
- タップ → BottomSheet起動
- ロック状態: filter grayscale(1) opacity-50 + 中央に鍵SVGアイコン（moon色、32px）

建物と名前の対応:
  building-hikari.png → 「ひかりラボ」
  building-kokoro.png → 「こころハウス」
  building-hirameki.png → 「ひらめきタワー」
  building-kankaku.png → 「かんかくドーム」
  building-kotoba.png → 「ことばライブラリ」

建物とゲームの対応:
  ひかりラボ: hikari-catch, matte-stop, oboete-narabete
  こころハウス: kimochi-yomitori, kimochi-stop
  ひらめきタワー: irokae-switch, pattern-puzzle, tsumitage-tower, meiro-tanken
  かんかくドーム: katachi-sagashi, kakurenbo-katachi, hayawaza-touch, touch-de-go
  ことばライブラリ: kotoba-catch, oboete-match

解放ロジック: ひかりラボは初期解放。他はひかりラボ内いずれかでレベル2到達で解放。

【BottomSheet（建物タップ時）】
下からスライドアップ。背景: bg-galaxy/80 オーバーレイ。
上部のみ rounded-t-3xl。ドラッグで閉じ可能。

内容（スマホ幅 max-w-[430px]、px-5 py-6）:
- 建物画像（小さめ、80px）+ 建物名（text-xl font-bold text-stardust）
- 区切り線（h-px bg-galaxy-light my-4）
- ゲーム一覧: 各ゲームを縦リストで表示
  - 各行: flex items-center justify-between py-3
  - 左: ゲーム名（text-base text-stardust）
  - 右: 星評価（★の数、star色、直近スコアに基づく）
  - タップ → ゲーム開始
- 下部固定: 「まとめてあそぶ」ボタン（w-full h-12 bg-cosmic rounded-2xl）
  → 建物内のゲームを順番にプレイ

【保護者アクセス】
画面右下に固定（position: fixed, bottom: env(safe-area-inset-bottom) + 16px, right: 16px）
小さな歯車アイコン（24px、moon色、opacity-50）
長押し2秒 → ParentalGate → /parent/dashboard

========================================
E. GameShell・フィードバック改修
========================================

【GameShell背景】
各ゲームが属する建物のテーマカラーで背景:
  ひかりラボ系: galaxy → nebula 微かなグラデーション
  こころハウス系: galaxy → cosmic
  ひらめきタワー系: galaxy → comet
  かんかくドーム系: galaxy → aurora（薄め）
  ことばライブラリ系: galaxy → star（薄め）
上に星の点を散らす（小さなdiv、bg-white、rounded-full、opacity-30-70、ランダム配置20-30個）

【GameShell UI】 スマホ最適化
- 上部バー: h-12 px-4
  - 左: Mogura(encouraging) 28px
  - 中央: CosmicProgressBar（flex-1 mx-3、h-2.5）
  - 右: 一時停止ボタン（歯車SVG、20px、moon色）
- ゲームエリア: flex-1、画面の残り全て

【フィードバック画像化】
src/components/feedback/TrialFeedback.tsx を改修:

正答（通常）:
  effect-star.png を5-8個生成、タップ位置を中心に放射状に散布
  各パーティクル: 30-50px、opacity 1→0、scale 0→1→0 のアニメーション（0.6秒）
  散布範囲: 半径80-120px
  チャイム音（console.log('Sound: correct.mp3') でプレースホルダー）

正答（大きな強化）:
  上記 + effect-confetti.png を画面上部から落下 + Mogura(excited) が画面下部にポップアップ（0.5秒表示→フェードアウト）

我慢成功（NoGo正答）:
  effect-heart.png を5個散布 + Mogura(clapping) ポップアップ
  ※ Go正答より派手に

誤答:
  対象要素に shake アニメーション（translateX -4px → 4px を3回、0.3秒）
  それ以外何もしない。赤色・バツ印・ネガティブ表現は一切使わない

セッション完了:
  rocket.png が画面下部から上部へ飛行（1秒、translateY 100vh → -100vh）
  effect-sparkle.png を散布
  星評価表示（★1-3、star色の星画像 or CSS）

【ゲーム内刺激差し替え】
- matte-stop（Go/NoGo）: stimulus-star.png (Go) / stimulus-rock.png (NoGo)
- hikari-catch（視覚探索）: stimulus-*.png からランダム選択
- 記憶ゲーム: card-back.png をカード裏面に

========================================
F. デザイン品質の底上げ
========================================

【色の統一】全画面でブランドカラー厳守:
  cosmic: #6C3CE1（メイン）
  cosmic-light: #8B5CF6
  cosmic-dark: #5B2CC9
  nebula: #FF6B9D（アクセント）
  star: #FFD43B（報酬）
  galaxy: #1A1A40（背景）
  deep-space: #0D0D2B（最暗背景）
  comet: #4ECDC4（セカンダリ）
  stardust: #F0F0FF（テキスト/明るい背景）
  moon: #B8B8D0（非活性）
  aurora: #2ED573（成功）
  supernova: #FF4757（エラー、保護者画面のみ）

【ボタンの立体感】
すべてのインタラクティブなボタン:
  - rounded-2xl
  - shadow-lg
  - 底面に3px分の暗い色のborder-bottom（押せる感）
  - active:translate-y-[2px] active:shadow-sm（押し込み）
  - transition-all duration-150

【カード】
  - bg-galaxy-light
  - rounded-2xl
  - shadow-md
  - p-5
  - border border-galaxy-light（微かなボーダー）

【テキスト】
  - 暗い背景: text-stardust（白に近い）
  - サブテキスト: text-moon
  - 明るい背景（保護者画面）: text-galaxy
  - リンク: text-comet

========================================
G. 保護者ダッシュボードのスマホ最適化
========================================

既存のダッシュボードをスマホで見やすく修正:

- max-w-[430px] mx-auto
- 15領域グリッド: 5列×3行 → スマホでは3列×5行に変更（各セル: w-full/3）
- レーダーチャート: 幅を画面幅に合わせる（max-w-[350px] mx-auto）
- 「きょうのおすすめ」カード: w-full 縦積み
- 各認知領域の4軸カード: 2×2グリッド → スマホでは2列維持だがコンパクトに（gap-3）
- 折れ線グラフ: 横スクロール可能に（overflow-x-auto）
- セッション一覧: 通常のリスト表示（カード形式は不要、シンプルに）

========================================
H. 実行指示
========================================

以下を順番に実行:

1. Mogura.tsx コンポーネント作成、既存キャラをエイリアス化
2. 全画面の絵文字・SVGキャラ → PNG画像に差し替え
3. オンボーディング7ステップを全面作り直し:
   - ステップ1: アカウント作成
   - ステップ2: 役割選択
   - ステップ3: お子さまの情報（名前+カレンダー生年月日）
   - ステップ4: 診断・障害（細分化されたトグルチップ）
   - ステップ5: 特性（細分化されたトグルチップ）
   - ステップ6: 通所施設（複数選択）
   - ステップ7: 完了
4. child_profiles に facilities カラム追加（ALTER TABLE）
5. ホーム画面: 建物マップUI（横スクロール+BottomSheet）
6. GameShell UI改修（スマホ最適化+背景）
7. フィードバック画像化（effect-*.png パーティクル）
8. ゲーム内刺激の画像差し替え
9. 保護者ダッシュボードのスマホレイアウト修正
10. 全画面のスマホ最適化チェック（余白、フォントサイズ、タップターゲット）

完了後:
1. vitest 実行（コアロジック非破壊の確認）
2. npm run dev で全画面の目視確認
3. 「改修完了」と報告 + 変更ファイル一覧
```
