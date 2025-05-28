# Football Hub

### サッカー情報プラットフォーム
サッカーの試合・選手・チーム・ニュースなどの情報を提供

## 📚 ドキュメント

- 📋 **[プロジェクト概要](docs/PROJECT_OVERVIEW.md)**
- 🔄 **[画面遷移図](docs/SCREEN_TRANSITION.md)**
</div>

## 🌐 URL

[https://www.football-hub.jp/](https://www.football-hub.jp/)

### 🔑 テストアカウント

- **メールアドレス**: `test@test.com`
- **パスワード**: `testuser`

※ログインなしでも閲覧可能です。

## ✨ 主要機能

- 📊 **リーグ情報**

プレミアリーグ、ラ・リーガ、ブンデスリーガ、セリエA、リーグ・アン、欧州大会の順位表・試合日程

- 🏟️ **試合情報**

試合結果、試合日程、詳細統計

- ⚽ **チーム情報**

チーム詳細データ、所属選手一覧、直近の試合結果・予定、統計情報

- 👤 **選手情報**

選手プロフィール、パフォーマンス統計、キャリア履歴、詳細データ

- 📰 **ニュース機能**

最新サッカーニュース、チーム・選手別ニュース検索、関連記事表示

- ⭐ **お気に入り機能**

リーグ、チームのお気に入り登録（登録ユーザのみ可能）

- 🔐 **認証システム**

NextAuth.jsによる安全なユーザー管理、Supabase Storageによるプロフィール画像アップロード

- 📊 **リアルタイムデータ**

API-Footballによる最新の情報

- 📱 **レスポンシブ対応**

モバイル・タブレット・デスクトップ対応

## 🛠 技術スタック

### 言語・フレームワーク

<img src="https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react">　<img src="https://img.shields.io/badge/Next.js-15.3.2-000000?style=for-the-badge&logo=next.js">　<img src="https://img.shields.io/badge/TypeScript-5.2.2-007ACC?style=for-the-badge&logo=typescript">　<img src="https://img.shields.io/badge/Node.js-20.17.30-339933?style=for-the-badge&logo=node.js">

### UI・スタイリング

<img src="https://img.shields.io/badge/Tailwind_CSS-4.1.3-06B6D4?style=for-the-badge&logo=tailwindcss">　<img src="https://img.shields.io/badge/Lucide_React-0.487.0-000000?style=for-the-badge&logo=lucide">　<img src="https://img.shields.io/badge/Recharts-2.15.2-8884D8?style=for-the-badge&logo=recharts">

### ユーティリティ・ライブラリ

<img src="https://img.shields.io/badge/date--fns-4.1.0-770C56?style=for-the-badge&logo=date-fns">　<img src="https://img.shields.io/badge/clsx-2.1.1-FF6B6B?style=for-the-badge">　<img src="https://img.shields.io/badge/zod-3.24.2-3E67B1?style=for-the-badge">

### データベース

<img src="https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=for-the-badge&logo=prisma">　<img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql">　<img src="https://img.shields.io/badge/Supabase-2.49.8-3ECF8E?style=for-the-badge&logo=supabase">　<img src="https://img.shields.io/badge/Supabase_Storage-Latest-3ECF8E?style=for-the-badge&logo=supabase">

### 外部API

<img src="https://img.shields.io/badge/API--Football-FF6B35?style=for-the-badge">

### 認証・状態管理

<img src="https://img.shields.io/badge/NextAuth.js-4.24.11-000000?style=for-the-badge&logo=next.js">　<img src="https://img.shields.io/badge/Zustand-5.0.3-000000?style=for-the-badge&logo=react"> <img src="https://img.shields.io/badge/Upstash_Redis-1.34.6-DC382D?style=for-the-badge&logo=redis">

### インフラ・DevOps

<img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel">　<img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white">　<img src="https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white">

## 🗄️ データベース

### ER図

![supabase-schema-xpnextgtxaozdjqombiz (6)](https://github.com/user-attachments/assets/5a84cbdd-8492-495d-8f62-2f336a6c9d4b)

### 主要テーブル（Supabase PostgreSQL）

- **users**: ユーザー基本情報
- **leagues**: リーグ情報
- **Teams**: チーム情報
- **Players**: 選手情報
- **Favorite_Teams/Favorite_Leagues**: お気に入り機能

## 🏗️ インフラ構成

- 🗄️ **データベース**: Supabase PostgreSQL
- 📁 **ファイルストレージ**: Supabase Storage
- ⚡ **キャッシュ**: Upstash Redis
- 🚀 **デプロイ**: Vercel（フロントエンド・API）
- 🌐 **外部API**: API-Football
