/**
 * 認証関連機能のエントリーポイント
 * 認証関連の全ての機能をまとめてエクスポートする
 */

// 設定をエクスポート
export { authOptions } from './config';

// クライアント側認証機能
export { useAuth } from './client';

// サーバー側認証機能
export { getSession, getCurrentUser, hasRole, isAdmin } from './server';

// 権限管理
export { requireAdmin, requireAuth, requireRole } from './permissions';

// ミドルウェア
export { withAuth, getAuthSession } from './middleware/api';
