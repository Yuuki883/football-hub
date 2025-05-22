/**
 * NextAuth.jsの設定を行うモジュール
 * 認証プロバイダーの設定、セッション管理、コールバック関数などを定義
 */

import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma/client';
import { compare } from 'bcryptjs';
import { Role } from '@prisma/client';
import { Adapter } from 'next-auth/adapters';

// カスタムアダプターを作成して型の互換性問題を解決
const customPrismaAdapter = (): Adapter => {
  const adapter = PrismaAdapter(prisma) as any;
  return adapter;
};

/**
 * NextAuth.jsの設定オプション
 */
export const authOptions: NextAuthOptions = {
  // カスタムPrismaAdapterを使用してデータベースとの連携を行う
  adapter: customPrismaAdapter(),
  // 認証プロバイダーの設定
  providers: [
    // メール/パスワードによる認証
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // ユーザーをメールアドレスで検索
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // ユーザーが存在しない、またはパスワードが設定されていない場合
        if (!user || !user.hashedPassword) {
          return null;
        }

        // パスワードの一致を確認
        const passwordMatches = await compare(credentials.password, user.hashedPassword);

        if (!passwordMatches) {
          return null;
        }

        // 認証成功時に返すユーザー情報
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  // セッション管理方法の設定（JWTを使用）
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日間
  },
  // コールバック関数の設定
  callbacks: {
    // JWTトークンにユーザー情報を追加
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // セッションオブジェクトにユーザー情報を追加
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;

        // 必要な場合はDBから画像URLのみを取得
        if (session.user.id) {
          const userProfile = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { image: true },
          });

          // 画像があればセッションに追加（Base64全体ではなくURLまたは参照のみ）
          if (userProfile?.image) {
            // Base64データが大きい場合は、先頭部分だけを使用する
            // または、画像ストレージへの参照URLだけを入れる考え方もある
            const isBase64 = userProfile.image.startsWith('data:');
            session.user.image = isBase64
              ? userProfile.image.substring(0, 100) + '...' // Base64文字列を短く切る
              : userProfile.image; // URLの場合はそのまま
          }
        }
      }
      return session;
    },
  },
  // カスタムページの設定
  pages: {
    signIn: '/login',
    error: '/login',
  },
  // JWTの署名に使用するシークレット
  secret: process.env.NEXTAUTH_SECRET,
  // Cookieの設定
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30日間
      },
    },
  },
};
