/**
 * APIルート用の共通ミドルウェア関数
 * 認証チェックやエラー処理などの共通ロジックを提供
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import type { NextRequest } from 'next/server';

type AuthSuccess = {
  success: true;
  session: any;
  userEmail: string;
};

type AuthFailure = {
  success: false;
  response: NextResponse;
};

type AuthResult = AuthSuccess | AuthFailure;

/**
 * 認証済みユーザーのセッションを取得する
 * 未認証の場合はエラーレスポンスを返す
 *
 * @returns 認証済みのセッションまたはエラーレスポンス
 */
export async function getAuthSession(): Promise<AuthResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      success: false,
      response: NextResponse.json({ message: '認証が必要です' }, { status: 401 }),
    };
  }

  return {
    success: true,
    session,
    userEmail: session.user.email,
  };
}

/**
 * 認証済みユーザーIDを必要とするAPIハンドラーをラップする高階関数
 *
 * @param handler 認証済みユーザーのメールアドレスを受け取るハンドラー関数
 * @returns ラップされたAPIハンドラー
 */
export function withAuth<T>(handler: (req: NextRequest, userEmail: string) => Promise<T>) {
  return async (req: NextRequest) => {
    const authResult = await getAuthSession();

    if (!authResult.success) {
      return authResult.response;
    }

    return handler(req, authResult.userEmail);
  };
}
