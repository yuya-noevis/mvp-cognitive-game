# オンボーディング・初回体験リサーチレポート

**担当**: Teammate 3「オンボーディング・初回体験」
**作成日**: 2026-03-02
**対象プロダクト**: Manas（神経発達症児向け認知トレーニングアプリ）

---

## 1. エグゼクティブサマリ

Manasの現行オンボーディング（25画面・サインアップファースト）は、業界ベストプラクティスと比較して「価値を感じるまでの時間（TTV）」が最も長い部類に入る。Duolingoがサインアップを後置することで翌日リテンション+20%を達成した事例が示すように、**ユーザーは「使ってみた体験」の後に初めて個人情報提供を納得する**。神経発達症児の保護者という高ストレスターゲットに対し、25問の質問を一括収集するアプローチは離脱リスクが高い。収集情報を段階的に分散させ、「最初の3画面でゲームを体験させる」構造への抜本的再設計が最優先課題である。

---

## 2. 調査対象プロダクト詳細分析

### 2.1 Duolingo

**概要**: 世界最大の語学学習アプリ。2025年時点でDAU約4,770万人、有料会員約1,090万人。

**オンボーディングフロー（モバイル版・7ステップ）**:

```
[アプリ起動]
    |
    v
[Step 1] 学習言語の選択（タップ1つ）
    |
    v
[Step 2] 学習目的の選択（旅行・キャリア・趣味など）
    |
    v
[Step 3] 既存レベルの確認 or 初心者選択
    |
    v
[Step 4] 1日の目標設定（5/10/15/20分）
    |
    v
[Step 5] ★ 最初のレッスン体験（サインアップ前に価値を提供）
    |
    v
[Step 6] 「進捗を保存するには登録を」というプロンプト（スキップ可）
    |
    v
[Step 7] サインアップ（任意・後置）
    |
    v
[ダッシュボードへ]
```

**Time to Value**: 約1〜2分（レッスン完了まで）

**主要知見**:
- サインアップを後置した結果、**翌日ユーザーリテンションが20%向上**
- 「目標設定（Goal Setting）」を早期に行うことで帰属意識と継続動機を醸成
- プレースメントテストは任意オプション（初心者向け・経験者向けの分岐）
- プログレスバーで残りステップを可視化し離脱を防止
- キャラクター（Duo）が感情的なつながりを作る

**Manasへの示唆**: Manasも「まずゲームを体験させ、後でプロフィール収集」に転換すべき。

---

### 2.2 Khan Academy Kids

**概要**: 2〜8歳向け無料教育アプリ。App Storeで4.7★、数百万DL。

**オンボーディングフロー（保護者ホーム利用）**:

```
[アプリ起動]
    |
    v
[Step 1] 「保護者」or「学校」の選択
    |
    v
[Step 2] 保護者メールアドレスで登録（COPPA準拠）
    |
    v
[Step 3] 子どもの名前・年齢・アバター選択（★即座にパーソナライズ）
    |
    v
[Step 4] ホーム画面へ（Kodiキャラクターが案内）
    |
    v
[▶ ボタンで即座に学習開始]
    年齢・過去パフォーマンスに応じた内容が自動表示
```

**Time to Value**: 約2〜3分（子どもがコンテンツに触れるまで）

**主要知見**:
- **年齢入力だけでコンテンツが即座に自動調整**（重い事前アセスメント不要）
- 子ども用キャラクター5体から選ぶことで子どもの主体性を引き出す
- 保護者向けダッシュボードは「使い始めた後」から段階的に開示
- 学習進捗はアプリ内プレイを通じて自動的に蓄積
- 先生モードでは学年・学習レベルを入力するだけで設定完了

**Manasへの示唆**: 「生年月日入力→自動でAgeGroup判定→即ゲーム」だけで最低限の体験が成立する。診断情報は任意・後置でよい。

---

### 2.3 CogniFit

**概要**: 認知機能評価・トレーニングプラットフォーム。医療機関・研究者にも利用される。

**オンボーディングフロー**:

```
[Web/アプリ起動]
    |
    v
[Step 1] アカウント作成（メール or SNS）
    |
    v
[Step 2] 対象（自分 / 家族 / 専門家）の選択
    |
    v
[Step 3] 約10分間の初期認知評価（2〜3ゲームで構成）
    ※ ゲーム形式で実施、質問紙形式ではない
    |
    v
[Step 4] 認知プロファイルレポート表示
    （強み・弱みのレーダーチャート）
    |
    v
[Step 5] パーソナライズドトレーニングプランの提示
    |
    v
[Step 6] 有料プランへの誘導（プロファイルが「餌」になる）
```

**Time to Value**: 約12〜15分（認知プロファイル確認まで）

**主要知見**:
- **評価自体がゲーム形式**で実施され、退屈な質問紙にならない
- 結果（認知プロファイル）が「サンクコスト」として機能し、継続を促す
- 評価後に即座にパーソナライズドプランを提示（驚き・発見の体験）
- ファミリープランでは子どもの認知発達を保護者が確認可能
- ADHDの子ども向けには専用の評価バッテリーが存在

**Manasへの示唆**: 保護者への質問紙ではなく、**子どもが最初のゲームをプレイするだけで認知プロファイルを自動生成**できる設計にすると、Manas固有の強みになる。

---

### 2.4 EndeavorRx

**概要**: FDA承認の処方箋型ADHDデジタル治療薬。8〜17歳が対象。1処方=30日分、$99。

**オンボーディングフロー（処方後）**:

```
[医師が処方箋発行]
    |
    v
[Step 1] 保護者へ確認メール送信（アクティベーションコード含む）
    |
    v
[Step 2] 保護者がアプリDL → コード入力
    |
    v
[Step 3] 子どもが子ども用アプリを起動 → ゲーム開始
    ※ 追加設定なし
    |
    v
[Step 4] 保護者はEndeavorRx Insightアプリで
         子どもの進捗をリアルタイム確認
```

**Time to Value（子ども側）**: 約5分（コード入力からゲーム開始まで）

**主要知見**:
- 医療機関がオンボーディングの前段階を担うため、**アプリ内オンボーディングは極限まで簡略化**
- 子ども用/保護者用でアプリを完全分離（子どもが設定に触れない設計）
- 処方箋という「外部権威」が初回信頼の壁をクリアする
- Insightアプリで保護者は毎日の進捗を確認（関与継続の設計）
- 難点: 医師の処方が必要なため一般消費者へのアクセスが困難

**Manasへの示唆**: Manasは療育機関・特別支援学校経由での導入も想定されるため、EndeavorRxのような「機関承認→コード配布→即利用」モデルが参考になる。また子ども用UIと保護者用ダッシュボードの完全分離設計は学ぶべき点が多い。

---

### 2.5 ACTIVATE（C8Sciences）

**概要**: Yale大学発の認知トレーニングプログラム。学校・クリニック向け（ADHD・ASD対応）。

**オンボーディングフロー（学校導入版）**:

```
[学校管理者が契約]
    |
    v
[管理者Step 1] 管理ポータルで学校・クラス設定
    |
    v
[管理者Step 2] 生徒アカウント一括作成
    |
    v
[生徒Step 1] NIHツールボックスベースの初期認知評価
    （注意・抑制・ワーキングメモリ・リスク判断のテスト）
    約20〜30分
    |
    v
[Step 2] 「Comprehensive Cognition Profile」生成
    （認知強弱の詳細レポート）
    |
    v
[Step 3] 6種のゲームを個人の弱点に応じた配分でトレーニング開始
    |
    v
[Step 4] 教師・管理者が週次レポートで進捗確認
    （前・中・後アセスメントで比較可能）
```

**Time to Value**: 30〜40分（プロファイル確認まで）

**主要知見**:
- **評価がゲーム形式**（Flankerテスト、Go/No-Goテスト等）で行われ、負担感が低い
- 機関導入のため保護者の個別オンボーディング負荷はほぼゼロ
- 評価データが学校・教師・保護者で階層的に共有される
- 100以上の難易度レベルを持つゲームがDDAで自動調整される
- 課題: 多施設RCTでADHD群に有意差なしという研究結果あり

**Manasへの示唆**: ACTIVATEの認知評価はゲームプレイを通じて自動化されている。Manasでも「最初の1セッション（15分）で認知プロファイルを暗示的に生成」する設計が理想。

---

### 2.6 一般的ベストプラクティス（Appcues/UserGuiding等）

**Time to Value（TTV）の業界スタンダード**:
- 最適なオンボーディングステップ数: **3〜7ステップ**（モバイルアプリ）
- 第1画面での離脱率: 平均**38%**
- 30日後のアクティブ率: 平均**7.88%**
- ゲーミフィケーション（バッジ・プログレスバー）導入でオンボーディング完了率**+50%**
- ソーシャルログイン（1クリック）でオンボーディング完了率**+60%**
- 「30%以上の必須ステップは実は不要」（UserGuiding調査）

**認知負荷軽減の原則**:
- Progressive Disclosure: 必要な情報だけをその瞬間に開示
- 1画面1アクション: ユーザーに複数の判断を同時に求めない
- 視覚的サポート: テキストより絵・アイコンで指示
- 進行インジケーター: 「あと何ステップ」を常に表示

---

## 3. 比較表

| 項目 | Duolingo | Khan Academy Kids | CogniFit | EndeavorRx | ACTIVATE | **Manas（現状）** |
|------|----------|-------------------|----------|------------|----------|----------------|
| **ステップ数（入口）** | 6〜7 | 3〜4 | 5〜6 | 2〜3 | 機関依存 | **25** |
| **サインアップ位置** | 後置（任意） | 最初（COPPA必須） | 最初 | 最初 | 機関一括 | **最初（必須）** |
| **最初の価値体験まで** | 約2分 | 約3分 | 約15分 | 約5分 | 約30分 | **未体験のまま全質問完了** |
| **子どもが最初に触れる** | コンテンツ | コンテンツ | 評価ゲーム | ゲーム | 評価ゲーム | **なし（保護者のみ）** |
| **診断情報の収集** | なし | なし | ゲームで暗示的 | 医師が代行 | ゲームで暗示的 | **明示的・25画面** |
| **保護者負荷** | 低 | 中（COPPA） | 中 | 低（医師委譲） | 低（機関委譲） | **高（全画面保護者担当）** |
| **DDA/パーソナライズ** | 学習目標ベース | 年齢・パフォーマンス | 評価結果ベース | 処方ベース | 評価結果ベース | **全質問回答後** |
| **スキップ可能か** | ほぼ全て | 一部 | 評価は必須 | 不可（処方必要） | 不可（機関） | **一部スキップ可** |
| **感情的フック** | Duoキャラ・ストリーク | Kodiキャラ | プロファイル発見 | 医療的権威 | 学校信頼 | **キャラ・フェーズ色** |
| **Time to First Game** | N/A（語学） | 3分 | 15分 | 5分 | 30分 | **∞（ゲーム前に全完了必要）** |

---

## 4. Manasの現状との差分分析

### 4.1 現行フロー図

```
[アプリ起動]
    |
    v
[Screen 0]  ★ アカウント作成（メール/パスワード）← 最大の離脱ポイント
    |
    v
[Screen 1]  生年月日選択
    |
    v
[Screen 2]  子どもの名前入力
    |
    v
[Screen 3]  発話レベル選択
    |
    v
[Screen 4]  専門家評価受診歴（はい/いいえ）
    |
    v
[Screen 5]  診断名選択（複数選択）or 気になること選択
    |
    v
[Screen 7〜14] 認知ドメイン8問（注意・抑制・WM・記憶・処理速度・柔軟性・推論・視空間）
    |
    v
[Screen 15〜18] 社会・情緒 4問
    |
    v
[Screen 19〜21] 運動・感覚 3問
    |
    v
[Screen 22〜23] 行動特性・社会特性 2問
    |
    v
[Screen 24] 完了 → ゲームへ

★ ゲームを体験できるのは全25画面クリア後
```

### 4.2 主要な差分と問題点

**問題1: サインアップファースト（最大の離脱ポイント）**
- 業界で最も避けられている設計パターン
- メール/パスワード入力で平均43%のユーザーが離脱（IPification研究）
- Manasのターゲット（神経発達症児の保護者）は既に精神的疲弊度が高い

**問題2: 価値提供前の情報収集**
- 25画面すべてが終わるまでゲームに触れられない
- 「これは役に立つのか」という疑念が解消される前に個人情報を大量要求
- Duolingoは「体験後に登録」で+20%リテンション達成

**問題3: 診断情報の収集方法**
- 「診断名を選んでください」という明示的な収集は保護者に精神的負荷を与える
- CogniFit・ACTIVATEはゲームプレイを通じて暗示的に認知プロファイルを生成
- 診断名がなくても「年齢+最初のゲームパフォーマンス」でDDAが機能可能

**問題4: 子どもの不在**
- オンボーディング全25画面が保護者向け
- 子どもがアプリに初めて触れる体験が設計されていない
- Khan Academy Kidsはキャラクター選択で子どもの主体性を早期に引き出す

**問題5: 認知ドメイン質問の重複**
- 8ドメインの認知評価質問（Screen 7〜14）が「はい/いいえ」で収集される
- この情報は最初のゲームセッション（15分）で自動的に取得可能
- 保護者の主観的回答より、実際のゲームパフォーマンスの方が精度が高い

---

## 5. 具体的な改善提案

### P0: 今すぐやるべき（リリース前必須）

#### P0-1: サインアップを後置する
**現状**: Screen 0でサインアップ必須
**改善後**: 最初3画面（生年月日・名前・ゲーム体験）の後にサインアップを任意で提示

```
Before:
[サインアップ] → [生年月日] → [名前] → ... → [ゲーム]

After:
[生年月日] → [名前] → [★ゲーム体験1回] → [「進捗を保存するには」サインアップ]
```

**期待効果**: 翌日リテンション+15〜20%（Duolingo実績ベース）
**実装コスト**: 中（useOnboardingのフロー変更、匿名セッション管理）

#### P0-2: 最低限3画面でゲーム体験まで到達できる高速パスを作る
**設計**:
```
[Screen A] 生年月日選択（AgeGroup自動判定）
[Screen B] 名前入力（ニックネームOK）
[Screen C] ★ 最初のゲーム体験（1ゲーム・3試行のデモ）
           → 「よくできました！〇〇くんの得意なこと、調べてみましょう」
[Screen D] プロフィールを充実させる（任意・後置）
```

**実装コスト**: 中（既存GameShellを埋め込み可能）

#### P0-3: 認知ドメイン質問（8問）を削除し、ゲームプレイデータに置換
**現状**: Screen 7〜14の8問を保護者が回答
**改善後**: 最初のゲームセッション（3〜5ゲーム×5試行）のパフォーマンスデータでDDAが自動決定

**根拠**:
- 保護者の主観回答よりゲームパフォーマンスの方が精度が高い
- ACTIVATEもCogniFitも「ゲームで測定」アプローチを採用
- 8問削除でオンボーディング所要時間が約40%短縮

**実装コスト**: 低（DDA Engine既存機能の活用）

---

### P1: 次のスプリントで実施

#### P1-1: オンボーディングを「保護者フェーズ」「子どもフェーズ」に分離

```
【保護者フェーズ】（5分・3〜4画面）
  [生年月日] → [名前] → [発話レベル] → [サインアップ]

【子どもフェーズ】（初回起動時）
  [キャラクター選択] → [最初のゲーム体験] → 「やったね！」

【保護者追加入力フェーズ】（任意・後日）
  [診断情報] → [行動特性] → [同意設定]
  ※ ゲームプレイ3回目以降に「もっと合わせるために教えて」として誘導
```

**期待効果**: 保護者負荷の軽減、子どもの主体性確保
**実装コスト**: 高（UIコンポーネントの分岐設計）

#### P1-2: 診断情報収集をインセンティブ付き任意入力に変更

**現状**: オンボーディング中の必須（または強推奨）質問
**改善後**: ゲームプレイ開始後、保護者ダッシュボードで任意入力
- 「診断情報を入力すると、〇〇のゲームが最適化されます」
- 「詳しいプロファイルを作るとDDAがより精度良く動きます」

**実装コスト**: 中（保護者ダッシュボードUI追加）

#### P1-3: プログレスバーの情報を「残りステップ数」に変更

**現状**: 25ステップ中の割合（CosmicProgressBar）
**改善後**: 「あと3ステップでゲームが始まります」などの具体的なマイルストーン表示

```typescript
// 例: constants.ts に MILESTONES を追加
export const MILESTONES = [
  { atStep: 3, label: 'ゲーム体験まであと1ステップ！' },
  { atStep: 8, label: '認知プロファイルが完成しつつあります' },
  { atStep: 24, label: 'もうすぐ完了！' },
];
```

**実装コスト**: 低（CosmicProgressBar改修）

#### P1-4: 視覚支援の強化（ASD対応）

ASDの子どもと保護者は視覚情報処理が強い。テキスト中心の質問を絵・アイコン併記に変更。

```
例:「発話レベル」の選択肢
Before: 「発語なしだが、はい/いいえは伝えられる」（テキストのみ）
After:  🙅 + 👍 + 「はい・いいえは伝えられる」（アイコン+短いテキスト）
```

**実装コスト**: 中（アイコン素材準備とUI改修）

---

### P2: 中長期的に取り組む

#### P2-1: 「体験後プロファイル」自動生成機能

最初の1セッション（3ゲーム×10試行）のプレイデータから、認知プロファイルを自動生成してレポートとして保護者に提示する。

```
「〇〇くんの認知プロファイル（初回計測）」
  注意力:     ████░░░░ Lv.3
  ワーキングメモリ: ███░░░░░ Lv.2
  処理速度:   █████░░░ Lv.4

  「注意力と処理速度が同年齢より高い傾向があります」
```

**期待効果**: 保護者のエンゲージメント向上、DDAの精度向上、継続動機の醸成
**実装コスト**: 高（ゲームデータのプロファイル変換ロジック開発）

#### P2-2: 療育機関・特別支援学校向けコードベース導入フロー

EndeavorRxモデルを参考に、療育機関がコードを発行し保護者がそれを入力するだけで即利用開始できる導線を用意する。機関側オンボーディングが代わりに「信頼の壁」を突破してくれる。

**実装コスト**: 高（機関向けポータル開発）

#### P2-3: AIによるオンボーディングの動的最適化

保護者が入力した情報の組み合わせに応じて、出現する質問を動的に変化させる。

- ASD+発語なし → 認知ドメイン質問をスキップ、感覚過敏に特化
- ADHD混合型 → 注意・抑制質問を優先、社会特性は後回し
- 診断なし → 気になることベースで動的に分岐

**実装コスト**: 高（Machine Learning または ルールエンジン）

---

## 6. 推奨する新オンボーディングフロー（P0+P1適用後）

```
[アプリ起動]
    |
    v
【★ Phase 1: 高速開始（2分・3画面）】
[Screen 1] 生年月日選択 → AgeGroup自動判定
[Screen 2] 名前入力（ニックネームOK）
[Screen 3] 発話レベル選択（アイコン付き・5択）
    |
    v
【★ Phase 2: 初回ゲーム体験（3分）】
[Demo Game] 年齢に合ったゲームを1つ体験（3〜5試行）
[結果画面] 「よくできました！〇〇くんの得意なことがわかってきました」
           認知プロファイルのシードデータをバックグラウンドで生成
    |
    v
【★ Phase 3: アカウント作成（任意・1分）】
[Signup] 「進捗を保存して、〇〇くんのプロフィールを完成させましょう」
         （スキップ→匿名セッションとして継続）
    |
    v
【★ Phase 4: 任意の詳細情報（5〜10分・後置）】
[Option] 診断情報・行動特性・評価歴
         → 「入力すると〇〇のゲームが最適化されます」という動機付け
    |
    v
[ホーム画面へ]

★ TTV: 約5分（比較: 現状は25画面完了まで推定10〜15分）
★ 必須画面数: 3画面（比較: 現状25画面）
```

---

## 7. 神経発達症児特有の配慮事項

### 7.1 保護者の精神的負荷（Caregiver Burden）

神経発達症の子どもの保護者は、診断取得・療育探し・学校調整等で慢性的に疲弊している。
- 「また質問に答えなければならない」という負荷感を最小化する
- 診断名の入力を強制しない（「いつでも後から変更可能」を明示）
- 「あなたの子どもを理解するため」という文脈での質問フレーミング

### 7.2 ASD児のための設計

- 視覚情報優位：テキストよりアイコン・画像で指示
- 予測可能性：「次に何が起きるか」を常に事前提示
- 変化の最小化：一貫したUI要素とアニメーション
- 感覚過敏への配慮：音・フラッシュのオフ選択肢（現行Screen 21のsensorySensitiveで対応済）

### 7.3 ADHD児のための設計

- 注意持続の限界：1画面1タスク、長い説明は分割
- 即時報酬：早期にポジティブフィードバックを提供
- 視覚的進行：「あとN画面」の明示
- 選択肢の削減：複数選択より単一選択を優先

### 7.4 知的障害のある子どもへの配慮

- 簡潔な語彙：保護者向け説明も平易な言葉で
- 視覚的サポート：テキストに必ずアイコンを併記
- エラー許容：間違えても前に戻れる設計（現行のGoBack対応済）

### 7.5 指示理解の階層（Instruction Hierarchy）

ASD/知的障害の子どもへの指示は以下の階層で設計すべき:
1. 視覚的モデリング（見せる）
2. ジェスチャー（指さす）
3. 部分的身体誘導
4. 全身体誘導

アプリのオンボーディング文脈では：
1. アニメーション/GIFで操作を見せる
2. 矢印・指アイコンで誘導
3. 自動進行（タイムアウト）で次に進む
4. 代替操作（音声入力等）の提供

---

## 8. 出典リスト

- [Duolingo onboarding UX analysis - Appcues GoodUX](https://goodux.appcues.com/blog/duolingo-user-onboarding)
- [Duolingo onboarding - UserGuiding breakdown](https://userguiding.com/blog/duolingo-onboarding-ux)
- [Gradual engagement: Why your mobile app's first screen should not be a signup - Appcues](https://www.appcues.com/blog/gradual-engagement-mobile-app-first-screen)
- [How Duolingo reignited user growth (+20% retention) - Lenny's Newsletter](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth)
- [How Duolingo's Modern Onboarding Drives User Retention - Redfast](https://www.redfast.com/news/how-duolingos-modern-onboarding-drives-user-retention)
- [Khan Academy Kids: Parent Guide - Getting Started](https://khankids.zendesk.com/hc/en-us/articles/360006764812-Parent-Guide-Using-Khan-Academy-Kids-at-Home)
- [Khan Academy Kids: Quick Start Guide](https://khankids.zendesk.com/hc/en-us/articles/360040315632-Quick-start-guide-for-Khan-Academy-Kids)
- [CogniFit Cognitive Assessment and Training](https://www.cognifit.com/cognitive-test)
- [CogniFit 4.0: New version overview](https://blog.cognifit.com/cognifit-4-0-the-new-version-of-cognifits-cognitive-testing-and-training-app/)
- [CogniFit AI-driven personalization](https://blog.cognifit.com/revolutionizing-brain-training-with-data-driven-personalization/)
- [EndeavorRx: FAQ and Onboarding](https://www.endeavorrx.com/faq/)
- [EndeavorRx Insight companion app](https://www.endeavorrx.com/endeavorrx-insight/)
- [EndeavorRx: GoodRx clinical review](https://www.goodrx.com/conditions/adhd/does-endeavorrx-adhd-treatment-gamification-work)
- [ACTIVATE Brain Training - ADDitude Magazine](https://www.additudemag.com/treatment/activate/)
- [C8Sciences ACTIVATE Program](https://c8sciences.com/program/)
- [BrainFutures: ACTIVATE review](https://www.brainfutures.org/activate-2/)
- [100+ User Onboarding Statistics - UserGuiding](https://userguiding.com/blog/user-onboarding-statistics)
- [Why 90% of users abandon apps during onboarding - Glance](https://thisisglance.com/blog/why-90-of-users-abandon-apps-during-onboarding-process)
- [App Onboarding Rates 2026 - Business of Apps](https://www.businessofapps.com/data/app-onboarding-rates/)
- [Time to Value: Key to driving user retention - Amplitude](https://amplitude.com/blog/time-to-value-drives-user-retention)
- [Appcues: 6 user onboarding best practices](https://www.appcues.com/blog/user-onboarding-best-practices)
- [UserGuiding: Mobile app onboarding best practices](https://userguiding.com/blog/mobile-app-onboarding)
- [Progressive Disclosure - Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)
- [Designing for Children with ADHD - UX Magazine UXPA](https://uxpamagazine.org/designing_children_adhd/)
- [Designing Inclusive and Sensory-Friendly UX for Neurodiverse Audiences - UX Magazine](https://uxmag.com/articles/designing-inclusive-and-sensory-friendly-ux-for-neurodiverse-audiences)
- [Inclusive UX/UI for Neurodivergent Users - Medium/Bootcamp](https://medium.com/design-bootcamp/inclusive-ux-ui-for-neurodivergent-users-best-practices-and-challenges-488677ed2c6e)
- [Mobile App for ASD: Participatory Design and Usability - PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8441616/)
- [Visual supports for autism - Autism Awareness Centre](https://autismawarenesscentre.com/visual-supports-best-way-use/)
- [COPPA Compliance in 2025: Practical Guide - Promise Legal](https://blog.promise.legal/startup-central/coppa-compliance-in-2025-a-practical-guide-for-tech-edtech-and-kids-apps/)
- [Confidence engineering: Why your onboarding might be too short - Ravi Mehta](https://blog.ravi-mehta.com/p/onboarding-optimization)

---

*このレポートはManasリサーチチーム Teammate 3「オンボーディング・初回体験」担当が作成。*
*調査日: 2026-03-02。Web検索により最新データを取得。*
