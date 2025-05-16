/**
 * NextAuth.js用の型定義拡張
 * セッションやユーザーの型に独自のプロパティを追加するための定義
 */

import 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  /**
   * セッションオブジェクトの型を拡張して、独自のユーザープロパティを追加
   */
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }

  /**
   * ユーザーオブジェクトの型を拡張
   */
  interface User {
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  /**
   * JWTトークンの型を拡張
   */
  interface JWT {
    id: string;
    role: Role;
  }
}
