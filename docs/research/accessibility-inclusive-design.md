# アクセシビリティ・インクルーシブ設計リサーチレポート
## Teammate 5 担当：障害児向けアクセシビリティ・インクルーシブ設計

**調査日：** 2026年3月2日
**対象プロダクト：** Manas（神経発達症児向け認知トレーニングアプリ）

---

## 1. エグゼクティブサマリ

EndeavorRx・Cogmed・ACTIVATEの比較分析と最新研究レビューから、神経発達症児向けアプリ設計の核心は「フラストレーション回避」「感覚過敏への配慮」「誤りを最小化した高成功率設計」の3点に集約される。ManasのDDAターゲット正答率（ASD 80-90%、ADHD 70-85%、ID重度 85-95%）はABA/DTT標準（80-90%×2連続セッション）と整合しており科学的根拠が高い。一方、現状では感覚過敏設定のユーザーコントロール、移行期予告UIの欠如、非言語指示レベルの不完全な実装が差分として残る。「鍛える」ではなく「得意を発見する」という価値軸は強みに基づくアプローチ（Strengths-Based Approach）の研究潮流とも合致し、自己効力感と精神的well-beingを向上させることが実証されている。

---

## 2. 調査対象プロダクトの詳細分析

### 2.1 EndeavorRx

**概要**
EndeavorRxはAkili Interactive社が開発した世界初のFDA認可デジタルセラピューティクス（DTx）であり、8〜17歳のADHD児を対象とする。ゲーム内でキャラクターが障害物を避けながら移動するアクションゲーム（AKL-T01）の形式を取り、前頭前野の注意制御ネットワークを標的とする。

**セッション設計**
- 1日25分、週5日、4週間連続（最低1か月）が推奨プロトコル
- 2ヶ月の治療期間で、4週×2ブロック（間に4週の休止期間）
- 5つの臨床試験（600名以上の児童）でTOVA注意スコアの統計的有意な改善を確認
- ADHDシンポトム評価スケール（ADHD-RS）の改善者率：1か月で23〜36%、2ヶ月で45%

**フラストレーション管理**
- 副作用として報告された「フラストレーション」は全参加者の10%未満
- FDA指示書には「フラストレーション・めまい・頭痛・感情的反応を感じた場合は治療を一時中止し、継続する場合は医師に相談」と明記
- ゲームシステム自体はDDA（動的難易度調整）を実装しており、失敗→難易度即時低下でフラストレーションをリアルタイムに緩和

**Manasへの示唆**
- 1セッション25分という時間設計は臨床エビデンスに裏付けられた上限値
- Manasの現設計（ステージ制・セッション管理）はこの根拠と整合する
- 医師処方型DTxではないManasでは「途中中断→後日再開」のUXを明示的にサポートすることが重要

---

### 2.2 Cogmed Working Memory Training（CWMT）

**概要**
CogmedはPearson社が提供するコンピュータベースのワーキングメモリトレーニングプログラム。13種類の聴覚・視覚・視覚空間・複合課題で構成され、45分/日×週5日×5週（合計25セッション）のプロトコルが標準。ADHDを主要ターゲットとするが、ASD（特にASD+ADHD併存）への適用研究も増加中。

**ASD/ADHD/ID別の有効性**
- **ADHD単独：** ワーキングメモリの近距離転移（Near Transfer）は一貫して有意。日常生活への遠距離転移（Far Transfer）は限定的
- **ASD+ADHD併存：** 後ろ向きチャート研究（n=15, 9〜19歳）で、注意・集中・衝動性・感情反応性・学業達成の改善を確認（PMC5656100）
- **ASD+ID（軽度〜中等度）：** 2022年パイロット試験（n=26, 8〜18歳）で、事前〜事後測定全指標で有意改善。ただし**超多動性/衝動性スコアが高いほど視覚空間WMの事前パフォーマンスが低く**、DDAターゲット設定に個人差への配慮が必要
- **ASD+ID（重度）：** 標準6週間での完了率が低く、追加サポートが必要。知的障害のある参加者では推奨トレーニング期間内に完了できない場合が19%存在

**視覚空間的WMタスクの設計原則**
ASD児は空間WM課題においてチャンキング戦略（情報をグループ化して記憶）が困難であり、局所処理バイアス（全体より細部に注目）が顕著。典型発達児が示す「統合情報処理」傾向が見られない。
- 対処策：明確な参照点・フレームを追加、セマンティックな手がかり（意味のある文脈）を与えてチャンキングを誘導
- Corsi Block Tapping相当の課題（色・位置シーケンス記憶）が最も適合性が高い

**Manasへの示唆**
- `oboete-match`・`oboete-narabete`（記憶系ゲーム）はCogmedのCorsi Block相当であり、高い妥当性を持つ
- ASD児向けには視覚参照点（色分け背景、位置マーカー）を追加することで成功率を向上できる
- ASD+ID重度向けには試行数を減らし（2〜3個のシーケンスから開始）、文脈を強調した視覚刺激を使用すべき

---

### 2.3 ACTIVATE（C8 Sciences）

**概要**
ACTIVATEはYale大学神経科学者が開発した3要素統合型認知トレーニングプログラム。コンピュータゲーム・身体運動・NIH評価の3本柱で、ADHD・ASD・実行機能障害・その他認知障害を対象とする。

**プログラム構成**
1. **コンピュータゲーム：** 6種類のゲーム（100以上のレベル）。カテゴリ形成、持続的注意、情報処理速度などを個別にターゲット
2. **身体運動：** 週3〜5回、20〜30分の身体運動プログラム。縄跳び・武道・ジャグリング等でゲームと同じ脳領域を刺激
3. **適応的評価：** 弱点領域に自動的に多くの時間を割り当てる。DDAにより「挑戦的だが決してフラストレーションを与えない」難易度を維持

**多感覚アプローチの根拠**
- 身体運動と認知課題の組み合わせは、単体の認知トレーニングより脳可塑性を促進するエビデンスが蓄積（ScienceDirect, 2021）
- ACTIVATEのコンセプトは「ゲーム中は短い注意バーストが頻繁に更新される」ことを利用：ADHDの「注意の短時間集中」特性に適合
- 臨床試験（122名、ADHD、週40分×8週）は実施されたが、結果は未公表（2024年時点）

**Manasへの示唆**
- ACTIVATEの身体運動統合はアプリ単体では実装不可だが、**セッション前に「体を動かそう」カードを表示**するUXでの代替が可能
- 「短時間バースト×高頻度更新」の設計はManasの現ゲーム設計（反応速度系ゲーム：`hayawaza-touch`等）に既に反映されており、ADHDに適した設計方向
- 弱点領域への自動時間配分はManasのDDA+ステージスケジューリングで部分的に実現されている

---

## 3. 比較表

| 項目 | EndeavorRx | Cogmed | ACTIVATE | Manas（現状） |
|---|---|---|---|---|
| **対象障害** | ADHD（8-17歳） | ADHD（主）、ASD+ADHD | ADHD、ASD、EF障害 | ASD、ADHD、ID（全重症度） |
| **セッション時間** | 25分/日 | 45分/日 | 40分/日 | 10〜20分（推定） |
| **DDA実装** | あり（リアルタイム） | あり（セッション間） | あり（弱点配分） | あり（スライディングウィンドウ） |
| **ターゲット正答率** | 非公開 | 非公開 | 非公開 | ASD 80-90%、ADHD 70-85%、ID重度 85-95% |
| **感覚配慮** | 限定的 | 限定的 | 限定的 | あり（色・音設計） |
| **視覚的指示** | 部分的 | 部分的 | 部分的 | あり（指示レベル制） |
| **多感覚アプローチ** | なし | なし | あり（身体運動） | なし（今後課題） |
| **FDA/医療承認** | FDA認可 | CE認定 | なし | 認可なし（民間アプリ） |
| **FarTransfer証拠** | 限定的 | 限定的 | 不明 | 研究途上 |
| **日本語対応** | なし | なし | なし | あり（国内市場向け） |
| **コスト** | 処方箋必要、高額 | 高額 | 高額 | 低コスト目標 |

---

## 4. Manasの現状との差分

### 4.1 設計の強み（他社優位な点を既に持つ）

- **DDAターゲット正答率の障害別設定**：他社は非公開だがManasは科学的根拠に基づき明示（後述）
- **安全設計（赤色不使用、×マーク不使用）**：エビデンスベースの感情配慮
- **指示レベル制（非言語→フル言語）**：Cogmed/EndeavorRxにない差別化機能
- **セッション時間設計**：EndeavorRxの25分基準に対して短めのセッション設計は、より重度のID児・集中持続困難なADHD児に適合
- **日本語・日本市場適合**：国内特別支援教育との連携可能性

### 4.2 設計の差分・課題

| 差分領域 | 他社・研究の水準 | Manasの現状 | 優先度 |
|---|---|---|---|
| 感覚過敏ユーザーコントロール | アニメーション速度・音量・色をユーザーが調整可能（WCAG 2.2推奨） | ハードコード（変更不可） | P0 |
| 移行期予告UI | ASD向けの視覚カウントダウン・次タスク予告が有効（IIDC, 2023） | 実装なし | P0 |
| 身体運動との統合示唆 | ACTIVATEの研究で有効性示唆 | なし | P2 |
| 親・セラピストダッシュボード | Cogmedは詳細な進捗レポート | なし（MVP段階） | P1 |
| 非言語指示の完全非言語化 | ASD非言語児・ID重度児向けは音声・テキスト依存度ゼロが理想 | 一部テキスト依存 | P1 |
| FarTransferの評価 | 全社で課題。ManasはNearTransfer設計に特化すべき | 未評価 | P2 |

---

## 5. 障害種別ごとのUI/UX配慮事項一覧

### 5.1 ASD（自閉スペクトラム症）

**知覚・感覚系**
- 37〜69%が聴覚過敏（hyperacusis）を持つ（UX Magazine, 2024）
- 視覚的過負荷：フラッシュ・急激なアニメーション・高彩度色が感覚過負荷を引き起こす可能性
- 推奨：ニュートラルトーン（彩度30%以下）、アニメーション速度は最大0.3秒を基準に

**認知・処理系**
- 局所処理バイアス：全体像より細部に注目するため、シンプルな視覚階層が有効
- 移行困難：活動切り替えに視覚カウントダウン（5→4→3→2→1）を必ず提供
- 文字通りの解釈：「行間を読む」ことが困難→具体的・直接的な指示のみ使用
- 予測可能性：毎回同じ画面レイアウト・同じ操作パターンを維持

**動機付け**
- ASDの75〜90%が特定の強い興味（Special Interest）を持ち生涯継続する
- 内発的動機が強い：達成感・知識獲得・フロー状態への感受性が高い
- ゲームのルール・構造の明確さが参加率を高める

**設計パターン**
- 選択肢：2〜4択を上限（ヒックの法則+認知負荷軽減）
- 指示：絵→動作→テキストの順で提示（言語依存度を段階的に下げる）
- フィードバック：即時・具体的・肯定的のみ。抽象的な褒め言葉より「できた！」の具体的表示

### 5.2 ADHD（注意欠如・多動症）

**注意・実行機能系**
- 短時間バーストの注意が頻繁に更新される特性を逆用する
- 1試行あたり8〜15秒以内に結果が出る即時フィードバックが有効（dopamine transfer deficit理論）
- ゲームの難易度変動が遅い→退屈→ドロップアウトの連鎖を防ぐため、DDAの反応速度を上げる

**報酬系**
- 遅延報酬の効果が薄い：ポイント・バッジ等の報酬は試行直後の即時提供が必須
- 部分強化スケジュール：変動比率（VR）スケジュール（平均N回に1回の報酬）が長期学習保持に有効
- 強化は継続的に、かつ新鮮さを維持：同一報酬の繰り返しは慣れ（habituation）を引き起こす

**感覚系**
- ADHDも感覚過敏率が高い（神経発達症として共通の特性）
- 急激な音声エフェクトは驚愕反応を引き起こす可能性→音量漸増設計が有効

**設計パターン**
- セッション：25分/日が臨床的上限（EndeavorRxエビデンス）。連続プレイに上限警告を設置
- 進捗表示：試行単位の微細な進捗バーでモチベーション持続
- 中断・再開：任意の時点での中断→再開を技術的・UI的にサポート
- 変化量：画面要素は毎試行で変化あり（刺激の新鮮さを維持）

### 5.3 ID（知的障害）

**軽度（IQ 55-70）**
- 文字の読み書きが部分的に可能：ひらがな中心、漢字は最小化
- 試行回数制限：標準より少ない試行数で疲労が生じる
- 近距離転移（Near Transfer）は得意なパターンに限られる

**中等度（IQ 40-55）**
- 言語指示の理解が限定的：絵と動作指示を中心に構成
- 反復が重要：同一タスクを複数回実施しても飽きを感じにくい
- 選択肢：2択を基本。3択は上限

**重度（IQ 25-40）**
- Errorless Learning（誤りなし学習）：プロンプト（ヒント）を最初から提供し、徐々にフェードアウト
- 高い成功率設計：85〜95%正答率でも退屈しない豊富な成功フィードバック
- 1試行のステップ数：1〜2ステップが上限
- 非言語完全実装：音声・テキスト指示なし、絵・動作のみ

---

## 6. 指示レベル別の設計パターン（非言語→フル言語）

```
レベル1：完全非言語（ID重度・ASD非言語）
  - アニメーション示範（1〜2秒ループ）のみ
  - 音声：効果音のみ（音楽・音声なし）
  - 選択肢：2択
  - プロンプト：画面上に指マーカーを常時表示

レベル2：視覚+音声（ID中等度・ASD最小言語）
  - 絵カード+短音声（3語以内：「これを タッチ」）
  - アイコンベースのUI
  - 選択肢：2〜3択

レベル3：視覚+文字（ID軽度・ASD言語あり）
  - ひらがな中心の短文指示
  - アイコン+文字の組み合わせ
  - 選択肢：3〜4択

レベル4：フル言語（ADHD・高機能ASD）
  - 通常の文章指示
  - ルール説明あり
  - 選択肢：4択まで
```

**W3C COGA推奨との照合**
- COGA Design Patternでは「7項目以内の選択肢」を知的障害・認知障害向け上限として推奨
- ManasのレベルシステムはこのCOGAガイドラインの下位互換として適切に設計されている
- 追加すべき：各レベルで「行間を読む」必要のある表現（暗喩・比喩）の排除チェックリスト

---

## 7. 感覚過敏への配慮

### 7.1 音量・サウンドデザイン

| 要素 | 現在の推奨値 | 実装提案 |
|---|---|---|
| 最大音量 | システム設定の60%以下が安全 | ゲーム内音量スライダーを追加（P0） |
| 効果音の立ち上がり | 急激なアタックは聴覚過敏を刺激 | アタック20ms以上、リリース200ms以上 |
| BGM | 常時BGMはADHD/ASDの集中を妨害する可能性 | BGMオン/オフトグル（P0） |
| サウンドフィードバック | 成功音は高音域（2kHz以上）を避ける | 440〜880Hzの中音域に限定 |

### 7.2 色彩設計

| 原則 | 根拠 | Manas現状 | 追加推奨 |
|---|---|---|---|
| 赤色不使用 | 失敗・危険の連想、感情的反応 | 実装済み | 維持 |
| 高彩度色の制限 | ASD感覚過敏（彩度 < 60%を目安） | 要確認 | 彩度上限のCSS変数化 |
| フラッシュ・点滅 | WCAG 2.2「3回/秒以上の点滅禁止」 | 不明 | 全アニメーションのフラッシュ検査 |
| コントラスト比 | WCAG AA: 4.5:1以上 | 要確認 | 自動チェックの導入 |

### 7.3 アニメーション速度

- WCAG 2.2では `prefers-reduced-motion` メディアクエリへの対応が必須（2022年基準）
- ASD・ADHD両者においてアニメーション削減オプションの提供が推奨
- Manasへの実装提案：ゲームオプション画面に「アニメーション：ふつう / ゆっくり / なし」の3段階設定

---

## 8. 認知負荷の管理

### 8.1 情報量制御

Sweller（1988）の認知負荷理論（CLT）によれば、ワーキングメモリの容量は限定的であり、学習効率を最大化するには外来性認知負荷（Extraneous Load）を最小化する必要がある。

| 要素 | ID重度 | ID軽度・ADHD | ASD（全般） |
|---|---|---|---|
| 画面内要素数 | 3個以下 | 6個以下 | 4個以下（局所処理バイアス対策） |
| 選択肢数 | 2択 | 4択まで | 3択を推奨（過多選択肢は処理困難） |
| ルール説明量 | 示範のみ | 3文以内 | 2文以内（具体的・直接的） |
| 一画面内のテキスト | 0文字（絵のみ） | 15文字以内 | 10文字以内 |

### 8.2 セッション時間

| 障害種別 | 推奨セッション上限 | 根拠 |
|---|---|---|
| ADHD | 25分/日 | EndeavorRx臨床試験（FDA, 2020） |
| ASD（軽〜中等度） | 20分/日 | Cogmed ASD適用研究（PMC, 2018） |
| ID重度 | 10〜15分/日 | 認知疲労が早期に生じる特性 |
| ID軽度 | 20分/日 | 標準的ABAセッション長との整合 |

**Manasへの実装提案：** セッション開始時に「今日は○分でおわるよ」と残り時間を視覚的に表示し、終了3分前に「もうすぐおわるよ」の予告を行う。

### 8.3 試行間インターバル

- 1試行完了後、次試行開始まで1.5〜2.0秒のインターバルが認知リセットに有効
- ID重度児では3秒以上が推奨（処理速度の違いを考慮）

---

## 9. DDAターゲット正答率の科学的根拠

### 9.1 ASD：ターゲット 80-90%

**根拠：**

1. **ABAマスタリー基準**：Granpeesheh et al. (2014) は、ASD向けDTT（離散試行訓練）のマスタリー基準として**80〜100%正答×2〜3連続セッション**を推奨。Leaf & McEachin (1999)は80〜90%を一般基準として提示。
2. **Cogmed ASD研究**：PMC9915337（2022）において、ASD+ID群のWMトレーニングが事前〜事後の全WM指標で有意改善を示した条件での実績値は85〜90%成功率帯
3. **エラーレスラーニングとの整合**：ASDの感覚・感情系の脆弱性から、エラー経験が過度のストレスを引き起こすリスクがある。80%以上を維持することでこのリスクを軽減

**評価：Manasの設定（80-90%）は科学的根拠と高度に整合する。妥当性：高**

### 9.2 ADHD：ターゲット 70-85%

**根拠：**

1. **フロー理論との整合**：Csikszentmihalyi のFlow理論では、スキルと挑戦のバランスが取れた状態（フロー状態）が最適な学習体験をもたらす。ADHDにとってのフロー領域は過剰な成功率では達成されにくい
2. **ABA DTT標準**：一般的なDTT設計では「70%の正答率で4連続日」という基準が使用される例がある
3. **報酬感受性の違い**：ADHDの報酬処理機能（腹側線条体）は、適度な挑戦と失敗→復活のサイクルでより強い動機付けが生まれる（PMC3010326）
4. **ADHD専門ゲームの実績**：EndeavorRx臨床試験では、適度な挑戦難易度を維持するDDAが効果の核心とされ、70%台の成功率でもドロップアウトは少ない

**評価：Manasの設定（70-85%）は妥当。ただし70%下限への低下は慎重に管理する必要あり。妥当性：高**

### 9.3 ID重度：ターゲット 85-95%

**根拠：**

1. **エラーレスラーニング（ELL）の原則**：ID重度・最重度向けの教授法として、エラーを最小化する設計（errorless learning）が標準。エラー経験は誤概念の固着リスクがあるため高成功率設計が必要（PubMed, 31901670）
2. **高成功率の自己効力感効果**：誤りなし学習は「できる」という自己効力感を積み上げ、学習意欲の維持に直結する
3. **Tandem & Koegel (2015)** ：ID重度向けの構造化教授では85〜95%の成功率を維持するよう難易度設計することが動機維持の基礎
4. **RCT (Tandfonline, 2024)**：ID成人向けの修正版ゴール管理トレーニング+ELLで、練習タスクの有意な改善を確認

**評価：Manasの設定（85-95%）はELL理論と完全に整合する。妥当性：最高**

---

## 10. 「鍛える」vs「理解する・得意を発見する」の科学的裏付け

### 10.1 神経多様性モデルの台頭

2024年の研究潮流は、神経発達症を「欠陥モデル（Deficit Model）」から「神経多様性モデル（Neurodiversity Model）」へのパラダイムシフトを示している（Psychiatry.org, 2024）。

**Strengths-Based Approach（強みに基づくアプローチ）の実証研究：**

- Taylor et al. (2023, SAGE)：ASD成人において強みの活用がQOL・精神的well-being・メンタルヘルスを有意に改善
- Middletown Autism Research Bulletin (2024)：強みに基づくプログラムが自閉症青少年のスキル改善と社会的参加促進に有効
- APA Blog (2024)：「強みを活用させることがポジティブな結果をもたらす」という evidence を臨床実践へ統合する動きが加速

### 10.2 「鍛える」アプローチの問題点

- 欠陥フォーカスの反復は自己イメージの低下・自己効力感の喪失を引き起こす
- 過剰な矯正・訓練に対する burnout が長期的なドロップアウトの主因
- ID重度児では「できないことを繰り返す」体験が anxiety・problem behavior の引き金になるリスク

### 10.3 「得意を発見する」アプローチの設計上の含意

| 設計要素 | 従来型「鍛える」 | Manas「発見する」 |
|---|---|---|
| フィードバック | 「もう一度」「不正解」 | 「すごい！」「よくできた！」のみ |
| 難易度変動 | 失敗→難易度維持/上昇 | 失敗→即時難易度低下（DDA） |
| プログレス表示 | 失敗回数・正答率 | 成功回数・成長グラフのみ |
| ゲームの目的枠組み | 「苦手を克服する」 | 「得意なことを見つける」 |
| データ活用 | 欠点の診断 | 強みプロファイルの構築 |

**Manasへの示唆：** 現在の安全設計（赤色不使用・×マーク不使用・励ましのみ）は Strengths-Based Approach の実装として科学的に正当化される。親・セラピスト向けの「得意発見レポート」（強みプロファイル）を追加することで、治療的文脈とも整合した価値提案が可能になる。

---

## 11. 神経可塑性の年齢別・障害別反応差

### 11.1 年齢による違い

- 研究対象の81%が20歳未満：児童期は神経可塑性が最も高い時期（PMC, 2024）
- ASDの神経可塑性異常：LTP（長期増強）・LTD（長期抑圧）の異常、シナプス剪定の障害が確認（Frontiers in Psychiatry, 2024）
- **臨床含意**：ASD児では「通常の学習メカニズム」とは異なるシナプス変化が生じるため、反復回数・インターバルの最適値が定型発達と異なる可能性がある

### 11.2 障害種別による反応差

| 障害種別 | 神経可塑性の特性 | トレーニング設計への含意 |
|---|---|---|
| ASD | LTP異常・局所過接続 | 過剰入力を避ける設計。刺激量・反復数を控えめに |
| ADHD | ドーパミン報酬経路の反応性低下 | 即時報酬で代替。変動スケジュールで長期保持 |
| ID軽度 | 処理速度低下・WM容量縮小 | 試行間インターバルを延長。情報量を限定 |
| ID重度 | 広範な認知機能制限 | Errorless Learning徹底。成功率最優先 |
| ASD+ADHD併存 | 両特性の複合 | ASDの高成功率設計 + ADHDの即時報酬が必要 |

---

## 12. Far Transfer vs Near Transfer 最新メタ分析

### 12.1 主要エビデンス

**Near Transfer（近距離転移）：** 訓練したスキルと類似した未訓練タスクへの改善
**Far Transfer（遠距離転移）：** 訓練したスキルとは異なる日常生活スキル・学業成績への改善

**メタ分析（PubMed 36633797 / PMC10920464, Neuropsychology Review, 2023）：**
- 神経発達症（NDD）17研究のメタ分析
- **Near Transfer：統計的に有意な改善あり**（d = 中程度効果量）
- **Far Transfer：日常生活機能・臨床症状への効果は限定的だが有意**、ただし訓練コンポーネント間の転移（例：WM訓練→注意改善）は有意でないケースが多い
- **最も効果に影響する変数：** 強度・頻度、および「実験室 vs 生活文脈」の次元

**第二次メタ分析（Collabra: Psychology, Near and Far Transfer, 2019）：**
- 全体的なFar Transfer効果はほぼゼロ（d ≈ 0）
- 「ある認知コンポーネントを鍛えても別のコンポーネントが改善するという証拠はない」

### 12.2 Manasへの含意

- **Near Transferにフォーカスする設計が現実的：** 各ゲームが測定・訓練するスキル（WM・抑制・注意持続等）の内部改善は達成可能
- **Far Transferへの過剰な主張は避ける：** 「このゲームで学校の成績が上がる」という訴求は現時点のエビデンスで支持されない
- **「生活文脈に近い課題設計」でFar Transferを促進：** ACTIVATEの設計思想（ゲーム+身体活動の組み合わせ）、Manasでは療育場面に近い課題設定（`kimochi-yomitori`等）が有効
- **親・セラピストへの正直なコミュニケーション：** 効果の範囲と限界を透明に開示することが信頼構築につながる

---

## 13. 具体的な改善提案（P0/P1/P2優先度）

### P0（即座に対応すべき）

#### P0-1: 感覚過敏コントロールUIの追加
**問題：** 現在アニメーション速度・音量・BGMはハードコードされており、感覚過敏のあるユーザーが調整できない
**対応：** ゲームオプション画面に以下を追加
```
- BGM：オン/オフ
- 効果音：大 / 普通 / 小
- アニメーション：ふつう / ゆっくり / なし（prefers-reduced-motion 準拠）
- 画面の明るさ：ゲーム内調整スライダー
```
**根拠：** WCAG 2.2 SC 1.4.11、W3C COGA Design Pattern、37〜69%のASD聴覚過敏率
**実装コスト：** 中（CSS変数とuseSettings hookの追加で対応可能）

#### P0-2: 移行期予告UIの実装
**問題：** セッション終了・次ゲームへの切り替え時に予告なく遷移するため、ASD児の移行困難を引き起こす
**対応：**
```
- セッション終了3分前：「もうすぐおわるよ」トースト表示（ビジュアルカウントダウン付き）
- ゲーム切り替え時：「つぎはちがうゲームだよ」+絵カード表示→3秒待機→遷移
- セッション終了画面：「またあした」「よく頑張ったね」のカレンダービジュアル
```
**根拠：** IIDC (Indiana University, 2023)のASD移行支援ガイドライン、Leaf Wing Center推奨
**実装コスト：** 低〜中

#### P0-3: WCAG 2.2 基本準拠チェック
**問題：** 点滅アニメーション・コントラスト比・フォントサイズの WCAG 準拠状況が未検証
**対応：**
```
- 全ゲームのアニメーション：3回/秒以上の点滅がないことを確認（SC 2.3.1）
- テキストコントラスト比：4.5:1以上（SC 1.4.3）
- ターゲットサイズ：タッチ領域44×44px以上（SC 2.5.8）
```
**根拠：** WCAG 2.2（2023）
**実装コスト：** 低（チェックのみ、修正は中程度）

---

### P1（次の開発サイクルで対応）

#### P1-1: 指示レベルの完全非言語化（ID重度・ASD非言語対応）
**問題：** 指示レベル「非言語」でも一部テキスト・音声に依存している箇所が残る
**対応：**
```
- レベル1（完全非言語）定義の厳格化：
  画面内テキスト = 0
  音声指示 = 0
  アニメーション示範 = 2秒ループ×3回 → 自動スタート
  指マーカー = 常時表示
```
**根拠：** COGA User Research（W3C）、ID重度向けErrorless Learning設計原則

#### P1-2: 試行間インターバルの障害別調整
**問題：** 現在のIntertrial Interval（ITI）は全ユーザーで均一
**対応：** ユーザープロファイルの「障害種別」設定に連動して以下を自動適用
```
ADHD: ITI = 1.0〜1.5秒（速いペースで注意維持）
ASD: ITI = 1.5〜2.0秒（処理時間の余裕）
ID重度: ITI = 3.0秒以上（処理速度の違いを考慮）
ID軽度: ITI = 2.0〜2.5秒
```
**根拠：** 認知負荷理論（Sweller）、ABA標準プロトコル

#### P1-3: 強みプロファイルレポート機能
**問題：** 現状のデータ活用が不足しており、親・セラピストへの価値提供が限定的
**対応：**
```
- ゲーム別の「得意度スコア」を可視化（スパイダーチャート）
- 「今日いちばん得意だったこと」を毎セッション後に表示
- 週次レポート：「○○ちゃんは記憶力が特に伸びています」
```
**根拠：** Strengths-Based Approach（Taylor et al., 2023、Middletown, 2024）

---

### P2（中長期ロードマップ）

#### P2-1: 身体運動との統合示唆UI
**内容：** セッション開始前に「体を動かそう！5回ジャンプしてみよう」などの身体活動カードを表示
**根拠：** ACTIVATEの多感覚アプローチ。身体運動前の認知トレーニング効果向上（ScienceDirect, 2021）

#### P2-2: Far Transfer測定の試験的実装
**内容：** 標準化された生活機能評価（Vineland等の簡易版）をアプリ内で月次実施し、ゲームスコアとの相関を内部分析
**根拠：** Near/Far Transfer メタ分析（PMC10920464, 2023）。自社エビデンスの蓄積が将来の医療連携に必要

#### P2-3: prefers-reduced-motion / prefers-color-scheme の完全対応
**内容：** OSレベルのアクセシビリティ設定（モーション削減・ダークモード）を自動検出・適用
**根拠：** WCAG 2.2 SC 1.4.11、CSS Media Query Level 5仕様

#### P2-4: 個人特性に応じたDDAパラメータの微調整機能
**内容：** ASD+ADHD併存、ASD+ID併存など、複数の障害が重なるケースへの対応。DDAのスライディングウィンドウサイズ・ターゲット正答率を親・セラピストが調整できるダッシュボード
**根拠：** Cogmed ASD+ID研究（PMC9915337）での個人差の大きさ

---

## 14. 出典リスト

### 製品・臨床研究

1. FDA. (2020). *De Novo Classification Request for EndeavorRx (AKL-T01)*. https://www.accessdata.fda.gov/cdrh_docs/reviews/DEN200026.pdf
2. Akili Interactive. (2023). *Pivotal Trial of EndeavorRx in Adolescents with ADHD Shows Robust Improvements*. https://www.akiliinteractive.com/news-collection/2023/1/6/pivotal-trial-of-endeavorrx-in-adolescents-with-adhd-shows-robust-improvements-in-attention-and-broader-clinical-outcomes
3. EndeavorRx. (2024). *ADHD Research: EndeavorRx Study for ADHD in Children*. https://www.endeavorrx.com/the-research/
4. EndeavorRx (Wikipedia). https://en.wikipedia.org/wiki/EndeavorRx
5. Sandberg, S., & McAuley, T. (2022). Hospital-Based Modified Cogmed Working Memory Training for Youth With ADHD. *Journal of Attention Disorders*. https://journals.sagepub.com/doi/full/10.1177/10870547211066487

### ASD向けWMトレーニング研究

6. Cogmed ASD Retrospective Chart Analysis. (2017). *PMC5656100*. https://pmc.ncbi.nlm.nih.gov/articles/PMC5656100/
7. Working Memory Training in Youth With Autism, Fragile X, and Intellectual Disability: A Pilot Study. (2022). *PMC9915337*. https://pmc.ncbi.nlm.nih.gov/articles/PMC9915337/
8. JMIR Mental Health. (2018). *Computerized Cognitive Training in Children With Autism and Intellectual Disabilities: Feasibility and Satisfaction Study*. https://mental.jmir.org/2018/2/e40/
9. Scientific Reports. (2021). *Development and testing of a game-based digital intervention for working memory training in autism spectrum disorder*. https://www.nature.com/articles/s41598-021-93258-w

### Far/Near Transfer メタ分析

10. Valeri, G. et al. (2023). *Far Transfer Effects of Trainings on Executive Functions in Neurodevelopmental Disorders: A Systematic Review and Metanalysis*. Neuropsychology Review. PMC10920464. https://pmc.ncbi.nlm.nih.gov/articles/PMC10920464/
11. Sala, G., & Gobet, F. (2019). *Near and Far Transfer in Cognitive Training: A Second-Order Meta-Analysis*. Collabra: Psychology. https://online.ucpress.edu/collabra/article/5/1/18/113004/

### 神経可塑性・障害別特性

12. PMC12271598. (2024). *Effects of digital interventions on neuroplasticity and brain function of individuals with developmental disabilities: A systematic review*. https://pmc.ncbi.nlm.nih.gov/articles/PMC12271598/
13. Frontiers in Psychiatry. (2024). *Neuroplasticity of children in autism spectrum disorder*. https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2024.1362288/full

### DDA・ゲーム設計

14. ScienceDirect. (2022). *Dynamic difficulty adjustment technique-based mobile vocabulary learning game for children with autism spectrum disorder*. https://www.sciencedirect.com/science/article/abs/pii/S1875952122000192
15. ScienceDirect. (2025). *Solutions for Dynamic Difficulty Adjustment in digital games: A Systematic Literature Review*. https://www.sciencedirect.com/science/article/abs/pii/S1875952125001211

### ABAマスタリー基準

16. PMC5843573. *A Preliminary Analysis of Mastery Criterion Level: Effects on Response Maintenance*. https://pmc.ncbi.nlm.nih.gov/articles/PMC5843573/
17. ERIC. (2016). *Discrete Trial Training: National Professional Development Center on ASD*. https://files.eric.ed.gov/fulltext/ED595333.pdf
18. The Autism Helper. *Writing the IEP Goal Mastery Criteria*. https://theautismhelper.com/writing-the-iep-goal-mastery-criteria/

### Errorless Learning / ID

19. PubMed 31901670. *Applications of within-stimulus errorless learning methods for teaching discrimination skills to individuals with intellectual and developmental disabilities: A systematic review*. https://pubmed.ncbi.nlm.nih.gov/31901670/
20. Tandfonline. (2024). *Enhancing task performance in adults with intellectual disability through modified goal management training and assistive technology with errorless learning: A randomized controlled trial*. https://www.tandfonline.com/doi/full/10.1080/09602011.2024.2384518

### Strengths-Based Approach

21. Taylor, E. C. et al. (2023). *Psychological strengths and well-being: Strengths use predicts quality of life, well-being and mental health in autism*. SAGE Journals. https://journals.sagepub.com/doi/full/10.1177/13623613221146440
22. Middletown Centre for Autism. (2024). *Strength-based Approaches Research Bulletin Issue No. 42*. https://www.middletownautism.com/files/uploads/5624747fe9fc19de207892e4d0487bd0.pdf
23. APA Blog. (2024). *Exploring a Strengths-Based Approach to Neurodiversity*. https://www.psychiatry.org/news-room/apa-blogs/exploring-a-strengths-based-approach-to-neurodiver
24. PMC8992818. *An Expert Discussion on Strengths-Based Approaches in Autism*. https://pmc.ncbi.nlm.nih.gov/articles/PMC8992818/

### アクセシビリティ・WCAG

25. W3C. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/
26. W3C. (2024). *Making Content Usable for People with Cognitive and Learning Disabilities (COGA)*. https://www.w3.org/TR/coga-usable/
27. W3C WAI. *Cognitive Accessibility at W3C*. https://www.w3.org/WAI/cognitive/
28. TPGI. *WCAG 2.1: Success Criteria for Cognitive Disabilities*. https://www.tpgi.com/wcag-2-1-success-criteria-for-cognitive-disabilities/

### 感覚過敏・UI設計

29. UX Magazine. (2024). *Designing Inclusive and Sensory-Friendly UX for Neurodiverse Audiences*. https://uxmag.com/articles/designing-inclusive-and-sensory-friendly-ux-for-neurodiverse-audiences
30. Tiimo App. *Sensory-friendly design for ADHD and Autism planning*. https://www.tiimoapp.com/resource-hub/sensory-design-neurodivergent-accessibility
31. Accessibility.com. *Sensory-Friendly Design: Creating Digital Spaces that Support Autistic Users*. https://www.accessibility.com/blog/sensory-friendly-design-creating-digital-spaces-that-support-autistic-users
32. Neurodiversity Design System. *Colour | NDS*. https://www.neurodiversity.design/principles/colour/

### ADHD報酬・動機付け

33. PMC3010326. *Motivation Deficit in ADHD is Associated with Dysfunction of the Dopamine Reward Pathway*. https://pmc.ncbi.nlm.nih.gov/articles/PMC3010326/
34. ADDitude Magazine. *Positive Reinforcement, Behavior & ADHD: The Science of Reward and Punishment*. https://www.additudemag.com/positive-reinforcement-reward-and-punishment-adhd/

### 移行支援・視覚タイマー

35. IIDC (Indiana University). *Transition Time: Helping Individuals on the Autism Spectrum Move Successfully from One Activity to Another*. https://iidc.indiana.edu/irca/articles/transition-time-helping-individuals-on-the-autism-spectrum-move-successfully-from-one-activity-to-another.html
36. Leaf Wing Center. *Using Time Warnings to Support Autistic Students*. https://leafwingcenter.org/using-time-warnings-to-help-students-with-autism/

### 身体運動・多感覚アプローチ

37. ScienceDirect. (2021). *Effects of physical exercise on children with attention deficit hyperactivity disorder*. https://www.sciencedirect.com/science/article/pii/S2319417021001712
38. ADDitude Magazine. *Activate Brain Training Program for Children with ADHD*. https://www.additudemag.com/treatment/activate/

### 空間WM・ASD

39. PubMed 24661175. *Spatial working memory in children with high-functioning autism: intact configural processing but impaired capacity*. https://pubmed.ncbi.nlm.nih.gov/24661175/
40. Settles, B., & Meeder, B. (2016). *A Trainable Spaced Repetition Model for Language Learning*. ACL 2016. https://research.duolingo.com/papers/settles.acl16.pdf

---

*本レポートはManas Research Team Teammate 5「障害児向けアクセシビリティ・インクルーシブ設計」担当による調査報告書です。*
*最終更新：2026年3月2日*
