import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma/client';
import { syncLeagueData } from '@/lib/sync/team-league-sync';

// お気に入りリーグ追加
export async function POST(request: NextRequest) {
  ('POST /api/favorites/league が呼ばれました');

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { leagueId } = body;

    if (!leagueId) {
      return NextResponse.json({ error: 'リーグIDが必要です' }, { status: 400 });
    }

    // 数値型のleagueIdをapiIdとして使用し、対応するLeagueレコードを検索
    const numericLeagueId = Number(leagueId);

    // DBからリーグを検索
    let league = await prisma.league.findUnique({
      where: {
        apiId: numericLeagueId,
      },
    });

    // リーグが存在しない場合、APIから取得して保存
    if (!league) {
      `apiId=${numericLeagueId}のリーグが見つかりません。APIから取得します。`;
      league = await syncLeagueData(numericLeagueId);

      if (!league) {
        console.error(`apiId=${numericLeagueId}に対応するリーグの同期に失敗しました`);
        return NextResponse.json(
          {
            error: '指定されたリーグのデータ取得に失敗しました',
            details: `apiId=${numericLeagueId}`,
          },
          { status: 404 }
        );
      }
    }

    // 既にお気に入り登録されていないか確認
    const existingFavorite = await prisma.favoriteLeague.findUnique({
      where: {
        userId_leagueId: {
          userId: session.user.id,
          leagueId: league.id,
        },
      },
    });

    if (existingFavorite) {
      ('既にお気に入り登録済みです');
      return NextResponse.json({ exists: true });
    }

    // DB上のLeague.idを使用してお気に入り登録

    const favorite = await prisma.favoriteLeague.create({
      data: {
        userId: session.user.id,
        leagueId: league.id,
      },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error('お気に入り登録エラー詳細:', error);
    return NextResponse.json(
      {
        error: 'お気に入り登録に失敗しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// お気に入りリーグ削除
export async function DELETE(request: NextRequest) {
  ('DELETE /api/favorites/league が呼ばれました');

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { leagueId } = body;

    if (!leagueId) {
      return NextResponse.json({ error: 'リーグIDが必要です' }, { status: 400 });
    }

    // 数値型のleagueIdをapiIdとして使用し、対応するLeagueレコードを検索
    const numericLeagueId = Number(leagueId);

    const league = await prisma.league.findUnique({
      where: {
        apiId: numericLeagueId,
      },
    });

    if (!league) {
      return NextResponse.json(
        { error: '指定されたリーグが見つかりません', details: `apiId=${numericLeagueId}` },
        { status: 404 }
      );
    }

    await prisma.favoriteLeague.deleteMany({
      where: {
        userId: session.user.id,
        leagueId: league.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('お気に入り解除エラー詳細:', error);
    return NextResponse.json(
      {
        error: 'お気に入り解除に失敗しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// ユーザーのお気に入りリーグ一覧取得
export async function GET() {
  ('GET /api/favorites/league が呼ばれました');

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const favorites = await prisma.favoriteLeague.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        league: true,
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error('お気に入り取得エラー詳細:', error);
    return NextResponse.json(
      {
        error: 'お気に入りの取得に失敗しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
