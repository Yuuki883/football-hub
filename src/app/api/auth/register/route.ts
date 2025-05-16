/**
 * ユーザー登録API
 *
 * 新規ユーザーをデータベースに登録する
 */
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma/client';
import { z } from 'zod';

// リクエストボディの検証スキーマ
const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
  name: z.string().min(1, '名前は必須です'),
});

/**
 * ユーザー登録APIエンドポイント
 * @param request API リクエスト
 * @returns JSON レスポンス
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = await request.json();

    // 検証
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: '入力内容が正しくありません', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'このメールアドレスは既に使用されています' },
        { status: 409 }
      );
    }

    // パスワードのハッシュ化
    const hashedPassword = await hash(password, 12);

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
      },
    });

    // 成功レスポンス（パスワードは含めない）
    return NextResponse.json(
      {
        message: 'ユーザーが正常に登録されました',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    return NextResponse.json({ message: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
