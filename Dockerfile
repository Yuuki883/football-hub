# ベースイメージとしてNode.js 20を使用
FROM node:20-bullseye-slim

# 作業ディレクトリを設定
WORKDIR /app

# libssl1.1をインストール（Prismaが必要とする依存関係）
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    libssl1.1 \
    && rm -rf /var/lib/apt/lists/* # キャッシュを削除してイメージサイズを削減

# 依存関係をインストールする前に、package.jsonとlockファイルをコピー
# （レイヤーキャッシングを活用するため）
COPY package*.json yarn.lock* ./

# 全ての依存関係をインストール
RUN npm install

# Prismaスキーマをコピーしてクライアントを生成
COPY prisma ./prisma/
RUN npx prisma generate

# コンテナがリッスンするポートを指定
EXPOSE 3000

# コンテナ起動時に実行するコマンド
# 1. Prismaマイグレーションを適用
# 2. Prismaクライアントを再生成
# 3. 開発サーバーを起動
CMD npx prisma migrate deploy && npx prisma generate && npm run dev
