// src/lib/services/team-media-service.ts
import { getRedisClient } from '@/lib/redis';

// APIキーを環境変数から取得
const SPORTSDB_API_KEY = process.env.SPORTSDB_API_KEY || '3'; // デフォルトは無料APIの'3'

export async function getTeamMedia(teamName: string) {
  const redis = await getRedisClient();

  // キャッシュチェック
  const cacheKey = `team-media:${teamName}`;
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached as string);
  }

  try {
    //The Sports DB APIを使用
    const apiUrl = `https://www.thesportsdb.com/api/v1/json/${SPORTSDB_API_KEY}/searchteams.php?t=${encodeURIComponent(
      teamName
    )}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.teams || data.teams.length === 0) {
      throw new Error('Team not found');
    }

    const teamData = {
      badge: data.teams[0].strTeamBadge,
      logo: data.teams[0].strTeamLogo,
      banner: data.teams[0].strTeamBanner,
      jersey: data.teams[0].strTeamJersey,
    };

    // 7日間キャッシュ（ロゴや画像は頻繁に変更されないため）
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(teamData), {
        EX: 7 * 24 * 60 * 60, // 7日間の有効期限
      });
    }

    return teamData;
  } catch (error) {
    console.error(`Failed to fetch team media for ${teamName}:`, error);
    return null;
  }
}
