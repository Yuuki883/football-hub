/**
 * クライアントコンポーネントで使用する認証ヘルパー関数
 * セッション情報の取得や認証状態の管理を行う
 */
'use client';

import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';

/**
 * 認証情報にアクセスするためのカスタムフック
 * セッション情報、認証状態、ユーザー情報を提供
 */
export const useAuth = () => {
  const { data: session, status, update } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  /**
   * ユーザーが管理者かどうかを確認
   */
  const isAdmin = session?.user?.role === 'ADMIN';

  return {
    session,
    isAuthenticated,
    isLoading,
    isAdmin,
    user: session?.user,
    updateSession: update,
  };
};
