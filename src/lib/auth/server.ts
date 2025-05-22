/**
 * サーバーコンポーネントで使用する認証ヘルパー関数
 * セッション情報の取得や認証チェックを行う
 */

import { getServerSession } from 'next-auth/next';
import { authOptions } from './config';
import { Role } from '@prisma/client';

/**
 * サーバーサイドでセッション情報を取得
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * 現在のログインユーザー情報を取得
 * @returns ログインしている場合はユーザー情報、していない場合はnull
 */
export async function getCurrentUser() {
  const session = await getSession();

  if (!session?.user?.email) {
    return null;
  }

  return session.user;
}

/**
 * 特定のロールを持つユーザーかどうかを確認
 * @param role 確認するロール
 * @returns ロールを持つ場合はtrue、それ以外はfalse
 */
export async function hasRole(role: Role) {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * 管理者ユーザーかどうかを確認
 * @returns 管理者の場合はtrue、それ以外はfalse
 */
export async function isAdmin() {
  return hasRole('ADMIN');
}
