# Football Hub

<div align="center">

サッカーの情報を提供するWebアプリケーション

[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)

</div>

## 🌐 デモサイト

**URL**: [https://www.football-hub.jp/](https://www.football-hub.jp/)

### 🔑 テストアカウント

- **メールアドレス**: `test@test.com`
- **パスワード**: `test_user`

※ログインなしでも閲覧可能です。

## ✨ 主要機能

- 📊 **リーグ情報**: プレミアリーグ、ラ・リーガ、ブンデスリーガ、セリエA、リーグ・アン、欧州大会の順位表・試合日程
- 🏟️ **試合情報**: 試合結果、試合日程、詳細統計、
- ⚽ **チーム情報**: チーム詳細データ、所属選手一覧、直近の試合結果・予定、統計情報
- 👤 **選手情報**: 選手プロフィール、パフォーマンス統計、キャリア履歴、詳細データ
- 📰 **ニュース機能**: 最新サッカーニュース、チーム・選手別ニュース検索、関連記事表示
- ⭐ **お気に入り機能**: リーグ、チームのお気に入り登録（登録ユーザのみ可能）
- 🔐 **認証システム**: NextAuth.jsによる安全なユーザー管理、プロフィール画像アップロード
- 📊 **リアルタイムデータ**: API-Footballによる最新の情報
- 📱 **レスポンシブ対応**: モバイル・タブレット・デスクトップ対応

## 🛠 技術スタック

### Frontend

<img src="https://img.shields.io/badge/-React-61DAFB.svg?logo=react&style=for-the-badge&logoColor=black">
<img src="https://img.shields.io/badge/-Next.js-000000.svg?logo=next.js&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-TypeScript-007ACC.svg?logo=typescript&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-TailwindCSS-06B6D4.svg?logo=tailwindcss&style=for-the-badge&logoColor=white">

### Backend & Database

<img src="https://img.shields.io/badge/-Prisma-2D3748.svg?logo=prisma&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-PostgreSQL-336791.svg?logo=postgresql&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Supabase-3ECF8E.svg?logo=supabase&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Redis-DC382D.svg?logo=redis&style=for-the-badge&logoColor=white">

### Authentication & State Management

<img src="https://img.shields.io/badge/-NextAuth.js-000000.svg?logo=next.js&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-TanStack_Query-FF4154.svg?logo=react-query&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Zustand-000000.svg?logo=react&style=for-the-badge&logoColor=white">

### Infrastructure & DevOps

<img src="https://img.shields.io/badge/-Docker-2496ED.svg?logo=docker&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Docker_Compose-2496ED.svg?logo=docker&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Node.js-339933.svg?logo=node.js&style=for-the-badge&logoColor=white">

### UI & Utils

<img src="https://img.shields.io/badge/-Lucide_React-000000.svg?logo=lucide&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-date--fns-770C56.svg?logo=date-fns&style=for-the-badge&logoColor=white">
<img src="https://img.shields.io/badge/-Recharts-8884D8.svg?logo=recharts&style=for-the-badge&logoColor=white">

## 🏗️ プロジェクト構成

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── leagues/           # リーグ関連ページ
│   ├── teams/             # チーム関連ページ
│   ├── players/           # 選手関連ページ
│   ├── matches/           # 試合関連ページ
│   ├── news/              # ニュース関連ページ
│   ├── login/             # ログインページ
│   ├── register/          # 登録ページ
│   ├── profile/           # プロフィールページ
│   ├── layout.tsx         # 共通レイアウト
│   ├── page.tsx           # ホームページ
│   └── globals.css        # グローバルスタイル
├── components/            # 共通コンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   ├── common/           # 汎用コンポーネント
│   ├── ui/               # UIコンポーネント
│   └── feedback/         # フィードバックコンポーネント
├── features/             # 機能別コンポーネント
│   ├── auth/             # 認証機能
│   ├── leagues/          # リーグ機能
│   ├── teams/            # チーム機能
│   ├── players/          # 選手機能
│   ├── matches/          # 試合機能
│   ├── news/             # ニュース機能
│   ├── favorites/        # お気に入り機能
│   ├── profile/          # プロフィール機能
│   └── navigation/       # ナビゲーション
├── lib/                  # ライブラリとユーティリティ
│   ├── api-football/     # 外部API統合
│   ├── auth/             # 認証関連
│   ├── prisma/           # Prismaクライアント
│   ├── supabase/         # Supabase統合
│   ├── media/            # メディア処理
│   ├── sync/             # データ同期
│   └── redis.ts          # Redisクライアント
├── providers/            # React Context プロバイダー
├── types/                # TypeScript型定義
├── utils/                # ユーティリティ関数
└── config/               # 設定ファイル
```

## 🗄️ データベース設計

### ER図

![supabase-schema-xpnextgtxaozdjqombiz (6)](https://github.com/user-attachments/assets/5a84cbdd-8492-495d-8f62-2f336a6c9d4b)

- **users**: ユーザー基本情報
- **leagues**: リーグ情報
- **Teams**: チーム情報
- **Players**: 選手情報
- **Favorite_Teams/Favorite_Leagues**: お気に入り機能
