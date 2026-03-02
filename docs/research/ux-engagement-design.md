# UX・エンゲージメント設計リサーチ報告書

**担当**: Teammate 2 — UX・エンゲージメント設計
**対象プロダクト**: Manas（神経発達症児向け認知トレーニングアプリ）
**作成日**: 2026-03-02
**調査範囲**: Duolingo, Khan Academy Kids, CogniFit, EndeavorRx, Habitica, Forest, ClassDojo

---

## 1. エグゼクティブサマリ

ユーザー継続率の決定要因は「損失回避設計 × 段階的な達成感 × 親の関与」の三角構造にある。Duolingoはストリーク×損失回避で DAU/MAU 比 34.7%（Q4 2024）を実現し、EndeavorRxは30分ロックアウトという強制的なコンプライアンス設計でADHD治療の臨床遵守を担保した。Manasの現状はストリーク計測・ステージマップ・マスタリートラッカーという堅固な基盤を持つが、**「ストリーク保護」「親へのプッシュ通知ループ」「段階的な可視化進捗」** の三点が未実装であり、この差分が早期チャーンの主因となるリスクがある。本報告書では優先度付きの具体的改善案を提示する。

---

## 2. 調査対象プロダクト詳細分析

### 2.1 Duolingo

#### 概要と実績指標
Duolingoは言語学習アプリとして2024年末時点で DAU 4,050万人（前年比+51%）、MAU 1億1,670万人（前年比+32%）を達成した。Q4 2024の DAU/MAU 比は **34.7%** であり、これは一般的な教育アプリの10〜15%に対して約3倍の水準である。

#### ストリーク設計の解剖

**コアロジック: 損失回避の段階的活性化**

Duolingoのストリーク機能は600を超えるA/Bテストの結果として進化した設計である。心理的メカニズムは以下の通り段階的に機能する。

- **Day 1〜6（習慣形成前）**: 新規性報酬でログインを引き出す。
- **Day 7（閾値）**: 7日ストリーク到達時点で損失回避心理が発動する。この段階では7日ストリーク保持ユーザーの翌日返却率が非保持ユーザーの **2.4倍** となる。
- **Day 7〜30（習慣安定期）**: 「Streak Freeze（ストリーク保護）」の購入率が急増する。これは損失回避を収益化したメカニズムであり、機能の名称を「休憩券」ではなく「保護」と表現することで感情的な価値を高めている。

**定量的効果データ**

| メカニズム | 測定指標 | 効果 |
|---|---|---|
| 7日ストリーク到達 | 翌日返却率 | 2.4倍 |
| ストリーク保持 | コース完了率 | 3.6倍 |
| ストリーク賭け機能 | Day 14 リテンション | +14% |
| リーダーボード導入 | 学習時間 | +17% |
| リーダーボード導入 | 高エンゲージユーザー数 | +200%（3倍） |
| iOS ウィジェット導入 | ユーザーコミットメント | +60% |
| XP リーダーボード | 週次レッスン完了数 | +40% |

**マルチチャネル習慣強化**

- **iOS/Androidウィジェット**: 今日のストリーク達成状況をホーム画面に常時表示。プッシュ通知と同等以上の効果があるとユーザーが報告。
- **Push.duolingo.com**: プッシュ通知をブランドコンテンツとして公開するという異例の透明性戦略。「今日やった？ Duo が待ってるよ」という擬人化通知が感情的なコミットメントを強化。
- **Friend Streak**: DAUの1/3が「フレンドストリーク」を維持中（2024末時点で1,000万人以上が1年超ストリーク保持）。

#### XPシステムとリーグ

XPはセッションのたびに付与される即時強化子であり、ウィークリーリーグ（30人単位）における順位競争を通じて社会的比較を促進する。ユーザーは「降格回避」という損失回避動機でさらに学習時間を延ばす。リーグ導入後の学習時間増加は **+17%**、高エンゲージユーザー（週5日以上、1日1時間以上）は **3倍** に増加した。

**Manasへの示唆**: 現在のManasは gems（宝石）と lives（ライフ）を TopStatusBar に表示しているが、これらは週次での競争要素やリーグ機能に接続されていない。報酬が「収集されて終わり」であり、継続のインセンティブとして機能していない可能性がある。

---

### 2.2 Khan Academy Kids

#### 概要
Khan Academy Kidsは2〜8歳を対象とした教育アプリで、Stanfordの学習専門家と協力して開発されたカリキュラムを持つ。App Store評価4.7/5。

#### エンゲージメント設計の特徴

**キャラクター活用（Emotional Anchoring）**

Kodi Bearをはじめとする5体のキャラクターが子供を「ガイド」する設計。キャラクターは単なるマスコットではなく、情緒的なアンカーとして機能し、「Kodiに会いに行く」という動機を生み出す。

**マイクロレッスン設計**

コンテンツを3〜5分のセッションに分割することで、子供の自然な注意持続時間に合わせた設計を実現している。この設計によりセッション完了率が **50%向上** したと報告されている。具体的には：

- 1回のセッションを単一の認知負荷に絞る
- 選択式とオープンエンド型を交互に配置してメンタルリセットを促す
- 視覚・聴覚・触覚（タッチ）のマルチモーダルフィードバック

**マスタリーベース進行**

ユーザーがある技能をマスターしない限り次のコンテンツへ進めない仕組み。これはManasのDTT基準（80%正答率×2セッション）と設計思想が一致している。

**収集コレクション報酬**

動物や道具を「コレクション」として収集するメカニクスにより、完了行動への動機付けを強化している。

**Manasへの示唆**: Manasのマスコット（Luna、Mogura）はすでに感情的なアンカーとして機能しているが、キャラクターの成長やリアクション多様性（例：Lunaがプレイヤーの連続正解に驚く演出）が不足している可能性がある。コレクション要素の追加も検討価値がある。

---

### 2.3 CogniFit

#### 概要
CogniFitは成人および子供向けの認知トレーニングアプリで、28種類のゲームを提供する（CogniFit 4.0、2024年8月リリース）。医師への進捗レポート送信機能を持ち、臨床現場でも活用されている。

#### 強みと弱み

**強み**
- AIによるパーソナルトレーニングプランの自動調整
- 医師・保護者向けの詳細進捗レポート（認知プロフィール、努力量、進化グラフ）
- 週3日以上の利用を推奨するコーチング設計

**弱み（継続率の課題）**
独立評価機関（MindTools.io）によれば、CogniFitは「適切にユーザーを動機づける能力が不足している」と指摘されている。フィードバックがグラフと進捗バー中心であり、統合的な言語フィードバック（励ましのメッセージ）が欠如している。これにより、成果が出ていても「達成感」を感じにくいUXになっている。

**Manasへの示唆**: CogniFitの失敗事例は、データ表示（スコア、精度グラフ）だけでは継続動機として不十分であることを示している。Manasは既に「すばらしい！」などの言語フィードバックを実装しているが、セッション完了後の「親への自動レポート」機能を追加することで CogniFit の強みを取り込める。

---

### 2.4 EndeavorRx

#### 概要
EndeavorRxはADHD（注意欠如多動症）の6〜12歳の子供を対象とした、FDA認可を受けた初の処方デジタルゲーム（2020年認可）。1日25分、週5日、4週間を治療プロトコルとする。

#### コンプライアンス設計の核心

**強制的タイムロックアウト**
1日の指定プレイ時間（25〜30分）を超えると、アプリが自動的にロックされる。これは「やりすぎ防止」と「処方遵守の担保」を同時に達成する設計である。神経発達症の子供は過剰刺激（過集中）になりやすく、適切な終了点の提供が治療的に重要となる。

**親モニタリングアプリとの連携**
別アプリ「EndeavorOTC」を通じて親が症状変化を追跡できる。子供のプレイデータと親の行動観察が紐づくことで、临床的な対話のトリガーを生み出している。

**プッシュリマインダーの使用**
子供および親の両方へ「今日のセッション」リマインダーを送信。親への通知が実質的なコンプライアンス強制として機能している。

**FDA臨床試験における遵守率**
4週間の試験において子供たちは平均週5日・1日25分のセッションを完了した（試験設計が遵守率の高さを前提としているため、正確な離脱率の公開データは限定的）。一般的な小児認知行動療法の脱落率は効果研究で28.4%、実装研究で50%に達する。

**Manasへの示唆**: Manasはセーフティシステムとして FrustrationDetector を実装しているが、「適切な終了設計（セッション完了後に画面が自然に閉じる）」と「親への完了通知」が未実装である。特にADHD特性を持つ子供では、自己調整による終了が困難なケースがあり、EndeavorRxのタイムロックアウト発想をManasに取り込む価値がある。

---

### 2.5 Habitica

#### 概要
HabiticaはタスクをRPG（ロールプレイングゲーム）化する習慣形成アプリ。全世界400万ユーザー、30日継続率はプロダクティビティカテゴリのトップアプリ水準。

#### エンゲージメントメカニクス

**行動→ゲーム報酬の直接接続**
タスク完了でキャラクターがEXP・ゴールドを獲得し、失敗するとHP（ヒットポイント）が減少する。この正負両方の即時フィードバックがHabiticaの特徴。ただし神経発達症の子供には「失敗ペナルティ」は逆効果になるため、ManasはHabiticaのポジティブ側のみを参照すべきである。

**社会的コミットメント**
パーティ機能によりフレンドが同じクエストに参加。自分が失敗すると仲間のHPも減る設計は社会的責任感を活用するが、子供向けには注意が必要。

**可変報酬**
ランダムドロップ（装備、ペット）が変動比率強化スケジュールを実現しており、神経科学的に最も依存性の高い強化パターン。研究では「報酬の予測不可能性と不確実性」がドーパミン応答と好奇心を最大化することが確認されている。

**Manasへの示唆**: StageCelebration の `isSpecialReward = Math.random() < 0.3` はすでに可変報酬の概念を実装しているが、「何がスペシャルか」の実体が `SparkleIcon + テキスト` のみである。報酬の種類と実体（例：新しいLunaの表情やポーズ、スペシャルBGM）を充実させることで効果が高まる。

---

### 2.6 Forest（フォレスト）

#### 概要
Forestは集中時間中にスマートフォンを置くと仮想の木が成長するアプリ。2018年Google Play ベストセルフ改善アプリ（9カ国）。

#### 植物成長メタファーの設計

**進行の可視化**
集中セッション = 木の成長という直感的なメタファーにより、ユーザーは「どれだけ続けたか」を森の豊かさとして視覚的に把握できる。

**失敗の可視化（エラーコスト）**
アプリを離れると木が枯れる。これは損失回避の感情を視覚化した設計であり、「せっかく育てた木を枯らしたくない」という動機を生む。ただしペナルティが「失敗の記録」として残ることへの心理的負担も存在する。

**コインと木の種類**
集中時間に応じてコインを獲得し、新しい木の種を解除できる。コレクション欲求を継続動機に変換する設計。

**Manasへの示唆**: Manasは「植物を育てるストリーク設計」を採用予定と理解しているが、具体的な実装は現時点では確認できなかった（TopStatusBarにはFireIconによる日数表示のみ）。Forestの設計から学ぶべきは「成長の可視化」と「失敗の柔らかい可視化（枯れた植物を復活できるメカニクス）」である。

---

### 2.7 ClassDojo

#### 概要
ClassDojoは教師・保護者・子供をつなぐ教育プラットフォーム。2024年にディストリクト（学区）レベルへの展開を開始。

#### 親エンゲージメント設計

**リアルタイム行動通知**
教師が子供の行動にポイントを付与すると即時に親へ通知される。この「トランスペアレントな進捗共有」が家庭でのサポート行動を促進する。

**コミュニケーションの翻訳機能**
多言語翻訳機能により言語バリアを超えた親参与を実現。翻訳メッセージ受信後の親の返答率が劇的に向上したと報告されている。

**学校行事のプッシュリマインダー**
保護者へのリマインダー送信により、家庭と学校の接点を増やす。

**Manasへの示唆**: 現在のManasダッシュボードは子供（または代理の親）が確認する設計だが、**親専用の「今日のレポート」プッシュ通知**が欠如している。ClassDojoの成功は「親が毎日アプリを開く理由」を作ることにある。Manasに「今日〇〇ちゃんが□□に挑戦しました」という親向けの1日1通サマリを実装することで、家庭での声掛けとアプリ継続を連動させられる。

---

## 3. 比較表

### 3.1 エンゲージメントメカニクス比較

| 機能 | Duolingo | Khan Academy Kids | CogniFit | EndeavorRx | Habitica | Forest | Manas（現状） |
|---|---|---|---|---|---|---|---|
| 日次ストリーク | ✅ 損失回避設計 | ✅ 緩やか | ❌ | ❌ | ✅ | ✅ 視覚的 | ✅ FireIcon（日数のみ） |
| ストリーク保護 | ✅ Freeze（有料） | ❌ | ❌ | N/A | ✅ ヒーリング | ❌ | ❌ **未実装** |
| 可変報酬 | ✅ 多種 | ✅ コレクション | ❌ | ❌ | ✅ ランダムドロップ | ✅ 木の種 | △ 30%確率SPボーナス |
| ホーム画面ウィジェット | ✅ iOSウィジェット | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ **未実装** |
| 親向けレポート | ❌ | ✅ 保護者ダッシュ | ✅ 医師送信 | ✅ 別アプリ | ❌ | ❌ | △ ダッシュのみ（通知なし） |
| キャラクター感情連動 | ✅ Duo擬人化 | ✅ Kodi Bear | ❌ | ❌ | ✅ アバター | ❌ | ✅ Luna/Mogura |
| マスタリー学習 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ DTT基準 |
| セッション時間制限 | ❌ | ✅ 3-5分設計 | △ 推奨のみ | ✅ 強制ロックアウト | ❌ | ✅ タイマー | △ 推定5-10分 |
| プッシュ通知 | ✅ 高度に最適化 | ✅ | ❌ | ✅ 子+親 | ✅ | ❌ | ❌ **未実装** |
| 社会的要素 | ✅ リーグ/フレンド | ❌ | ❌ | ❌ | ✅ パーティ | ✅ 協力モード | ❌ |
| 段階的進捗マップ | ✅ ツリー表示 | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ StageMap |

### 3.2 子供向けUX設計原則の準拠状況

| UX原則 | 推奨値・方針 | Manas現状 | 評価 |
|---|---|---|---|
| タッチターゲットサイズ | 最小48×48dp、理想64px以上 | `tap-target`クラスで対応 | ✅ |
| ボタン間隔 | 64px以上のギャップ | 未測定 | △ 要確認 |
| セッション時間 | 3〜5分 | 推定5〜10分 | △ やや長い可能性 |
| 否定的フィードバック禁止 | ×マーク・赤色なし | FrustrationDetector + ポジティブのみ | ✅ |
| 即時フィードバック | タスク完了直後 | VisualFeedback、サウンド | ✅ |
| 過剰視覚刺激の回避 | 情報密度を抑える | 宇宙テーマ（暗め、落ち着いた配色） | ✅ |
| 自律感の提供 | 選択肢を与える | `select`ページでフリープレイ | ✅ |
| 親モニタリング機能 | 透明性のある進捗共有 | Dashboardあり | △ 通知なし |

---

## 4. Manasの現状との差分分析

### 4.1 実装済みの強み

Manasは認知科学的に堅固な基盤を持つ。

1. **DTT基準のマスタリートラッカー**: 80%正答率×2セッションという証拠に基づく習熟判定。
2. **DDA（動的難易度調整）**: 70〜85%目標正答率の滑動ウィンドウ精度によるリアルタイム難易度調整。
3. **セーフティシステム**: FrustrationDetector（3連続不正解でヒント/デモ表示）、ポジティブのみのフィードバック。
4. **空間反復スケジュール**: Half-Life Regressionによる復習タイミング最適化。
5. **ステージマップ**: 宇宙テーマのビジュアルプログレスマップ（StageMap）。
6. **キャラクター**: LunaとMoguraが感情的なアンカーとして機能。

### 4.2 クリティカルな欠落（チャーンリスク）

コードベース分析の結果、以下の重大な欠落が確認された。

**Gap 1: ストリーク保護機能の不在**

`streak-tracker.ts` はセッション内連続正解（3連続・5連続）を追跡するが、**日次ストリーク（連続プレイ日数）の保護機能**が存在しない。`dashboard/page.tsx` でストリーク日数を計算・表示しているが、ユーザーが1日休んだ場合にストリークが即座にリセットされる仕組みになっている。Duolingoの研究では7日間のストリーク到達後の保護機能こそが長期リテンションの鍵であることが実証されている。

**Gap 2: 親への能動的通知システムの不在**

ダッシュボード（親向け）は存在するが、親が「アプリを開く理由」がない。親は受動的にダッシュボードを確認するだけで、子供の成長に関する**プッシュ通知・メール通知が存在しない**。EndeavorRxとClassDojoの成功事例は、親のエンゲージメントが子供のコンプライアンス（治療遵守）と強相関することを示している。

**Gap 3: ホーム画面ウィジェットの不在**

DuolingoのiOSウィジェットは「ユーザーコミットメント60%向上」をもたらした。Manasはウェブアプリ（Next.js）のため直接的なiOSウィジェットは困難だが、PWA（Progressive Web App）としてのホーム画面追加を促す設計とウェブプッシュ通知が代替手段となる。現状はどちらも未実装。

**Gap 4: 植物ストリークの実体が薄い**

`TopStatusBar` の FireIcon + 日数表示はDuolingoのストリーク表示と同等だが、「植物を育てる」というコンセプトのビジュアライゼーションが未実装（または不完全）。Forestアプリが示すように、成長の可視化こそが「もったいない」感情を生み、離脱を抑止する。

**Gap 5: 報酬の実体の薄さ**

`gems`（宝石）と `lives`（ライフ）が表示されているが、これらを使って何ができるかの明示がない。StageCelebrationの「スペシャルボーナス」も `SparkleIcon` のみで実体がない。可変報酬の心理的効果は「報酬の質と多様性」に依存する。

---

## 5. 具体的な改善提案

### P0: 最優先（次スプリントで実装）

#### P0-1: ストリーク保護バッファの実装

**背景**: Duolingoの研究では、7日ストリーク到達後の離脱率が急減する。しかしManasのターゲット（神経発達症の子供）は体調不良や行事で1日欠かすことが多く、即座のリセットは「もうやりたくない」という挫折感を生む。

**設計案**:
```typescript
// src/features/feedback/daily-streak.ts に追加

interface DailyStreak {
  currentDays: number;
  lastPlayedDate: string; // YYYY-MM-DD
  graceUsedThisWeek: boolean; // 週1回の猶予使用済みフラグ
}

function calculateStreak(sessionDates: string[], today: string): DailyStreak {
  // 1日の欠席を「猶予日」として吸収（週1回まで）
  // 7日以上のストリーク保持者には自動猶予を付与
}
```

**UX設計**:
- 7日以上のストリーク保持者に「1週間に1回の猶予日」を自動付与
- 猶予日を使った翌日に「おやすみしたけどストリーク続いてるよ！」と通知
- 猶予日の消費をLunaが「今週は1回お休みができます」と事前に説明

**期待効果**: Day 7〜30の継続率 +15〜25%（Duolingo実績ベースの推定）

---

#### P0-2: 親向けデイリーサマリ通知（Webプッシュ）

**背景**: 神経発達症の子供のデジタル治療では、親のエンゲージメントが子供のアドヒアランスと強相関する（Frontiers in Psychology, 2024）。

**設計案**:
```
通知内容（保護者へ、夜20時ごろ）:
「[子供の名前]ちゃんが今日3つのゲームに挑戦しました！
 注意力ゲームで新記録が出ました。
 明日も一緒に応援しよう！」
```

**実装方針**:
- Web Push API を使ったブラウザ通知（Next.js + Service Worker）
- 通知内容を3段階でパーソナライズ: 初回プレイ / ストリーク継続 / マスタリー達成
- 親が「通知を受け取る」オプトインをオンボーディング時に設定

**期待効果**: 翌日プレイ率 +20〜30%（ClassDojo / EndeavorRx事例ベース）

---

#### P0-3: セッション時間を3〜5分に最適化

**背景**: Khan Academy Kidsの3〜5分マイクロレッスン設計は完了率を50%向上させた。Manasの現在のステージ設計（複数ゲームを連続プレイ）はセッションが長くなる可能性がある。

**設計案**:
- `stage_trial_count` を年齢グループ別に見直し（就学前: 5試行、小学生: 8〜10試行）
- ステージを1回あたり3〜5分で完了できるよう試行数を調整
- セッション開始時に「約3分で終わります」と所要時間を明示

**実装箇所**: `src/features/stage-system/StageScheduleGenerator.ts` の trial_count 設定を見直す。

---

### P1: 優先度高（次々スプリントで実装）

#### P1-1: 植物ストリークの視覚的実装

**背景**: Forestアプリが示すように、「成長の可視化 + 失敗の柔らかい可視化」が離脱を抑止する最も直感的なメカニズムである。

**設計案**:
```
植物の成長段階（連続プレイ日数に対応）:
Day 1-2:  種（小さなグリーンのドット）
Day 3-6:  芽（2枚の葉）
Day 7-13: 苗（5cm程度の茎と葉）
Day 14-29: 若木（枝と複数の葉）
Day 30+:  大木（満開の木）

失敗（1日休む）: 葉が1枚落ちるアニメーション
回復（猶予使用）: 水をやるLunaのアニメーション
```

**実装方針**:
- SVGアニメーション or Lottieファイルを使った植物成長アニメーション
- Dashboardの上部にストリーク植物を配置（現在のFireIcon + 日数表示を置き換え）
- 子供が毎日プレイしたくなる「今日の植物」状態の確認欲求を設計

#### P1-2: Luna/Moguraのリアクション多様性拡大

**背景**: Khan Academy KidsのKodi Bearが高エンゲージメントを維持できているのは、キャラクターの感情表現が豊かで子供が「キャラクターの気持ち」に共感できるからである。

**設計案**:
- 連続正解5回: Luna「やったぁ！すごすぎる！」+ 特別なジャンプアニメーション
- マスタリー達成: Luna「覚えちゃったね！天才！」+ 花火演出
- 久しぶりのプレイ（3日以上ぶり）: Mogura「会いたかったよ〜！」
- セッション開始時: 当日の挑戦ゲームに合わせた一言（「今日は記憶力の番だよ！」）

**実装箇所**: `src/components/mascot/Luna.tsx` のspeechBubbleとexpressionのバリエーションを拡充。

#### P1-3: 達成バッジシステム（収集メカニクス）

**背景**: Khan Academy KidsとHabiticaの成功に共通する「収集欲求の活用」を実装する。

**設計案**:
```
バッジカテゴリ:
- ストリーク系: 「3日連続の星」「7日連続の月」「30日連続の太陽」
- ゲーム系: 「注意力マスター」「記憶の達人」「言葉の魔法使い」
- 速度系: 「ライトニングプレイヤー（3分以内でクリア）」
- 正確さ系: 「パーフェクト（100%正答）」
```

**実装方針**:
- バッジはSVGアイコンとしてLocalStorageまたはSupabaseに保存
- Dashboardにバッジコレクションセクションを追加
- 新バッジ獲得時にLunaが「新しいバッジをもらったよ！」と演出

---

### P2: 中優先度（ロードマップで検討）

#### P2-1: PWAホーム画面ウィジェット対応

**背景**: DuolingoのiOSウィジェットが+60%のコミットメント向上をもたらした。ManasはNext.jsのWebアプリであるため、PWAマニフェストとService Workerを活用したホーム画面インストール促進が最善策。

**設計案**:
- PWAマニフェスト + installpromptイベントを活用したホーム画面追加の誘導
- インストール後の初回起動時に「今日の植物」の状態をスプラッシュ表示
- Webプッシュ通知と組み合わせて疑似ウィジェット体験を提供

#### P2-2: 兄弟姉妹フレンドストリーク

**背景**: Duolingoの「Friend Streak」は DAUの1/3を社会的コミットメントで束縛している。神経発達症の子供は競争より協力を好む傾向があるため、競争ではなく「一緒に育てる植物」という協力メカニクスを設計する。

**設計案**:
- 同じ家庭の複数の子供アカウントが「家族の庭」を共有して育てる
- 自分の植物に加え、兄弟の植物が隣に成長していく
- 一緒にログインした日は「お揃いの木が生える」特別演出

#### P2-3: 親向け週次進捗レポート（メール配信）

**背景**: CogniFitの医師送信機能のように、保護者が「専門家に見せられる」クオリティのレポートを自動生成する。

**設計案**:
- 毎週月曜日に先週の認知プロフィール変化をメールで送信
- 認知域別の成長グラフ（改善/安定/注意）を絵文字と言語で視覚化
- セラピストや主治医への「共有ボタン」をダッシュボードに追加

#### P2-4: 難易度の「易しい日」オプション

**背景**: EndeavorRxのプロトコルと異なり、Manasは楽しさを維持しながら継続させることが目標。特に体調不良や学校疲れの日に「今日は軽めにやろう」と選べる選択肢が欠如している。

**設計案**:
- セッション開始前に「今日の気分は？」（3択: 元気・普通・疲れた）
- 「疲れた」選択時は DDA の目標正答率を 75〜80% に設定し直し、試行数を半減
- Moguraが「今日は無理しないでね」と声掛け

---

## 6. 優先度まとめ表

| 優先度 | 機能 | 難易度 | 期待リテンション効果 | 参照事例 |
|---|---|---|---|---|
| P0 | ストリーク保護バッファ（猶予日） | Low | +15〜25% / Day 7-30 | Duolingo Streak Freeze |
| P0 | 親向けWebプッシュ通知 | Medium | +20〜30% / 翌日返却率 | EndeavorRx / ClassDojo |
| P0 | セッション時間3〜5分最適化 | Low | +50% / 完了率 | Khan Academy Kids |
| P1 | 植物ストリーク視覚化 | Medium | 離脱抑止（定性） | Forest |
| P1 | Luna/Moguraリアクション拡充 | Low | 愛着形成（定性） | Khan Academy Kids |
| P1 | 達成バッジ収集システム | Medium | +20〜40% / 定期返却率 | Habitica |
| P2 | PWAホーム画面ウィジェット | High | +60%（Duolingo実績ベース） | Duolingo iOS Widget |
| P2 | 家族の庭（協力ストリーク） | High | 社会的コミットメント（定性） | Duolingo Friend Streak |
| P2 | 週次メールレポート（保護者向け） | Medium | 親エンゲージメント向上 | CogniFit / EndeavorRx |
| P2 | 易しい日モード | Low | 悪天候日の離脱防止 | オリジナル |

---

## 7. 出典リスト

### Duolingo関連
- [Duolingo Q4/FY2024 Shareholder Letter (SEC)](https://investors.duolingo.com/static-files/99006c40-d8cf-41ca-b5b1-c5cb1fa5ba88) — DAU/MAU 34.7%、DAU 4,050万の根拠
- [Duolingo Surpasses 50M DAU (Q3 2025)](https://investors.duolingo.com/news-releases/news-release-details/duolingo-surpasses-50-million-daily-active-users-grows-dau-36) — 成長継続データ
- [Duolingo Streak Feature: App Engagement & Growth (Sensor Tower)](https://sensortower.com/blog/duolingo-streak-feature-app-engagement-growth) — ストリーク効果データ
- [Duolingo Leagues & Leaderboards (Duolingo Blog)](https://blog.duolingo.com/duolingo-leagues-leaderboards/) — リーグシステム公式解説
- [Duolingo Widget Feature (Duolingo Blog)](https://blog.duolingo.com/widget-feature/) — iOS/Androidウィジェット導入効果
- [How Duolingo Reignited User Growth (Lenny's Newsletter)](https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth) — DAU成長戦略の詳細
- [The Psychology Behind Duolingo's Streak Feature](https://www.justanotherpm.com/blog/the-psychology-behind-duolingos-streak-feature) — 損失回避心理の解説
- [Duolingo Streak System Breakdown (Medium)](https://medium.com/@salamprem49/duolingo-streak-system-detailed-breakdown-design-flow-886f591c953f) — ストリーク設計の詳細
- [Duolingo Gamification Secrets (Orizon)](https://www.orizon.co/blog/duolingos-gamification-secrets) — エンゲージメント指標一覧
- [Duolingo's Gamified Growth: $14B Habit (Medium)](https://medium.com/@productbrief/duolingos-gamified-growth-how-a-green-owl-turned-language-learning-into-a-14-billion-habit-d47d9fa30a77) — 総合的なゲーミフィケーション分析

### Khan Academy Kids関連
- [Khan Academy Kids (公式サイト)](https://www.khanacademy.org/kids) — 基本情報
- [Khan Academy Kids Review (Common Sense Education)](https://www.commonsense.org/education/reviews/khan-academy-kids) — 独立評価・UX分析
- [Understanding Khan Academy Kids (edu.com)](https://www.edu.com/blog/understanding-khan-academy-kids-a-complete-guide-for-k-2-teachers-and-parents) — 設計詳細

### CogniFit関連
- [CogniFit 4.0 Release (CogniFit Blog)](https://blog.cognifit.com/cognifit-4-0-the-new-version-of-cognifits-cognitive-testing-and-training-app/) — 2024年8月のアップデート
- [CogniFit Expert Review (MindTools.io)](https://mindtools.io/programs/cognifit/) — 独立評価・課題分析
- [AI Revolutionizing Brain Training (CogniFit Blog)](https://blog.cognifit.com/revolutionizing-brain-training-with-data-driven-personalization/) — AI個別化設計

### EndeavorRx関連
- [EndeavorRx FDA De Novo Classification (FDA)](https://www.accessdata.fda.gov/cdrh_docs/reviews/DEN200026.pdf) — FDA承認文書（コンプライアンス設計の根拠）
- [EndeavorRx 公式サイト](https://www.endeavorrx.com/) — 基本情報・治療プロトコル
- [Pediatric Applications of Digital Therapeutics (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12495783/) — 小児デジタル治療のシステマティックレビュー

### Habitica・Forest・ClassDojo関連
- [Habitica Gamification Case Study (Trophy)](https://trophy.so/blog/habitica-gamification-case-study) — エンゲージメント設計分析
- [Forest App 公式サイト](https://www.forestapp.cc) — 機能説明
- [ClassDojo and Parent Engagement (EdWeek)](https://www.edweek.org/leadership/the-good-and-the-bad-of-using-apps-to-connect-with-parents/2024/04) — 2024年の親エンゲージメント分析

### 子供向けUX・神経発達症関連
- [Designing UI/UX for Children with Autism in Touch Devices (Otsimo Blog)](https://medium.com/otsimo/designing-ui-ux-for-children-with-autism-in-touch-devices-bdd4c7741586) — ASD向けUI設計原則
- [Designing for Children with ADHD (UX Magazine)](https://uxpamagazine.org/designing_children_adhd/?lang=en) — ADHD向けUX原則
- [Effectiveness of Gamified Educational Application for ADHD (Frontiers in Education, 2025)](https://www.frontiersin.org/journals/education/articles/10.3389/feduc.2025.1668260/full) — 8週間RCT研究
- [Reward Feedback in VR for ADHD (JMIR Serious Games, 2025)](https://games.jmir.org/2025/1/e67338) — 報酬設計の効果
- [Mobile Game Prototype for ADHD (PMC, 2024)](https://pmc.ncbi.nlm.nih.gov/articles/PMC11164876/) — ADHD向けゲーム設計
- [Parent Engagement in eHealth for NDD (Frontiers in Sleep, 2024)](https://www.frontiersin.org/journals/sleep/articles/10.3389/frsle.2024.1455483/full) — 親エンゲージメントと遵守率
- [Intangible vs Tangible Rewards in Gamified Learning (BJET, 2024)](https://bera-journals.onlinelibrary.wiley.com/doi/10.1111/bjet.13361) — 外発vs内発動機研究
- [Gamification Enhances Intrinsic Motivation (Springer, 2023)](https://link.springer.com/article/10.1007/s11423-023-10337-7) — メタ分析

### スペーシングリピティション関連
- [A Trainable Spaced Repetition Model (Settles & Meeder, Duolingo, 2016)](https://research.duolingo.com/papers/settles.acl16.pdf) — Half-Life Regressionの原論文
- [Spaced Repetition Learning Guide 2024](https://zenfidelearning.com/spaced-repetition-learning-2024/) — 最新の実装ガイド

---

*本報告書はManasのTeammate 2（UX・エンゲージメント設計）が2026-03-02に作成しました。引用データは公開されている一次ソースおよび査読論文に基づいています。リテンション数値の予測値は参照プロダクトの実績から類推したものであり、Manasの実際の効果は対象ユーザー（神経発達症の子供）の特性により異なる可能性があります。*
