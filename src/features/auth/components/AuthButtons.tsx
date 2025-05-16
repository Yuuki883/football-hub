/**
 * 認証ボタンコンポーネント
 *
 * 認証状態に応じてログイン/ログアウトボタンを表示
 */
'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { LogIn, LogOut, User } from 'lucide-react';

export default function AuthButtons() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();

  // ロード中は何も表示しない
  if (isLoading) {
    return null;
  }

  // 認証済みの場合はプロフィールとログアウトボタンを表示
  if (isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/profile"
          className="flex items-center text-blue-100 hover:text-white transition-colors"
        >
          <User size={18} className="mr-1" />
          <span className="text-sm">{user?.name || 'プロフィール'}</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center text-blue-100 hover:text-white transition-colors"
          aria-label="ログアウト"
        >
          <LogOut size={18} className="mr-1" />
          <span className="text-sm">ログアウト</span>
        </button>
      </div>
    );
  }

  // 未認証の場合はログインと登録ボタンを表示
  return (
    <div className="flex items-center space-x-4">
      <Link
        href="/login"
        className="flex items-center text-blue-100 hover:text-white transition-colors"
      >
        <LogIn size={18} className="mr-1" />
        <span className="text-sm">ログイン</span>
      </Link>
      <Link
        href="/register"
        className="flex items-center px-3 py-1.5 rounded-md text-white bg-blue-600 hover:bg-blue-500 transition-colors text-sm"
      >
        登録
      </Link>
    </div>
  );
}
