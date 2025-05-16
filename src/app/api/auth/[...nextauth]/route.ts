/**
 * NextAuth.js APIハンドラー
 * NextAuth.jsのAPIエンドポイントを定義し、認証機能を提供する
 */
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// NextAuth.jsハンドラーを作成してエクスポート
const handler = NextAuth(authOptions);

// APIルートハンドラーとしてGETとPOSTメソッドをエクスポート
export { handler as GET, handler as POST };
