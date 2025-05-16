/**
 * アプリケーション全体で使用するプロバイダーコンポーネント
 * セッション管理や状態共有のためのコンテキストプロバイダーを提供
 */
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

/**
 * プロバイダーコンポーネントのプロパティ
 */
interface ProvidersProps {
  children: ReactNode;
}

/**
 * アプリケーション全体にプロバイダーを提供するコンポーネント
 * NextAuth.jsのSessionProviderで子コンポーネントをラップ
 */
export function Providers({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
