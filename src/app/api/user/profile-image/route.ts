/**
 * ユーザープロフィール画像取得API
 * ログインユーザーのプロフィール画像を取得する
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { withAuth } from '@/lib/auth/middleware/api';
import type { NextRequest } from 'next/server';

/**
 * GET /api/user/profile-image
 * ログインユーザーのプロフィール画像を取得する
 */
export const GET = withAuth(async (req: NextRequest, userEmail: string) => {
  try {
    // データベースからユーザーの画像データを取得
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { image: true },
    });

    // ユーザーが見つからない場合は404エラー
    if (!user) {
      return NextResponse.json({ message: 'ユーザーが見つかりません' }, { status: 404 });
    }

    return NextResponse.json({ image: user.image }, { status: 200 });
  } catch (error) {
    console.error('プロフィール画像取得エラー:', error);
    return NextResponse.json(
      { message: 'プロフィール画像の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
});
