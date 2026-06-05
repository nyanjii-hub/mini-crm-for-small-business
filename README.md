# MiniCRM for Small Business

小規模事業者向けのミニCRM。顧客・問い合わせ・請求・予約を1画面で管理する。

## 機能

| 機能 | URL | 説明 |
|------|-----|------|
| ログイン | `/login` | メール+パスワード認証 |
| 初回セットアップ | `/setup` | 会社名・代表名の登録 |
| ダッシュボード | `/dashboard` | 未返信・未支払い・今日の予約を一覧 |
| 顧客管理 | `/customers` | 顧客の追加・編集・削除 |
| 問い合わせ管理 | `/inquiries` | 未返信/返信済/完了のステータス管理 |
| 請求管理 | `/invoices` | 未支払い/支払い済・リマインド日管理 |
| 予約管理 | `/appointments` | 今日の予約・未確定の予約管理 |
| 公開予約フォーム | `/public-booking` | 顧客が直接予約できる公開フォーム |

## 技術スタック

- **フロント**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **バック**: Supabase (PostgreSQL + Auth)
- **フォーム**: react-hook-form + zod
- **デプロイ**: Vercel

## セットアップ

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を開いて Supabase の URL と Anon Key を設定する。

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Supabase マイグレーションの実行

Supabase ダッシュボードの SQL Editor で `supabase/migrations/001_init.sql` を実行する。

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開く。

### 5. デプロイ（Vercel）

```bash
npx vercel deploy
```

Vercel の環境変数に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定する。

## ディレクトリ構成

```
mini-crm/
├── src/
│   ├── app/
│   │   ├── (auth)/              # 認証が必要なルート
│   │   │   ├── dashboard/
│   │   │   ├── customers/
│   │   │   ├── inquiries/
│   │   │   ├── invoices/
│   │   │   └── appointments/
│   │   ├── login/
│   │   ├── setup/
│   │   ├── public-booking/
│   │   ├── api/
│   │   │   ├── customers/
│   │   │   ├── inquiries/
│   │   │   ├── invoices/
│   │   │   ├── appointments/
│   │   │   └── public/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/             # ナビゲーション・レイアウト
│   │   ├── ui/                 # 共通UIコンポーネント
│   │   └── forms/              # フォームコンポーネント
│   ├── lib/
│   │   ├── supabase/           # Supabaseクライアント設定
│   │   └── validations/        # Zodスキーマ
│   └── types/
│       └── index.ts            # 型定義
├── supabase/
│   └── migrations/
│       └── 001_init.sql        # 初期テーブル定義
├── .env.example
├── .env.local                  # (gitignore済み)
└── README.md
```

## Supabase RLS (Row Level Security)

- `customers`, `inquiries`, `invoices`, `appointments` テーブルは認証ユーザーのみアクセス可
- `public-booking` からの `appointments` / `customers` への INSERT は anon ユーザーも許可
