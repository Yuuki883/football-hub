/**
 * 画像処理に関するユーティリティ関数
 *
 * Supabaseストレージを使用して画像の保存・削除を行う
 * このモジュールはサーバーサイドでのみ使用してください
 */
import { supabaseAdmin } from '@/lib/supabase/admin';

// バケット名
const BUCKET_NAME = 'user-avatars';
const AVATAR_FOLDER = 'private';

// クライアントサイドでのインポートを防止
if (typeof window !== 'undefined') {
  console.error(
    '警告: media/image-utils.tsがクライアントサイドでインポートされました。このモジュールはサーバーサイド専用です。'
  );
}

/**
 * Base64エンコードされた画像データをSupabaseストレージに保存する
 *
 * @param imageData Base64エンコードされた画像データ
 * @param userId ユーザーID（ファイル名に使用）
 * @returns 保存された画像のURL、または失敗時はnull
 */
export async function saveImageToFile(imageData: string, userId: string): Promise<string | null> {
  try {
    // データが空の場合はnullを返す
    if (!imageData) return null;

    // データがBase64形式でない場合はそのまま返す（既にURLの場合など）
    if (!imageData.startsWith('data:')) return imageData;

    // Base64データからフォーマットとバイナリデータを抽出
    const matches = imageData.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) return null;

    const [, format, base64Data] = matches;
    const buffer = Buffer.from(base64Data, 'base64');

    // ファイル名を生成
    const fileName = `${userId}_${Date.now()}.${format}`;
    const filePath = `${AVATAR_FOLDER}/${fileName}`;

    // Supabaseストレージにアップロード（管理者権限）
    const { data, error } = await supabaseAdmin.storage.from(BUCKET_NAME).upload(filePath, buffer, {
      contentType: `image/${format}`,
      upsert: false,
    });

    if (error) {
      console.error('画像アップロードエラー:', error);
      return null;
    }

    // 公開URLを取得
    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('画像保存エラー:', error);
    return null;
  }
}

/**
 * Supabaseストレージから古い画像を削除する
 *
 * @param oldImageUrl 古い画像のURL
 */
export async function deleteOldImage(oldImageUrl: string | null): Promise<void> {
  try {
    // URLが空またはBase64データの場合は何もしない
    if (!oldImageUrl || oldImageUrl.startsWith('data:')) return;

    // URLからSupabaseのパスを抽出
    const url = new URL(oldImageUrl);
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/user-avatars\/(.+)$/);
    if (!pathMatch) return;

    const filePath = pathMatch[1];

    // Supabaseストレージからファイルを削除（管理者権限）
    const { error } = await supabaseAdmin.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) {
      console.error('画像削除エラー:', error);
    }
  } catch (error) {
    console.error('画像削除処理エラー:', error);
  }
}
