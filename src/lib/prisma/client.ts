/**
 * グローバルなPrismaクライアントのシングルトンインスタンスを提供するモジュール
 * アプリケーション全体で一貫したデータベース接続を使用するために使用
 */

import { PrismaClient } from '@prisma/client';

// グローバルスコープでPrismaクライアントの型を宣言
declare global {
  var prisma: PrismaClient | undefined;
}

// Vercel環境用のチェック
const isVercelProd = process.env.VERCEL === '1';

// 開発環境での接続の重複を避けるためのシングルトンパターン
export const prisma =
  (global.prisma as PrismaClient) ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 開発環境でのホットリロード時に複数のインスタンスが作成されるのを防止
// Vercel環境ではグローバル変数を設定しない
if (process.env.NODE_ENV !== 'production' && !isVercelProd) {
  global.prisma = prisma;
}
