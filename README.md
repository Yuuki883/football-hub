# football-hub

サッカーのヨーロッパ 5 大リーグ、国際試合、選手個人のデータを取得して情報を表示するウェブアプリケーションです。お気に入りのチーム、選手に関する情報、ニュースを確認できます。

## 🛠 技術スタック

| 技術         | バージョン |
| ------------ | ---------- |
| React        | 18.2.0     |
| TypeScript   | 5.2.2      |
| Next.js      | 14.0.4     |
| Node.js      | 20.10.0    |
| Supabase     | 2.39.3     |
| Prisma       | 5.6.0      |
| Tailwind CSS | 3.3.5      |


## 📝 要件定義

### 機能要件

#### 1. ユーザー関連機能

- ユーザー登録・ログイン (Supabase Auth)
- プロフィール設定・編集
- お気に入りチーム・選手の登録/削除

#### 2. リーグ・大会情報機能

- ヨーロッパ 5 大リーグ情報表示
- 国際大会情報表示
- リーグ/大会の順位表表示
- 試合日程・結果一覧表示

#### 3. チーム情報機能

- チーム基本情報表示
- チーム所属選手一覧
- 直近の試合結果・予定
- チーム統計情報

#### 4. 選手情報機能

- 選手基本情報表示
- 選手統計情報表示
- キャリア履歴表示

#### 5. 試合情報機能

- 試合基本情報表示
- スコア・得点者情報
- 試合統計表示

#### 6. ニュース機能

- 最新サッカーニュース一覧
- チーム・選手別ニュース検索
- お気に入り対象の関連ニュース

#### 7. パーソナライズ機能

- カスタマイズ可能なダッシュボード
- お気に入りに基づいた情報表示
- 通知設定・管理

### 非機能要件

#### 1. パフォーマンス

- 初期読み込み時間: 2 秒以内
- API 応答時間: 1 秒以内
- Lighthouse Performance Score: 90 以上

#### 2. レスポンシブ対応

- モバイル、タブレット、デスクトップの各画面サイズに対応

#### 3. セキュリティ

- Supabase RLS によるデータアクセス制御
- 認証・認可の適切な実装

#### 4. API 使用最適化

- キャッシュ戦略によるリクエスト削減
- バッチ処理によるリクエスト効率化

### システムアーキテクチャ

````ascii
                   +----------------+
                   |                |
  +-------------+  |   Next.js      |  +-------------------+
  |             |  |   (Frontend &  |  |  External APIs    |
  |  ユーザー   +--+   Backend API) +--+  - Football-data.org |
  |             |  |                |  |  - TheSportsDB    |
  +-------------+  +-------+--------+  |  - Gnews API      |
                           |           +-------------------+
                   +-------v--------+
                   |                |  +-------------+
                   |   Supabase     +--+             |
                   |   (Auth, DB,   |  |   Prisma    |
                   |   Storage)     |  |   (ORM)     |
                   |                |  |             |
                   +----------------+  +-------------+


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### ER図

[UplerDiagram
    User ||--o{ FavoriteTeam : "favorites"
    User ||--o{ Comment : "comments"
    User ||--o{ Prediction : "predictions"
    User ||--o{ Notification : "notifications"
    User ||--o{ UserSetting : "settings"
    User ||--o{ AnalysisDashboard : "dashboards"
    
    Match ||--o{ MatchEvent : "events"
    Match ||--o{ MatchStats : "stats"
    Match ||--o{ MatchLineup : "lineups"
    Match ||--o{ Comment : "comments"
    Match ||--o{ Prediction : "predictions"
    Match ||--o{ AdvancedStats : "advancedStats"
    
    Team ||--o{ Player : "players"
    Team ||--o{ Match : "homeMatches"
    Team ||--o{ Match : "awayMatches"
    Team ||--o{ TeamStats : "stats"
    Team ||--o{ AdvancedStats : "advancedStats"
    Team ||--o{ FavoriteTeam : "favoritedBy"
    
    Competition ||--o{ Season : "seasons"
    Competition ||--o{ Match : "matches"
    Competition ||--o{ Standing : "standings"
    
    Season ||--o{ Match : "matches"
    Season ||--o{ Standing : "standings"
    
    Player ||--o{ PlayerStats : "stats"
    Player ||--o{ MatchLineup : "appearances"
    Player ||--o{ MatchEvent : "events"
    Player ||--o{ AdvancedStats : "advancedStats"
    
    AdvancedStats ||--o{ AnalysisDashboard : "usedIn"
    
    User {
        string id PK
        string email UK
        string name
        string hashedPassword
        string image
        datetime createdAt
        datetime updatedAt
        enum role
    }
    
    UserSetting {
        string id PK
        string userId FK
        boolean darkMode
        string[] favoriteLeagues
        string language
        json notificationSettings
        datetime updatedAt
    }
    
    FavoriteTeam {
        string id PK
        string userId FK
        string teamId FK
        datetime createdAt
    }
    
    Match {
        string id PK
        int apiId UK
        string competitionId FK
        string seasonId FK
        string homeTeamId FK
        string awayTeamId FK
        int homeScore
        int awayScore
        enum status
        datetime startTime
        int matchday
        string venue
        string referee
        datetime lastUpdated
    }
    
    MatchEvent {
        string id PK
        string matchId FK
        int minute
        enum type
        string teamId FK
        string playerId FK
        string assistPlayerId FK
        string detail
        datetime createdAt
    }
    
    MatchStats {
        string id PK
        string matchId FK
        string teamId FK
        int shots
        int shotsOnTarget
        int possession
        int passes
        int fouls
        int corners
        int offsides
        int yellowCards
        int redCards
        datetime lastUpdated
    }
    
    MatchLineup {
        string id PK
        string matchId FK
        string teamId FK
        string playerId FK
        enum position
        boolean starter
        int shirtNumber
        int minutesPlayed
        datetime lastUpdated
    }
    
    Team {
        string id PK
        int apiId UK
        string name
        string shortName
        string tla
        string crestUrl
        string address
        string website
        int founded
        string clubColors
        string venue
        datetime lastUpdated
    }
    
    TeamStats {
        string id PK
        string teamId FK
        string seasonId FK
        int wins
        int draws
        int losses
        int goalsFor
        int goalsAgainst
        int points
        int matchesPlayed
        datetime lastUpdated
    }
    
    Player {
        string id PK
        int apiId UK
        string name
        string position
        datetime dateOfBirth
        string nationality
        int shirtNumber
        string teamId FK
        string image
        datetime lastUpdated
    }
    
    PlayerStats {
        string id PK
        string playerId FK
        string seasonId FK
        int appearances
        int goals
        int assists
        int yellowCards
        int redCards
        int minutesPlayed
        datetime lastUpdated
    }
    
    Competition {
        string id PK
        int apiId UK
        string name
        string code
        string type
        string emblemUrl
        datetime lastUpdated
    }
    
    Season {
        string id PK
        string competitionId FK
        int apiId UK
        datetime startDate
        datetime endDate
        int currentMatchday
        boolean current
        string winner
        datetime lastUpdated
    }
    
    Standing {
        string id PK
        string competitionId FK
        string seasonId FK
        string teamId FK
        int position
        int playedGames
        int points
        int won
        int draw
        int lost
        int goalsFor
        int goalsAgainst
        int goalDifference
        datetime lastUpdated
    }
    
    Comment {
        string id PK
        string userId FK
        string matchId FK
        string content
        datetime createdAt
        datetime updatedAt
    }
    
    Prediction {
        string id PK
        string userId FK
        string matchId FK
        int homeScore
        int awayScore
        int points
        datetime createdAt
    }
    
    Notification {
        string id PK
        string userId FK
        string title
        string message
        enum type
        boolean isRead
        json data
        datetime createdAt
    }
    
    AdvancedStats {
        string id PK
        string entityType
        string entityId
        string matchId FK
        string type
        json data
        datetime createdAt
        datetime lastUpdated
    }
    
    AnalysisDashboard {
        string id PK
        string userId FK
        string name
        json layout
        json widgets
        datetime createdAt
        datetime updatedAt
    }
oading er-diagram.mermaid…]()



## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
````

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
