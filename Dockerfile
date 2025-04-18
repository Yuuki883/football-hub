# 開発用
FROM node:20-alpine

WORKDIR /app

# package.json / yarn.lock / package-lock.json を先にコピー
COPY package*.json yarn.lock* ./

# 開発用依存関係をインストール
RUN npm install

# ソースコードは後で docker-compose.yml のボリュームマウントで反映
EXPOSE 3000

CMD ["npm", "run", "dev"]
