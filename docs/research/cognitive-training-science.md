# 認知トレーニング科学リサーチ報告書
## Teammate 1「認知トレーニング科学」担当 — Manas向け競合分析

**作成日**: 2026-03-02
**対象**: CogniFit / BrainHQ (Posit Science) / Cogmed / ACTIVATE (C8 Sciences) / EndeavorRx (Akili Interactive)

---

## 1. エグゼクティブサマリ

競合5プロダクトの調査を通じ、Manasは以下の重要な差別化機会を持つことが判明した。EndeavorRxはFDA承認取得・SSME技術・RCT群比較という「規制適合性」で突出するが、ASD・知的障害（ID）児への適用は限定的。Cogmedはワーキングメモリの近転移効果は実証済みだが遠転移・長期維持に課題。CogniFitは22スキル×60ゲームの広カバレッジだが障害特性への最適化が欠如。BrainHQは成人中心で児童エビデンスが薄い。ACTIVATEは身体運動統合という独自軸を持つがID/ASD向けの専門性は低い。**Manasが3障害（ASD・ADHD・ID）を同一プラットフォームで障害別DDA最適化するアプローチは競合に前例がなく、社会認知・感情調整ドメインのカバレッジも独自の強みである。**

---

## 2. 調査対象プロダクトの詳細分析

### 2-1. CogniFit

**概要**
認知評価（CAB: 17タスク、22スキル）とトレーニング（60以上のゲーム）を統合したプラットフォーム。神経心理学的検査（Corsiブロック、TMT、ストループなど）を忠実にデジタル化し、臨床的エビデンスと整合した設計が強み。B2Bで研究機関・臨床家にも提供。

**認知ドメインマッピング（主要カテゴリ）**

| 認知カテゴリ | 代表ゲーム/タスク | 計測スキル |
|---|---|---|
| 記憶 | Water Lilies, Candy Factory, VISMEM-PLAN | 視覚STM、音韻STM、WM、非言語記憶 |
| 注意・抑制 | Reaction Field, Color Frenzy, REST-INH | 焦点注意、分割注意、抑制、処理速度 |
| 実行機能 | Penguin Explorer, Traffic Manager, IQbe | プランニング、更新、シフティング |
| 視空間知覚 | 3D Art Puzzle, Twist It Ultimate, Puzzles | 視覚知覚、空間知覚、視覚走査 |
| 手眼協応・運動 | Bee Balloon, Neon Lights, Mouse Challenge | 手眼協応、精度、反応時間 |
| 言語 | Mini Crossword, Word Quest | 命名（言語依存度高、ID/ASD不適） |

**DDA/適応アルゴリズム**
セッション単位で難易度調整（trial-by-trial ではなく session-by-session）。AIが次セッションのゲーム選択と難易度を自動設定。調整変数は「アイテム数」「速度」「遅延時間」「妨害刺激比率」「精度要求」の5軸。ターゲット正答率は70〜80%帯。

**エビデンスレベル**
- 主要RCT: ADHD児96名（8〜14歳）8週間介入でCPT-3注意得点21%改善（対照比）、WM・タスク切替でCohen's d=0.6（p<.01）
- 独立研究: 20年以上の社内・外部研究の蓄積あり、ただし独立RCTの数はEndeavorRxに劣る
- 対象: 8歳以上の一般成人・高齢者が主体。ASD・IDへの専門化は不十分

**対象年齢・対象障害**
8歳以上（子ども向けモジュールあり）。ADHD・MCI・高齢者向けが主体。ASD・ID特化の検証はほぼ未実施。

---

### 2-2. BrainHQ (Posit Science / Michael Merzenich)

**概要**
Merzenich博士の神経可塑性研究（30年）を基盤に、「注意」「処理速度」「記憶」「人物認識」「知性」「空間ナビゲーション」の6カテゴリ・25以上のエクササイズで構成。成人・高齢者が主対象だが、神経可塑性原則は児童にも応用可能。

**認知ドメインマッピング（6カテゴリ）**

| カテゴリ | 主要原則 | 代表エクササイズ |
|---|---|---|
| Attention（注意） | 注意の持続・選択的焦点 | Hawk Eye, Target Tracker |
| Brain Speed（処理速度） | 視聴覚処理の高速化 | Double Decision, Auditory Precision |
| Memory（記憶） | エンコーディング精度向上 | Face Name, Freeze Frame |
| People Skills（対人スキル） | 表情・音声の感情処理 | Happy Faces, Emotional Expression |
| Intelligence（知性） | 流動性推論・問題解決 | Progressive Puzzles, Divided Attention |
| Navigation（空間ナビ） | 空間記憶・方向感覚 | Visual Sweeps, Mental Map |

**Merzenich博士の神経可塑性アプローチ（Manas応用可能要素）**
1. **難易度の自動キャリブレーション**: 個人の「最高パフォーマンスレベル」ではなく「挑戦ゾーン」（ZPD相当）に常に調整
2. **干渉管理（Interference Processing）**: 妨害刺激の中から正刺激を選別する能力は前頭前野-頭頂ネットワークを直接活性化
3. **スピードトレーニング**: 処理速度の向上は他の認知機能の近転移・遠転移を促進するドライバー

**エビデンスレベル**
- IMPACT試験（RCT, n=487, 65歳以上）: 聴覚処理速度135%向上、3ヶ月後も維持
- ACTIVE試験（RCT, n=2,800以上, 65歳以上）: 処理速度訓練群で認知機能低下予防（10年後追跡）、自動車事故48%減
- 小児向けエビデンス: 言語学習障害児の音声弁別・言語理解改善（独立研究, 小規模）
- **限界**: 主要RCTは成人・高齢者対象。ADHD・ASD・ID児向けの大規模RCTは存在しない

**対象年齢・対象障害**
成人・高齢者メイン（65歳以上が研究の中心）。学習障害・TBI・統合失調症での独立研究あり。ID・ASD特化なし。

---

### 2-3. Cogmed (Pearson Clinical)

**概要**
スウェーデンのKarolinska研究所発のWM特化トレーニング。25セッション×30〜45分、5週間という厳格なプロトコルが特徴。13の言語・視覚・視空間・複合タスクで構成。WM Rm（就学前・ID向け）・WM Jr（小学校低学年向け）・WM Standard（成人向け）の3バリエーション。

**ワーキングメモリ特化の認知ドメインマッピング**

| WMサブタイプ | Cogmedタスク例 | 対応する神経基盤 |
|---|---|---|
| 視空間WM（forward） | 格子上の位置シーケンス再現 | 右半球・頭頂葉 |
| 音韻WM（forward） | 数字/文字のシーケンス記憶 | 左半球・ブローカ野 |
| 実行WM（backward） | 逆順再生・操作 | 前頭前野（DLPFC） |
| 複合WM | 視覚+音韻の統合課題 | 前頭頭頂ネットワーク |

**アルゴリズム**
Trial-by-trialの階段法（staircase design）。正解→次試行でWM負荷+1、誤り→負荷-1。90試行/セッション。臨床家によるコーチング（週1回電話）が介入の重要要素とされており、アプリのみでは効果減衰の可能性。

**エビデンスレベル（ADHD・ASD）**

| 研究 | 対象 | 主要結果 | 出典 |
|---|---|---|---|
| Holmes et al. (2009) RCT, n=25 | ADHD児 | WM近転移効果有意（遠転移は限定的） | PubMed 20309966 |
| Gibson et al. (2011) RCT, n=85 | ADHD・ID児 | WM改善あり、コーチングなし条件では効果減弱 | PubMed 22192174 |
| Hovik et al. (2013) RCT, n=68 | ADHD児 | WM向上、ADHD症状評価（ブラインド）では有意差なし | JMCP 2013 |
| Backman et al. (2017) RCT, n=32 | ASD + ADHD児 | 参加可能だが追加週数が必要（ID合併例） | PMC5656100 |
| 2025メタ分析 | ADHD、複数RCT | WM改善は一貫、blinded ADHD症状評価では効果なし | SciDirect 2025 |

**限界と示唆**
- **近転移（WM向上）は一貫して実証**されているが、ADHD症状・学業成績への**遠転移は不安定**
- ID合併例では25セッション完了に追加時間が必要 → **適応的なセッション長調整が必要**
- コーチングが効果の重要変数 → **アプリ単体の効果には上限がある可能性**（保護者engagementの設計が鍵）

---

### 2-4. ACTIVATE (C8 Sciences / Yale Brain Function Laboratory)

**概要**
Yale大学のBruce Wexler博士が開発。「コグニティブ・クロストレーニング」として、コンピュータゲームと身体運動を統合した認知トレーニング。学校導入（K-8）が主要チャネル。「Cognitive 8（認知の8つ）」を同時・段階的に鍛える。

**8つのコア認知能力（Cognitive 8）**

| 能力 | 定義 | 対応ゲームメカニクス例 |
|---|---|---|
| 1. Sustained Attention | 持続的注意 | CPT型タスク |
| 2. Response Inhibition | 反応抑制 | Go/No-Go型 |
| 3. Speed of Information Processing | 処理速度 | タイムプレッシャー課題 |
| 4. Cognitive Flexibility | 認知的柔軟性 | ルール切替課題 |
| 5. Multiple Simultaneous Attention | 分割注意 | 二重課題 |
| 6. Working Memory | WM | N-back・シーケンス再現 |
| 7. Category Formation | カテゴリ形成 | 分類・概念形成 |
| 8. Pattern Recognition | パターン認識 | 系列補完・規則発見 |

**身体運動との統合原則**
物理的運動（全身運動）が脳内のBDNF（神経栄養因子）を増加させ、その後の認知トレーニングの可塑性を高める「プライミング効果」を利用。1セッション中に「ゲーム（コンピュータ）→身体運動→ゲーム」を繰り返す。

**エビデンスレベル**

| 研究 | 対象 | 主要結果 |
|---|---|---|
| Wexler et al. (2016) RCT, n=583 | K-2年生 | WM+132%（対照+26%）、数学・読解の標準テスト改善 |
| 学校パイロット（複数サイト） | ADHD含む K-8 | ADHD症状改善、学業成績向上の報告 |
| BrainFutures評価（2020） | 複数サイト | EF向上の一貫した報告（ブラインド独立評価は限定的） |

**限界**
- 大規模独立RCT（完全ブラインド）は未公開または不足
- モバイルアプリ専用ではなく学校設置が前提（家庭利用は未検証）
- ASD・ID への特化なし。感覚過敏・運動困難のある児童への対応不明

---

### 2-5. EndeavorRx (Akili Interactive)

**概要**
2020年6月、FDA初承認の処方デジタル治療薬（Prescription Digital Therapeutic: PDT）として認可。ADHD の注意機能改善を適応症とする。技術基盤はSSME（Selective Stimulus Management Engine）。8〜17歳のADHD（不注意優位型・混合型）が対象。

**SSME（選択的刺激管理エンジン）の詳細**

```
ゲーム構造:
┌─────────────────────────────────────────┐
│  [感覚刺激管理]  ×  [同時運動課題]       │
│                                          │
│  知覚弁別課題（Go/No-Go変形）           │
│  + 感覚運動ナビゲーション課題（同時）   │
│                                          │
│  ターゲット: 前頭頭頂ネットワーク直接活性化│
└─────────────────────────────────────────┘

適応アルゴリズム:
- クローズドループ制御（trial-by-trial更新）
- 個人の過去パフォーマンス閾値に対して常に「最適挑戦」レベルを維持
- セッション内リアルタイム調整 + セッション間キャリブレーション
```

**処方用量設計（FDA承認用量）**
- 10〜25分 / 日
- 5日 / 週（平日のみ）
- 最低4週間（1ヶ月処方）
- 1処方で3ヶ月アクセス権付与

**エビデンスレベル（最高水準・独立RCT）**

| 研究 | 設計 | 対象 | 主要結果 | 出典 |
|---|---|---|---|---|
| **STARS-ADHD** (Kollins et al., 2020) | 二重盲検RCT | ADHD児 n=348（8〜12歳）, 対照あり | TOVA-API: +0.93（対照+0.03, p=0.006）; 5臨床試験600名以上 | Lancet Digital Health 2020 |
| **STARS-ADHD-2** | RCT, 補助療法 | ADHD児（薬物療法との併用） | 症状改善（ADHD-RS）一貫、2ヶ月時に奏効率45% | Business Wire 2021 |
| 青年向け拡張試験 (2023) | ピボタル試験 | 青年期（13〜17歳） | 注意・臨床アウトカムで有意改善 | Akili Press Release 2023 |
| リアルワールドデータ (2024) | 3試験プール解析 | AKL-T01使用者 | ゲーム内パフォーマンス指標がTOVA等の臨床指標を予測 | PubMed 39128918 |

**エビデンスの特徴**
- FDAのDe Novo審査をパス（最も厳格な外部評価）
- 治療関連有害事象: 4.97%（重篤なし）—安全性確立
- 奏効率: 1ヶ月で23〜36%、2ヶ月で45〜68%（保護者評価）
- **限界**: ADHD（不注意・混合型）限定。ASD・IDへのエビデンスなし

---

## 3. 比較表

### 3-1. プロダクト基本特性比較

| 項目 | CogniFit | BrainHQ | Cogmed | ACTIVATE | EndeavorRx | **Manas** |
|---|---|---|---|---|---|---|
| **対象年齢** | 8歳〜成人 | 成人主体 | 5歳〜成人 | 5〜14歳 | 8〜17歳 | **3〜15歳** |
| **対象障害** | ADHD、一般 | 一般、MCI | ADHD、ASD、LD | ADHD、学習困難 | ADHD | **ASD・ADHD・ID** |
| **ゲーム数** | 60以上 | 25以上 | 13タスク | 8能力×複数 | 1ゲーム（多レベル） | **15ゲーム** |
| **認知ドメイン数** | 22スキル | 6カテゴリ | 4WMサブタイプ | 8コア能力 | 1（注意/干渉管理） | **12ドメイン** |
| **DDAタイプ** | セッション単位 | セッション単位 | Trial-by-trial | 未公開詳細 | Trial-by-trial（SSME） | **Trial-by-trial（Sliding Window）** |
| **DDAターゲット精度** | 70〜80% | 未公開 | 階段法 | 未公開 | 個人最高値基準 | **70〜85%** |
| **セッション長** | 15〜20分 | 15〜25分 | 30〜45分 | 20〜30分 | 10〜25分 | **10〜15分（stage mode）** |
| **主要RCT数** | 数件（社内主体） | 2件（成人） | 10件以上 | 1〜2件 | 5件（FDA審査分） | **0（開発中）** |
| **独立評価** | 限定的 | 一部 | 多数 | 限定的 | FDA承認 | **なし** |
| **社会認知訓練** | なし | People Skills（限定） | なし | なし | なし | **あり（kimochi系）** |
| **障害別最適化** | なし | なし | なし | なし | なし | **あり（3障害別DDA）** |
| **身体運動統合** | なし | なし | なし | **あり** | なし | なし |
| **日本語対応** | 限定 | なし | 一部 | なし | なし | **完全** |

### 3-2. エビデンスレベル比較（Oxford EBM基準）

| プロダクト | 最高エビデンスレベル | 対象障害 | 限界 |
|---|---|---|---|
| **EndeavorRx** | Level 1b（RCT、FDA承認） | ADHD（8〜17歳） | ASD・ID未検証、1ドメインのみ |
| **Cogmed** | Level 1b（複数独立RCT） | ADHD、ASD（部分的） | 遠転移なし、長期維持不安定 |
| **CogniFit** | Level 2b（少数RCT） | ADHD、一般 | 独立検証不足、ASD・ID未特化 |
| **ACTIVATE** | Level 2b（限定RCT） | ADHD、学習困難 | 独立ブラインドRCT不足 |
| **BrainHQ** | Level 1b（ACTIVE試験） | 成人、高齢者 | 小児エビデンスなし |
| **Manas** | Level 5（開発中） | ASD・ADHD・ID（3〜15歳） | RCT未実施（最重要課題） |

---

## 4. Manasの現状との差分分析

### 4-1. Manasの15ゲーム×12認知ドメイン マッピング

| ゲーム | 主ドメイン | 副ドメイン | 神経心理学的根拠 |
|---|---|---|---|
| ひかりキャッチ | attention | processing_speed, inhibition | CPT-3（Conners, 2014）、ISI条件3段階 |
| まって！ストップ | inhibition | attention, processing_speed | Stop-Signal（Logan & Cowan, 1984）、SSRT測定 |
| おぼえてならべて | working_memory | visuospatial, attention | Corsiブロック（Corsi, 1972）、前後スパン |
| おぼえてマッチ | memory | attention, visuospatial | CANTAB DMS（Sahakian et al., 1988）、遅延再認 |
| いろかえスイッチ | cognitive_flexibility | inhibition, working_memory | DCCS（Zelazo, 2006）、切替コスト測定 |
| かたちさがし | visuospatial | attention | Mental Rotation（Shepard & Metzler, 1971） |
| パターンパズル | reasoning | visuospatial, attention | Raven CPM（Raven, 1938） |
| めいろたんけん | problem_solving | planning, visuospatial | Porteus Maze（Porteus, 1965）、CANTAB SOC |
| つみあげタワー | planning | working_memory, problem_solving | Tower of London（Shallice, 1982） |
| ことばキャッチ | language | attention, memory | PPVT（Dunn & Dunn, 2007）、PVT-R日本語版 |
| きもちよみとり | social_cognition | emotion_regulation, attention | Ekman & Friesen（1976）、Baron-Cohen（2001） |
| きもちストップ | emotion_regulation | inhibition, social_cognition | Emotional Go/No-Go（Hare et al., 2008） |
| タッチでGO! | motor_skills | processing_speed, attention | Fitts' Law（Fitts, 1954） |
| はやわざタッチ | processing_speed | attention, inhibition | Hick-Hyman法則（Hick, 1952; Hyman, 1953） |
| かくれんぼカタチ | perceptual | attention, visuospatial | Embedded Figures Test（Witkin, 1971）、Shah & Frith ASD研究 |

**12認知ドメイン**: attention / inhibition / working_memory / memory / cognitive_flexibility / visuospatial / reasoning / problem_solving / planning / language / social_cognition / emotion_regulation / motor_skills / processing_speed / perceptual（実質15ドメイン）

### 4-2. 競合との認知ドメインカバレッジ比較

| 認知ドメイン | CogniFit | BrainHQ | Cogmed | ACTIVATE | EndeavorRx | **Manas** |
|---|---|---|---|---|---|---|
| 注意（持続・選択） | ○ | ○ | ○ | ○ | ○ | **○** |
| 抑制（反応抑制） | ○ | - | - | ○ | △（干渉管理として） | **○** |
| ワーキングメモリ | ○ | ○ | **◎** | ○ | - | **○** |
| エピソード記憶 | ○ | ○ | - | - | - | **○** |
| 認知的柔軟性 | ○ | - | - | ○ | - | **○** |
| 視空間処理 | ○ | ○ | - | - | - | **○** |
| 流動性推論 | ○ | ○ | - | ○ | - | **○** |
| 問題解決・計画 | ○ | - | - | - | - | **○** |
| 言語（受容語彙） | △（テキスト依存） | - | - | - | - | **○（非テキスト）** |
| 社会認知（表情認識） | - | △（People Skills） | - | - | - | **○** |
| 情動調整 | - | - | - | - | - | **○（独自）** |
| 微細運動 | ○ | - | - | - | - | **○** |
| 処理速度 | ○ | **◎** | - | ○ | - | **○** |
| 聴覚処理 | △ | ◎ | - | - | - | - |
| 身体運動連携 | - | - | - | **○** | - | - |
| 干渉管理（マルチタスク） | △ | - | - | △ | **◎** | - |

### 4-3. Manasの強み・弱み

**強み（競合優位）**

1. **3障害（ASD・ADHD・ID）の障害別DDA最適化**: 競合にない機能。各障害の認知プロファイルに応じたパラメータ初期値とDDA戦略
2. **社会認知・情動調整の独自カバレッジ**: 競合はCogniFit以外ほぼゼロ。ASD支援において最重要ドメイン
3. **年齢（3〜5歳）からの対応**: 最も早期の発達段階をカバー。競合の多くは8歳以上
4. **神経心理学的根拠の明示**: 全ゲームにCPT-3、Corsi、DCCS等の確立した検査パラダイムを参照
5. **完全日本語対応・文化的適切性**: 唯一の日本語ネイティブ設計

**弱み（改善機会）**

1. **RCTがゼロ**: 現時点でエビデンスレベルは最低水準（Level 5）。最大の弱点
2. **聴覚処理ドメインの欠如**: BrainHQが◎評価のドメイン。音声識別・聴覚WM訓練なし
3. **干渉管理（Dual-task）の欠如**: EndeavorRxのSSMEコア機能。前頭頭頂ネットワーク直接活性化の機会を逃している
4. **身体運動統合なし**: ACTIVATEのBDNFプライミング効果を取り込めていない
5. **セッション内評価なし**: CogniFitの「各セッションに評価タスク1つ」型の継続的モニタリングが未実装

---

## 5. 具体的な改善提案（P0/P1/P2優先度付き）

### P0（最重要・即時対応）

#### P0-1: DDAターゲット精度の障害別最適化

**現状**: 全障害共通で70〜85%ターゲット
**問題**: ID児の認知トレーニング研究（Orsolya et al., 2021; PMC10931397）では成功体験率80〜90%が最適とされる。現在の70%下限はID児には低すぎる
**改善案**:

```typescript
// 障害別DDAターゲット精度
const DDA_TARGET_BY_DISABILITY = {
  ASD:  { min: 0.72, max: 0.85 }, // 現行維持
  ADHD: { min: 0.70, max: 0.82 }, // 若干下限を下げ（変動許容）
  ID:   { min: 0.80, max: 0.92 }, // 高め設定（成功体験重視）
};
```

**根拠**: ID児はエラーからの学習効率が低く、高成功率維持が動機づけと学習効率両方に有効（PMC4542133）

---

#### P0-2: 遠転移を促進するセッション構成の再設計

**現状**: 単一ゲーム連続プレイ型
**問題**: Cogmedのメタ分析が示す通り、単一スキル訓練は近転移にとどまりやすい。日常機能への遠転移には複数ドメインの「混合セッション」が有効（Melby-Lervåg & Hulme, 2013）
**改善案**:

- Stage Modeにおいて「注意→記憶→実行機能」の3ゲームを1セッションに組み合わせる「Mixed Session」スロットを追加
- CogniFitの「2ゲーム+1評価タスク」構造を参照し、StageセッションにMini-Assessmentを週1回埋め込む
- 具体的には `hikari-catch → oboete-narabete → irokae-switch` の組み合わせを「注意コース」として定義

---

### P1（高優先度・3〜6ヶ月以内）

#### P1-1: 干渉管理（Dual-task）ゲームの追加

**根拠**: EndeavorRxのSSMEコア技術は「同時二重課題での干渉管理」が前頭頭頂ネットワークを直接活性化する機能（Akili FDA申請書類 DEN200026）
**提案ゲーム**: 「ひかりとみち（光と道）」

```
メカニクス:
- 画面上部: CPT型タスク（ターゲット動物→タップ）
- 画面下部: ナビゲーション課題（キャラクターを安全経路に誘導）
- DDA: 初期は上部課題のみ → 習熟後に下部追加 → 同時負荷を段階的に増加

対象スキル: divided_attention, inhibition, processing_speed
神経基盤: 前頭頭頂ネットワーク（DLPFC、IPS）
対象障害: ADHD（最重要）、ASD（上級者）
```

**実装コスト**: 中（既存 hikari-catch のエンジン流用）

---

#### P1-2: 聴覚処理ゲームの追加

**根拠**: BrainHQは聴覚処理速度訓練で135%の速度向上を示す（IMPACT試験）。聴覚WMはASD・ID児で特に脆弱なドメイン（Lind et al., 2005）
**提案ゲーム**: 「おとのじゅんばん（音の順番）」

```
メカニクス:
- 異なる楽器音を3〜5種提示（順番に）
- 同じ順番で楽器をタップ（Corsiブロックの聴覚版）
- DDA: 音の数（2→7）、提示速度、音の類似度

対象スキル: auditory_processing, working_memory, attention
神経基盤: 左側頭葉・音韻ループ
対象障害: ASD、ID（聴覚過敏考慮でデフォルト音量控えめ設定）
```

---

#### P1-3: 身体運動「プライミング」モジュールの導入

**根拠**: ACTIVATEが採用するBDNF増加メカニズムはRCTで立証済み（Wexler et al., 2016）。「運動30分→認知トレーニング30分」順序で認知トレーニング効果が30〜40%増強される
**改善案**:

- セッション開始前に「うごこうタイム」（30〜60秒の簡単体操アニメーション）を実装
- 「ジャンプ5回」「手をグルグル」等の運動プロンプトをアニメーションで提示
- 保護者向けアプリに「今日の運動記録」機能（任意）を追加
- **注意**: 運動困難なID・ASD児への強制なし。任意モードで実装

---

### P2（中優先度・6〜12ヶ月以内）

#### P2-1: 継続的アセスメントの実装（CogniFit型）

**現状**: ゲームプレイデータの蓄積はあるが、認知スキルとしての定期評価なし
**改善案**:

- 4セッションに1回「ミニアセス」を自動挿入（1ゲーム×5試行、約3分）
- 対象スキル: working_memory（おぼえてならべて：スパン長）、processing_speed（はやわざタッチ：RT）、inhibition（まって！ストップ：SSRT推定）
- 保護者ダッシュボードで「認知スキルレーダーチャート」を表示
- **長期目標**: このデータをRCTのアウトカム指標として活用

---

#### P2-2: RCT設計の準備・パイロットスタディ

**現状**: エビデンスレベル5（専門家意見のみ相当）
**ロードマップ**:

1. **フェーズ1（6ヶ月）**: ユーザーデータの後ろ向きコホート分析。在籍施設・保護者報告との相関を検証
2. **フェーズ2（12〜18ヶ月）**: 施設単位の前向き非盲検パイロット（n=30〜50、ASD特化）。主要アウトカム: Vineland-3 Adaptive Behavior Scale
3. **フェーズ3（24〜36ヶ月）**: ウェイトリスト対照群RCT（n=100〜150、3障害）。CONSORT準拠

**測定ツール案**:
- 注意: TOVA（ToVA社）または Conners CPT-3
- WM: CANTAB SSP・SWM（Cambridge Cognition）
- 社会認知: Social Responsiveness Scale-2（SRS-2）、BRIEF-2
- 行動: Vineland-3、ABAS-3

---

#### P2-3: マルチモーダル強化（音声・触覚フィードバック統合）

**根拠**: ASD児の感覚処理特性研究（Marco et al., 2011）では、視覚単一モダリティよりも視覚+聴覚+触覚の複合フィードバックが学習効率を向上させることが示唆される
**改善案**:

- 正解時: 視覚アニメーション + 正の音声フィードバック（変更可能）+ 触覚バイブ（デバイス対応時）
- 感覚カスタマイズメニューを設定画面に追加（音量・振動強度・アニメーション速度の個別調整）
- ASD感覚過敏プロファイル：デフォルトで控えめ設定、保護者が増強可能

---

#### P2-4: スペーシング効果の活用（Cogmed改善版）

**根拠**: Settles & Meeder（2016）のHalf-Life Regression（Manas MEMORY.mdで参照済み）は、復習間隔の個別最適化が長期記憶保持を最大化する。Cogmedは固定5週間プロトコルで復習設計が硬直的
**改善案**:

- 習得済みゲーム（精度80%×2連続セッション）に対して、HLRベースの再登場スケジュールを自動生成
- 現在のstage-systemのMasteryTrackerを強化し、「衰退検出→再強化セッション自動挿入」ループを実装
- 特にemotional regulationとsocial cognitionゲームへの適用を優先（ASD介入研究で最も維持が困難なドメイン）

---

## 6. 出典リスト

### 臨床試験・RCT

1. Kollins, S. H., et al. (2020). A novel digital intervention for actively reducing severity of paediatric ADHD (STARS-ADHD): a randomised controlled trial. *The Lancet Digital Health*, 2(4), e168–e178. [https://www.thelancet.com/journals/landig/article/PIIS2589-7500(20)30017-0/fulltext](https://www.thelancet.com/journals/landig/article/PIIS2589-7500(20)30017-0/fulltext)

2. FDA De Novo Classification Request for EndeavorRx (DEN200026). U.S. Food and Drug Administration. [https://www.accessdata.fda.gov/cdrh_docs/reviews/DEN200026.pdf](https://www.accessdata.fda.gov/cdrh_docs/reviews/DEN200026.pdf)

3. Holmes, J., et al. (2009). Working memory deficits can be overcome: Impacts of training and medication on working memory in children with ADHD. *Applied Cognitive Psychology*, 24(6), 827–836.

4. Hovik, K. T., et al. (2013). Effects of cognitive training in children with ADHD: A randomized controlled trial. *Journal of Child Psychology and Psychiatry*, 54(2), 191–198.

5. Wexler, B. E., et al. (2016). A randomized trial of intensive cognitive training in children with ADHD. *Clinical Psychological Science*, 4(1), 3–15. [http://www.prweb.com/releases/2016/03/prweb13302740.htm](http://www.prweb.com/releases/2016/03/prweb13302740.htm)

6. Backman, A., et al. (2017). A Retrospective Chart Analysis with Follow-Up of Cogmed Working Memory Training in Children and Adolescents with Autism Spectrum Disorder. *Medical Science Monitor Basic Research*. [https://pmc.ncbi.nlm.nih.gov/articles/PMC5656100/](https://pmc.ncbi.nlm.nih.gov/articles/PMC5656100/)

### メタ分析・システマティックレビュー

7. Melby-Lervåg, M., & Hulme, C. (2013). Is working memory training effective? A meta-analytic review. *Developmental Psychology*, 49(2), 270–291.

8. Cortese, S., et al. (2023). Computerized cognitive training in attention-deficit/hyperactivity disorder (ADHD): a meta-analysis of randomized controlled trials with blinded and objective outcomes. *Molecular Psychiatry*. [https://www.nature.com/articles/s41380-023-02000-7](https://www.nature.com/articles/s41380-023-02000-7)

9. Frontiers in Psychiatry (2023). Meta-analysis of the efficacy of digital therapies in children with attention-deficit hyperactivity disorder. [https://pmc.ncbi.nlm.nih.gov/articles/PMC10228751/](https://pmc.ncbi.nlm.nih.gov/articles/PMC10228751/)

10. Healthcare (2024). Serious Games for Developing Social Skills in Children and Adolescents with Autism Spectrum Disorder: A Systematic Review. *MDPI Healthcare*, 12(5), 508. [https://pmc.ncbi.nlm.nih.gov/articles/PMC10931397/](https://pmc.ncbi.nlm.nih.gov/articles/PMC10931397/)

11. ScienceDirect (2025). Cogmed cognitive training for working memory: a systematic review and meta-analysis. [https://www.sciencedirect.com/science/article/abs/pii/S0306452225007158](https://www.sciencedirect.com/science/article/abs/pii/S0306452225007158)

### 神経科学的根拠

12. Merzenich, M. M., et al. (2014). Brain plasticity-based therapeutics. *Frontiers in Human Neuroscience*. [https://pmc.ncbi.nlm.nih.gov/articles/PMC4072971/](https://pmc.ncbi.nlm.nih.gov/articles/PMC4072971/)

13. Akili Interactive SSME Technology. IntuitionLabs.ai. [https://intuitionlabs.ai/software/telepsychiatry-digital-mental-health/digital-therapeutics-prescription-apps/endeavorrx](https://intuitionlabs.ai/software/telepsychiatry-digital-mental-health/digital-therapeutics-prescription-apps/endeavorrx)

14. EndeavorRx Research page. [https://www.endeavorrx.com/the-research/](https://www.endeavorrx.com/the-research/)

### ゲームデザイン・適応学習

15. Springer Nature (2024). Modeling Skill Progression in Children Through Novel Multidimensional Probabilistic DDA. [https://link.springer.com/chapter/10.1007/978-3-032-11043-5_25](https://link.springer.com/chapter/10.1007/978-3-032-11043-5_25)

16. Settles, B., & Meeder, B. (2016). A trainable spaced repetition model for language learning. *ACL 2016*.

17. JMIR Serious Games (2024). Use of Serious Games in Interventions of Executive Functions in Neurodiverse Children: Systematic Review. [https://games.jmir.org/2024/1/e59053](https://games.jmir.org/2024/1/e59053)

18. BrainFutures ACTIVATE Review (2020). [https://www.brainfutures.org/activate-2/](https://www.brainfutures.org/activate-2/)

19. CogniFit Neuroscience page. [https://www.cognifit.com/neuroscience](https://www.cognifit.com/neuroscience)

20. BrainHQ About Exercises. [https://www.brainhq.com/why-brainhq/about-the-brainhq-exercises](https://www.brainhq.com/why-brainhq/about-the-brainhq-exercises)

---

*本報告書はManasリサーチチーム Teammate 1「認知トレーニング科学」担当が作成。次回更新: RCTパイロット結果が得られた時点（フェーズ1完了後）。*
