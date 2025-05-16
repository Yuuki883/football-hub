/**
 * 認証プロバイダーコンポーネント
 *
 * アプリケーション全体に認証状態を提供
 */
'use client';

import { ReactNode } from 'react';
import { Providers } from '@/lib/providers';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * NextAuth.jsを使用した認証プロバイダー
 * アプリケーション全体に認証状態を提供
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  return <Providers>{children}</Providers>;
}
