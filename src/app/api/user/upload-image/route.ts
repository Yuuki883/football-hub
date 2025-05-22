/**
 * ユーザープロフィール画像アップロードAPI
 * 画像データを受け取り、Supabaseストレージに保存し、画像URLをユーザーに紐づける
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { withAuth } from '@/lib/auth/middleware/api';
import { saveImageToFile, deleteOldImage } from '@/lib/media';
import type { NextRequest } from 'next/server';

/**
 * POST /api/user/upload-image
 * プロフィール画像をアップロードしてSupabaseストレージに保存する
 */
export const POST = withAuth(async (req: NextRequest, userEmail: string) => {
  try {
    // リクエストから画像データを取得
    const { imageData } = await req.json();

    // 画像データが不正な場合は400エラー
    if (!imageData || typeof imageData !== 'string') {
      return NextResponse.json({ message: '画像データが必要です' }, { status: 400 });
    }

    // ユーザー情報を取得して古い画像URLを保存
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true, image: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'ユーザーが見つかりません' }, { status: 404 });
    }

    // 古い画像URLを保存
    const oldImageUrl = user.image;

    // 画像をSupabaseストレージに保存し、URLを取得
    const imageUrl = await saveImageToFile(imageData, user.id);

    if (!imageUrl) {
      return NextResponse.json({ message: '画像の保存に失敗しました' }, { status: 500 });
    }

    // ユーザー情報を更新（画像URLを保存）
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { image: imageUrl },
    });

    // 古い画像を削除
    await deleteOldImage(oldImageUrl);

    return NextResponse.json(
      {
        message: 'プロフィール画像を更新しました',
        image: updatedUser.image,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('画像アップロードエラー:', error);
    return NextResponse.json(
      { message: '画像のアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
});
