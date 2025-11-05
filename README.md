# Calendar App

TypeScriptで構築されたカレンダーアプリケーション。フロントエンドはReact + Vite、バックエンドはCloudflare Workersを使用しています。

## 機能

- 月表示と週表示の切り替え
- 前月/翌月、前週/翌週の移動
- 今日の日付にハイライト

## 技術スタック

### フロントエンド
- React 18
- TypeScript
- Vite
- CSS (モジュールなし)

### バックエンド
- Cloudflare Workers
- Wrangler

### 開発ツール
- ESLint (コード品質チェック)
- Prettier (コードフォーマット)
- Vitest (テストフレームワーク)
- Husky + lint-staged (pre-commitフック)
- GitHub Actions (CI)

## セットアップ

```bash
# 依存関係のインストール
npm install

# Cloudflare Workers型定義の生成
npx wrangler types
```

## 開発

```bash
# フロントエンドの開発サーバーを起動
npm run dev

# Workerの開発サーバーを起動
npm run dev:worker
```

## テスト

```bash
# 全テストを実行
npm test

# フロントエンドのテストのみ
npm run test:frontend

# Workerのテストのみ
npm run test:worker

# ウォッチモードでテスト
npm run test:watch
```

## ビルド

```bash
# フロントエンドをビルド
npm run build
```

## コード品質チェック

```bash
# Lintチェック
npm run lint

# フォーマットチェック
npm run format:check

# フォーマット実行
npm run format
```

## CI/CD

GitHub Actionsを使用して、以下を自動実行します：
- ESLintチェック
- Prettierフォーマットチェック
- テスト実行
- ビルド確認

## デプロイ

Cloudflare Workersへのデプロイは、wranglerの設定後に以下で実行できます：

```bash
# Workerをデプロイ
npx wrangler deploy
```

## ディレクトリ構造

```
.
├── src/                      # フロントエンドソース
│   ├── components/          # Reactコンポーネント
│   ├── test/               # テストセットアップ
│   ├── App.tsx             # メインアプリコンポーネント
│   └── main.tsx            # エントリーポイント
├── worker/                  # Cloudflare Workerソース
│   ├── index.ts            # Workerエントリーポイント
│   └── index.test.ts       # Workerテスト
├── .github/workflows/       # GitHub Actions設定
└── dist/                    # ビルド出力 (git管理外)
```
