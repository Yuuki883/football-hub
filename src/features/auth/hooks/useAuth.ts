/**
 * 認証カスタムフック
 *
 * NextAuth.jsを使用して認証機能を提供するカスタムフック
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut } from 'next-auth/react';
import { RegisterFormData, LoginFormData } from '../types/auth-types';
import { useAuth as useNextAuthSession } from '@/lib/auth';

/**
 * NextAuth.jsのセッション情報と認証機能を提供するカスタムフック
 */
export function useAuth() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, session } = useNextAuthSession();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * エラーメッセージをクリア
   */
  const clearError = () => setError(null);

  /**
   * メールアドレスとパスワードでログイン
   * @param data ログイン情報
   * @returns ログイン成功時はtrue、失敗時はfalse
   */
  const login = async (data: LoginFormData) => {
    try {
      setIsProcessing(true);
      clearError();

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('メールアドレスまたはパスワードが正しくありません');
        return false;
      }

      router.push('/');
      router.refresh();
      return true;
    } catch (err) {
      setError('ログイン中にエラーが発生しました');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * 新規ユーザー登録
   * @param data 登録情報
   * @returns 登録成功時はtrue、失敗時はfalse
   */
  const register = async (data: RegisterFormData) => {
    try {
      setIsProcessing(true);
      clearError();

      // ユーザー登録APIを呼び出し
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'ユーザー登録に失敗しました');
        return false;
      }

      // 登録成功後、自動ログイン
      const loginResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (loginResult?.error) {
        setError('アカウントは作成されましたが、自動ログインに失敗しました');
        return false;
      }

      router.push('/');
      router.refresh();
      return true;
    } catch (err) {
      setError('ユーザー登録中にエラーが発生しました');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * ログアウト処理
   */
  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('ログアウト中にエラーが発生しました');
    }
  };

  return {
    user,
    isLoading: isLoading || isProcessing,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError,
    session,
  };
}
