# Claude Code開発ガイド

このドキュメントは、Claude Codeを使用してこのプロジェクトを開発する際のガイドラインと注意事項をまとめたものです。

## プロジェクト概要

TypeScript + React + Cloudflare Workersで構築されたカレンダーアプリケーション。Googleカレンダー連携機能を持ち、ユーザーのカレンダーデータを取得して表示します。

## プロジェクト構造

```
hackathon-calendar-app/
├── src/              # フロントエンド (React + TypeScript)
├── worker/           # バックエンド (Cloudflare Workers)
├── .github/          # CI/CD設定
└── tests/            # テストファイル
```

## 開発の基本方針

### コードスタイル
- **TypeScript**: すべてのコードはTypeScriptで記述
- **型安全性**: 型アノテーションを適切に使用し、`any`の使用を最小限に
- **ESLint + Prettier**: 自動フォーマットとリント

### テスト
- **Vitest**: フロントエンドとWorkerの両方のテストに使用
- **Testing Library**: Reactコンポーネントのテスト
- **カバレッジ**: 主要機能は必ずテストを追加

### Git & コミット
- **Husky**: pre-commitフックで自動チェック
  - TypeScriptのコンパイルチェック
  - ESLintチェック
  - テスト実行
- **コミットメッセージ**: 明確で簡潔に

## 重要なファイルとその役割

### フロントエンド

#### `src/App.tsx`
メインアプリケーションコンポーネント
- カレンダー表示の制御
- Googleカレンダー連携のロジック
- 認証状態管理
- イベントデータの取得と管理

#### `src/components/Calendar.tsx`
カレンダー表示コンポーネント
- 月表示/週表示の実装
- 日付の計算とレイアウト
- イベントの表示

### バックエンド

#### `worker/index.ts`
Cloudflare Workerのメインハンドラー
- APIルーティング
- エラーハンドリング
- CORS設定

#### `worker/auth.ts`
Google OAuth2認証ロジック
- 認証URL生成
- トークン交換
- セッション管理

#### `worker/calendar.ts`
Google Calendar API連携
- イベントデータ取得

#### `worker/types.ts`
型定義
- 環境変数の型
- Google APIレスポンスの型

### 設定ファイル

#### `wrangler.toml`
Cloudflare Workers設定
- 環境変数
- ビルド設定
- アセット設定

#### `.dev.vars`
開発環境用の環境変数（`.gitignore`に追加済み）
- Google OAuth2クレデンシャル
- セッションシークレット

## よくある開発タスク

### 1. 新しいAPIエンドポイントの追加

`worker/index.ts`にルーティングを追加:

```typescript
if (url.pathname === '/api/new-endpoint') {
  // 実装
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  })
}
```

### 2. 新しいコンポーネントの追加

`src/components/`に新しいコンポーネントを作成:

```typescript
// src/components/NewComponent.tsx
import './NewComponent.css'

interface NewComponentProps {
  // props定義
}

const NewComponent = ({ }: NewComponentProps) => {
  return <div>Content</div>
}

export default NewComponent
```

対応するテストも作成:
```typescript
// src/components/NewComponent.test.tsx
import { render, screen } from '@testing-library/react'
import NewComponent from './NewComponent'

describe('NewComponent', () => {
  it('renders correctly', () => {
    render(<NewComponent />)
    // assertions
  })
})
```

### 3. 環境変数の追加

1. `worker/types.ts`の`Env`インターフェースに追加
2. `wrangler.toml`に設定を追加
3. `.dev.vars.example`を更新
4. `.dev.vars`に実際の値を設定

### 4. Google API機能の追加

1. `worker/calendar.ts`に新しい関数を追加
2. 必要な型を`worker/types.ts`に追加
3. `worker/index.ts`にエンドポイントを追加
4. フロントエンドで使用

## 開発ワークフロー

### 1. 機能開発の流れ

```bash
# 1. ブランチ作成
git checkout -b feature/new-feature

# 2. 開発サーバー起動
npm run dev           # フロントエンド
npm run dev:worker    # バックエンド

# 3. 開発 & テスト
npm run test:watch

# 4. コード品質チェック
npm run lint
npm run format:check
npm run typecheck

# 5. コミット（pre-commitフックが自動実行）
git add .
git commit -m "feat: add new feature"

# 6. プッシュ
git push origin feature/new-feature
```

### 2. テストの実行

```bash
# すべてのテスト
npm test

# フロントエンドのみ
npm run test:frontend

# Workerのみ
npm run test:worker

# ウォッチモード
npm run test:watch
```

### 3. ビルドとデプロイ

```bash
# ビルド
npm run build

# デプロイ（Cloudflare Workers）
npx wrangler deploy
```

#### デプロイメント環境

このプロジェクトは、Cloudflare Workersに複数の環境でデプロイされます：

- **本番環境**: https://calendar-worker.gyu-don.workers.dev/
- **コミットIDごとのプレビュー**: `https://<commit-id>-calendar-worker.gyu-don.workers.dev/`
  - 例: `https://16762b7a-calendar-worker.gyu-don.workers.dev/`
- **ブランチごとのプレビュー**: `https://<branch-name>-calendar-worker.gyu-don.workers.dev/`
  - 例: `https://feature-calendar-app-foundation-calendar-worker.gyu-don.workers.dev/`
- **ローカル開発**: `http://localhost:8787/`

#### Google OAuth2のリダイレクトURI設定

Google Cloud Consoleで、OAuth2クライアントに以下のリダイレクトURIを登録してください：

```
https://calendar-worker.gyu-don.workers.dev/auth/callback
http://localhost:8787/auth/callback
```

**プレビュー環境での認証**：
- コミットIDやブランチごとのプレビューURLは動的に生成されるため、すべてのURLをGoogle Cloud Consoleに登録することは現実的ではありません
- ただし、**セッションクッキーはすべての`*.gyu-don.workers.dev`サブドメインで共有される**よう実装されています
- これにより、以下の手順でプレビュー環境でもOAuth機能をテストできます：

**プレビュー環境でOAuth機能をテストする手順**：
1. 本番環境（`https://calendar-worker.gyu-don.workers.dev/`）で認証を実行
2. 認証成功後、同じブラウザでプレビュー環境のURLにアクセス
3. セッションクッキーが共有されているため、プレビュー環境でも認証済み状態で動作します

**セキュリティ上の注意**：
- `Domain=.gyu-don.workers.dev`により、すべてのサブドメインでクッキーが共有されます
- 他のWorkerプロジェクトも同じドメインを使用している場合、理論的にはアクセス可能です
- 開発/テスト環境用の設定として使用してください
- より厳格なセキュリティが必要な場合は、Cloudflare KVを使用したセッション管理への移行を検討してください

## 注意事項

### セキュリティ

1. **機密情報を含めない**
   - `.dev.vars`は絶対にコミットしない
   - APIキー、シークレットはすべて環境変数で管理

2. **CORS設定**
   - 開発環境では`Access-Control-Allow-Origin: *`を使用
   - 本番環境では特定のオリジンのみ許可するよう変更

3. **セッション管理**
   - 現在の実装は簡易版
   - 本番環境では暗号化・署名の実装を推奨

### パフォーマンス

1. **API呼び出し**
   - 不要なAPI呼び出しを避ける
   - 適切なキャッシング戦略を実装

2. **バンドルサイズ**
   - 必要なライブラリのみインポート
   - Dynamic importを活用

### TypeScript

1. **型安全性**
   - `any`の使用を避ける
   - 外部APIのレスポンスは必ず型定義

2. **null/undefined**
   - Optional chainingを活用: `obj?.prop`
   - Nullish coalescing: `value ?? defaultValue`

## トラブルシューティング

### ビルドエラー

```bash
# キャッシュクリア
rm -rf node_modules dist .vite
npm install
npm run build
```

### 型エラー

```bash
# Workerの型定義を再生成
npx wrangler types
```

### テスト失敗

```bash
# distディレクトリを作成（Worker テストで必要）
mkdir -p dist
npm test
```

### OAuth2エラー

1. Google Cloud Consoleで設定を確認
2. リダイレクトURIが正確に一致するか確認
3. `.dev.vars`の内容を確認
4. アクセススコープが正しいか確認
5. **プレビュー環境でのOAuth認証エラー**:
   - プレビュー環境で直接OAuth認証を実行しようとすると、リダイレクトURIが登録されていないため失敗します
   - 解決方法: 本番環境（`https://calendar-worker.gyu-don.workers.dev/`）で認証を実行してから、プレビュー環境にアクセスしてください
   - セッションクッキーが`*.gyu-don.workers.dev`全体で共有されているため、認証情報が引き継がれます

## 参考リンク

### Cloudflare
- [Cloudflare Workers ドキュメント](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### Google APIs
- [Google Calendar API](https://developers.google.com/calendar/api/v3/reference)
- [OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

### フレームワーク
- [React ドキュメント](https://react.dev/)
- [Vite ドキュメント](https://vitejs.dev/)
- [Vitest ドキュメント](https://vitest.dev/)

## ベストプラクティス

### コード組織

1. **関数は小さく保つ**: 1つの関数は1つの責務
2. **コンポーネントの分割**: 大きなコンポーネントは小さく分割
3. **定数の集約**: マジックナンバーを避け、定数として定義

### エラーハンドリング

```typescript
try {
  // 処理
} catch (error) {
  console.error('Error:', error)
  // 適切なエラーレスポンス
  return new Response(
    JSON.stringify({
      error: 'Something went wrong',
      message: error instanceof Error ? error.message : 'Unknown error'
    }),
    { status: 500 }
  )
}
```

### 非同期処理

```typescript
// async/awaitを使用
const data = await fetchData()

// Promise.allで並列実行
const [data1, data2] = await Promise.all([
  fetchData1(),
  fetchData2(),
])
```

## 開発時のチェックリスト

新機能追加時:
- [ ] 型定義を追加
- [ ] テストを追加
- [ ] エラーハンドリング実装
- [ ] ドキュメント更新
- [ ] ESLint/Prettierチェック通過
- [ ] すべてのテストが成功
- [ ] TypeScriptコンパイルエラーなし
- [ ] ドキュメント更新(必要なとき)

本番デプロイ前:
- [ ] 環境変数の設定確認
- [ ] CORS設定の確認
- [ ] セキュリティ監査
- [ ] パフォーマンステスト
- [ ] エラーハンドリングの確認
