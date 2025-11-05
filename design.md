# カレンダーアプリ設計ドキュメント

## 概要

このドキュメントでは、Googleカレンダー連携機能を含むカレンダーアプリケーションの設計とアーキテクチャについて説明します。

## アーキテクチャ

### 全体構成

```
┌─────────────────┐
│   フロントエンド  │
│   (React + Vite) │
└────────┬────────┘
         │ HTTP/REST API
         │
┌────────▼────────┐
│  Cloudflare     │
│  Workers        │
└────────┬────────┘
         │ OAuth2 + REST API
         │
┌────────▼────────┐
│  Google APIs    │
│  (Calendar)     │
└─────────────────┘
```

### 技術スタック

#### フロントエンド
- **React 18**: UIライブラリ
- **TypeScript**: 型安全な開発
- **Vite**: 高速ビルドツール
- **CSS**: スタイリング

#### バックエンド
- **Cloudflare Workers**: サーバーレス実行環境
- **Wrangler**: Cloudflare Workers CLI
- **TypeScript**: 型安全な開発

#### 認証・API連携
- **Google OAuth 2.0**: 認証フロー
- **Google Calendar API**: カレンダーデータ取得

## プロジェクト構造

```
hackathon-calendar-app/
│
├── src/                          # フロントエンドコード
│   ├── components/               # Reactコンポーネント
│   │   ├── Calendar.tsx          # カレンダー表示コンポーネント
│   │   └── Calendar.css          # カレンダースタイル
│   ├── test/                     # テストセットアップ
│   │   └── setup.ts              # Vitestセットアップ
│   ├── App.tsx                   # メインアプリコンポーネント
│   ├── App.css                   # アプリスタイル
│   └── main.tsx                  # エントリーポイント
│
├── worker/                       # バックエンドコード
│   ├── index.ts                  # Workerメインハンドラー
│   ├── auth.ts                   # Google OAuth2関連
│   ├── calendar.ts               # Google Calendar API関連
│   ├── types.ts                  # 型定義
│   └── index.test.ts             # Workerテスト
│
├── .github/workflows/            # CI/CD設定
├── wrangler.toml                 # Cloudflare Workers設定
├── .dev.vars.example             # 環境変数サンプル
├── package.json                  # プロジェクト設定
└── vite.config.ts                # Viteビルド設定
```

## 主要機能

### 1. カレンダー表示
- **月表示**: カレンダーの月間ビュー
- **週表示**: カレンダーの週間ビュー
- **ナビゲーション**: 前/次の期間への移動、今日へジャンプ

### 2. Googleカレンダー連携
- **OAuth2認証**: Googleアカウントでログイン
- **予定取得**: Googleカレンダーから予定を取得
- **予定表示**: カレンダー上に予定を表示

## データフロー

### OAuth2認証フロー

```
1. ユーザーが「Googleカレンダー連携」ボタンをクリック
   ↓
2. フロントエンド: GET /api/auth/google
   ↓
3. バックエンド: Google認証URL生成
   ↓
4. フロントエンド: Googleログインページへリダイレクト
   ↓
5. Google: ユーザー認証
   ↓
6. Google: コールバックURL (/api/auth/callback?code=xxx) へリダイレクト
   ↓
7. バックエンド: 認可コードをアクセストークンに交換
   ↓
8. バックエンド: セッションCookie設定、フロントエンドへリダイレクト
   ↓
9. フロントエンド: 認証完了、予定取得開始
```

### 予定取得フロー

```
1. フロントエンド: GET /api/calendar/events?startDate=xxx&endDate=xxx
   ↓
2. バックエンド: Cookieからアクセストークン取得
   ↓
3. バックエンド: Google Calendar APIへリクエスト
   ↓
4. Google Calendar API: 予定データ返却
   ↓
5. バックエンド: フロントエンドへJSON返却
   ↓
6. フロントエンド: カレンダーに予定を表示
```

## APIエンドポイント

### GET /api/health
ヘルスチェック

**レスポンス**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T12:00:00.000Z"
}
```

### GET /api/auth/google
Google OAuth2認証URL取得

**レスポンス**:
```json
{
  "authUrl": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

### GET /api/auth/callback?code={code}
OAuth2コールバック（内部使用）

**パラメータ**:
- `code`: 認可コード

**動作**:
- アクセストークン取得
- セッションCookie設定
- フロントエンドへリダイレクト

### GET /api/calendar/events
Googleカレンダーイベント取得

**パラメータ**:
- `startDate` (optional): ISO 8601形式の開始日時
- `endDate` (optional): ISO 8601形式の終了日時

**レスポンス**:
```json
{
  "events": [
    {
      "id": "event-id",
      "summary": "イベントタイトル",
      "start": {
        "dateTime": "2025-11-05T10:00:00+09:00"
      },
      "end": {
        "dateTime": "2025-11-05T11:00:00+09:00"
      }
    }
  ]
}
```

## データモデル

### CalendarEvent (フロントエンド)
```typescript
interface CalendarEvent {
  id: string
  summary: string
  start: {
    dateTime?: string  // ISO 8601形式
    date?: string      // YYYY-MM-DD形式（終日イベント）
  }
  end: {
    dateTime?: string
    date?: string
  }
}
```

### GoogleCalendarEvent (バックエンド)
```typescript
interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  location?: string
  status: string
}
```

## セキュリティ考慮事項

### 認証
- OAuth2を使用した安全な認証フロー
- アクセストークンはCookieに保存（HttpOnly, SameSite=Lax）
- トークン有効期限: 1時間

### CORS
- 開発環境: すべてのオリジンを許可 (`Access-Control-Allow-Origin: *`)
- 本番環境: 特定のオリジンのみ許可するよう変更を推奨

### 環境変数
- 機密情報（CLIENT_SECRET等）は環境変数で管理
- `.dev.vars`ファイルは`.gitignore`に追加
- 本番環境では`wrangler secret put`コマンドでシークレット設定

## 開発環境設定

### 必要な環境変数
`.dev.vars`ファイルに以下を設定:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
SESSION_SECRET=your-random-secret-key-here
```

### Google Cloud Console設定

1. Google Cloud Consoleでプロジェクト作成
2. Google Calendar APIを有効化
3. OAuth 2.0クライアントID作成
   - アプリケーションの種類: ウェブアプリケーション
   - 承認済みのリダイレクトURI: `http://localhost:8787/api/auth/callback`
