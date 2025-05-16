/**
 * 認証関連の型定義
 */

// ユーザー情報の型定義
export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: 'USER' | 'ADMIN';
}

// 認証状態の型定義
export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

// 登録フォームの型定義
export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
}

// ログインフォームの型定義
export interface LoginFormData {
  email: string;
  password: string;
}

// 認証エラーの型定義
export interface AuthError {
  message: string;
  status?: number;
}

// 認証サービスの戻り値の型定義
export interface AuthResponse {
  success: boolean;
  user?: UserProfile | null;
  error?: AuthError;
}
