import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma/client';

export async function GET(request: NextRequest) {
  ('GET /api/favorites/check が呼ばれました');
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const teamIdParam = searchParams.get('teamId');
  const leagueIdParam = searchParams.get('leagueId');

  try {
    let result = {};

    if (teamIdParam) {
      // 数値型のteamIdをapiIdとして使用し、対応するTeamレコードを検索
      const numericTeamId = Number(teamIdParam);

      const team = await prisma.team.findUnique({
        where: {
          apiId: numericTeamId,
        },
      });

      if (team) {
        // DB上のTeam.idを使用してお気に入り状態をチェック
        const favorite = await prisma.favoriteTeam.findUnique({
          where: {
            userId_teamId: {
              userId: session.user.id,
              teamId: team.id,
            },
          },
        });

        result = { ...result, team: !!favorite };
      } else {
        `チームが見つかりません: apiId=${numericTeamId}`;
        result = { ...result, team: false };
      }
    }

    if (leagueIdParam) {
      // 数値型のleagueIdをapiIdとして使用し、対応するLeagueレコードを検索
      const numericLeagueId = Number(leagueIdParam);

      const league = await prisma.league.findUnique({
        where: {
          apiId: numericLeagueId,
        },
      });

      if (league) {
        // DB上のLeague.idを使用してお気に入り状態をチェック
        const favorite = await prisma.favoriteLeague.findUnique({
          where: {
            userId_leagueId: {
              userId: session.user.id,
              leagueId: league.id,
            },
          },
        });

        result = { ...result, league: !!favorite };
      } else {
        `リーグが見つかりません: apiId=${numericLeagueId}`;
        result = { ...result, league: false };
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('お気に入りチェックエラー:', error);
    return NextResponse.json(
      {
        error: 'お気に入り状態の取得に失敗しました',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
