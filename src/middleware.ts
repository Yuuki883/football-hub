/**
 * Next.jsミドルウェア
 * 認証状態に基づいて、ルートへのアクセス制御を行う
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * ミドルウェア関数
 * リクエストごとに実行され、認証状態に基づいてリダイレクトや続行を判断
 *
 * @param request Next.jsのリクエストオブジェクト
 * @returns NextResponseオブジェクト
 */
export async function middleware(request: NextRequest) {
  // JWTトークンを取得
  const token = await getToken({ req: request });

  // 現在のパスを取得
  const path = request.nextUrl.pathname;

  // 認証関連ルートかどうかを判定
  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register');

  // 認証APIルートはミドルウェアから除外
  if (path.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // パブリックルートの配列（認証なしでアクセス可能）
  const publicRoutes = ['/', '/leagues', '/teams', '/players', '/news'];
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // 未認証でパブリックでないルートへのアクセスをリダイレクト
  if (!token && !isAuthRoute && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 認証済みユーザーがログイン・登録ページにアクセスした場合はダッシュボードへリダイレクト
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

/**
 * ミドルウェアが適用されるパスを指定
 */
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/admin/:path*', '/login', '/register'],
};
