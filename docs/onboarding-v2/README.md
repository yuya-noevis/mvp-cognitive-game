# オンボーディングv2 実行手順

## ファイル一覧
| ファイル | 内容 | セッション |
|---------|------|-----------|
| `prompt-onboarding-v2.md` | 完全仕様書（参照用） | - |
| `onboarding-v2/step1-explore.md` | Step 1: 探索 | セッション1 |
| `onboarding-v2/step2-plan.md` | Step 2: 計画 | セッション1（続き） |
| `onboarding-v2/step3-implement.md` | Step 3: 実装 | セッション2（/clear後） |
| `onboarding-v2/step4-verify.md` | Step 4: 検証 | セッション3（/clear後） |

## 実行手順

### セッション1: 探索 → 計画
```
Claude Codeで以下を実行：

1. 「docs/onboarding-v2/step1-explore.md を読み込み、指示に従ってください」
2. 報告を確認
3. 「docs/onboarding-v2/step2-plan.md を読み込み、指示に従ってください」
4. 計画を確認してOKを出す
```

### セッション2: 実装（/clear してから）
```
1. /clear
2. 「docs/prompt-onboarding-v2.md を読み込んで仕様を把握してください。その後 docs/onboarding-v2/step3-implement.md を読み込み、指示に従って実装してください」
3. 実装中にコンテキストが50%を超えたら /compact
```

### セッション3: 検証（/clear してから）
```
1. /clear
2. 「docs/onboarding-v2/step4-verify.md を読み込み、指示に従って検証してください」
3. 問題があれば修正 → 再検証
4. 全てOKならコミット
```

## 重要ルール
- 各セッション間で必ず /clear する（コンテキスト汚染防止）
- Step 2の計画が承認されるまでStep 3に進まない
- Step 3の途中でコンテキスト50%超えたら /compact
- 問題が2回修正しても直らない場合は /clear して新しいアプローチ
