/**
 * アプリケーションの権限管理を行うヘルパー関数
 * 特定のロールや認証状態を要求する関数を提供
 */

import { getCurrentUser } from './auth-server';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';

/**
 * 管理者権限を要求する関数
 * 管理者でない場合はログインページにリダイレクト
 * @returns 管理者の場合はユーザー情報
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login');
  }

  return user;
}

/**
 * ログイン済みユーザーを要求する関数
 * 未ログインの場合はログインページにリダイレクト
 * @returns ログイン済みの場合はユーザー情報
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

/**
 * 特定のロールを要求する関数
 * 指定されたロールを持たない場合はログインページにリダイレクト
 * @param role 要求するロール
 * @returns 指定されたロールを持つ場合はユーザー情報
 */
export async function requireRole(role: Role) {
  const user = await getCurrentUser();

  if (!user || user.role !== role) {
    redirect('/login');
  }

  return user;
}
