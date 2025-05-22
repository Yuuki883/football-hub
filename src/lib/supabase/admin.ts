/**
 * Supabaseクライアント設定（サーバー専用）
 *
 * このファイルはサーバーサイドでのみ使用し、絶対にクライアントからインポートしないでください
 */
import { createClient } from '@supabase/supabase-js';

// 環境変数から接続情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 環境変数が設定されていない場合はエラーを表示
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase環境変数が設定されていません（サーバー用）');
}

// サーバー用Supabaseクライアントを作成（管理者権限）
export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceRoleKey || '');

// セキュリティ警告
if (typeof window !== 'undefined') {
  console.error(
    '警告: supabase/admin.tsがクライアントサイドでインポートされました。セキュリティリスクです。'
  );
}
