/**
 * Supabaseクライアント設定（クライアント用）
 *
 * Supabaseへの接続を管理するクライアントインスタンスを提供
 * クライアントはブラウザで実行される可能性があるため、ANON_KEYのみを使用
 */
import { createClient } from '@supabase/supabase-js';

// 環境変数から接続情報を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が設定されていない場合はエラーを表示
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が設定されていません');
}

// クライアント用Supabaseクライアントを作成（制限付き権限）
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
