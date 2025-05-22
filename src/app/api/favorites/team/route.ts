import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma/client';
import { syncTeamData } from '@/lib/sync/team-league-sync';

// お気に入りチーム追加
export async function POST(request: NextRequest) {
  ('POST /api/favorites/team が呼ばれました');

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'チームIDが必要です' }, { status: 400 });
    }

    // 数値型のteamIdをapiIdとして使用し、対応するTeamレコードを検索
    const numericTeamId = Number(teamId);

    // DBからチームを検索
    let team = await prisma.team.findUnique({
      where: {
        apiId: numericTeamId,
      },
    });

    // チームが存在しない場合、APIから取得して保存
    if (!team) {
      `apiId=${numericTeamId}のチームが見つかりません。APIから取得します。`;
      team = await syncTeamData(numericTeamId);

      if (!team) {
        console.error(`apiId=${numericTeamId}に対応するチームの同期に失敗しました`);
        return NextResponse.json(
          {
            error: '指定されたチームのデータ取得に失敗しました',
            details: `apiId=${numericTeamId}`,
          },
          { status: 404 }
        );
      }
    }

    // 既にお気に入り登録されていないか確認
    const existingFavorite = await prisma.favoriteTeam.findUnique({
      where: {
        userId_teamId: {
          userId: session.user.id,
          teamId: team.id,
        },
      },
    });

    if (existingFavorite) {
      ('既にお気に入り登録済みです');
      return NextResponse.json({ exists: true });
    }

    // DB上のTeam.idを使用してお気に入り登録
    const favorite = await prisma.favoriteTeam.create({
      data: {
        userId: session.user.id,
        teamId: team.id,
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error('お気に入り登録エラー:', error);
    return NextResponse.json(
      {
        error: 'お気に入り登録に失敗しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// お気に入りチーム削除
export async function DELETE(request: NextRequest) {
  ('DELETE /api/favorites/team が呼ばれました');

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { teamId } = body;

    if (!teamId) {
      return NextResponse.json({ error: 'チームIDが必要です' }, { status: 400 });
    }

    // 数値型のteamIdをapiIdとして使用し、対応するTeamレコードを検索
    const numericTeamId = Number(teamId);

    const team = await prisma.team.findUnique({
      where: {
        apiId: numericTeamId,
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: '指定されたチームが見つかりません', details: `apiId=${numericTeamId}` },
        { status: 404 }
      );
    }

    await prisma.favoriteTeam.deleteMany({
      where: {
        userId: session.user.id,
        teamId: team.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('お気に入り解除エラー:', error);
    return NextResponse.json(
      {
        error: 'お気に入り解除に失敗しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// ユーザーのお気に入りチーム一覧取得
export async function GET() {
  ('GET /api/favorites/team が呼ばれました');

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const favorites = await prisma.favoriteTeam.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        team: true,
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('お気に入り取得エラー:', error);
    return NextResponse.json(
      {
        error: 'お気に入りの取得に失敗しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
