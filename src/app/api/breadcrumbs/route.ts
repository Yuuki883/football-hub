/**
 * パンくずリスト専用API
 * エンティティIDから名前のみを効率的に取得
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTeamById } from '@/features/teams/api/team-info';
import { getPlayerDetails } from '@/features/players/api/player-details';
import { DEFAULT_SEASON } from '@/config/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'team' | 'player'
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'type と id パラメータが必要です' }, { status: 400 });
    }

    let name: string | null = null;

    switch (type) {
      case 'team':
        try {
          const teamData = await getTeamById(id);
          name = teamData?.team.name || null;
        } catch (error) {
          console.error(`チーム名取得エラー (ID: ${id}):`, error);
        }
        break;

      case 'player':
        try {
          const playerData = await getPlayerDetails(id, DEFAULT_SEASON);
          name = playerData?.name || null;
        } catch (error) {
          console.error(`選手名取得エラー (ID: ${id}):`, error);
        }
        break;

      default:
        return NextResponse.json({ error: `サポートされていないtype: ${type}` }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: `${type} が見つかりません (ID: ${id})` }, { status: 404 });
    }

    return NextResponse.json(
      { name },
      {
        headers: {
          // 24時間キャッシュ
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
        },
      }
    );
  } catch (error) {
    console.error('パンくずリストAPI エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
