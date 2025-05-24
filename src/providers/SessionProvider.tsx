/**
 * セッションプロバイダーコンポーネント
 * NextAuth.jsのセッション管理を提供
 */
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

/**
 * セッションプロバイダーコンポーネントのプロパティ
 */
interface SessionProviderWrapperProps {
  children: ReactNode;
}

/**
 * NextAuth.jsのSessionProviderで子コンポーネントをラップ
 * アプリケーション全体にセッション状態を提供
 */
export default function SessionProviderWrapper({ children }: SessionProviderWrapperProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
