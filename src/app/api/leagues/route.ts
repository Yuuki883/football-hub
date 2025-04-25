import { NextResponse } from 'next/server';
import { getAllLeagues } from '@/lib/services/league-service';

// リーグ情報を取得するAPIエンドポイント
export async function GET() {
  try {
    const leagues = await getAllLeagues();

    // レスポンスを返す
    return NextResponse.json({
      success: true,
      leagues: leagues.map((data) => data.league),
    });
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leagues' },
      { status: 500 }
    );
  }
}

// キャッシュ設定（12時間）
export const revalidate = 43200;
