/**
 * グローバルなPrismaクライアントのシングルトンインスタンスを提供するモジュール
 * アプリケーション全体で一貫したデータベース接続を使用するために使用
 */

import { PrismaClient } from '@prisma/client';

// グローバルスコープでPrismaクライアントの型を宣言
declare global {
  var prisma: PrismaClient | undefined;
}

// 開発環境での接続の重複を避けるためのシングルトンパターン
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 開発環境でのホットリロード時に複数のインスタンスが作成されるのを防止
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
