/**
 * チーム選手情報API
 *
 * チームの選手データを取得する機能を提供
 * lib/api-footballの共通機能を使用。
 */

import { fetchFromAPI, createUrl } from '@/lib/api-football/index';
import { withCache, createCacheKey } from '@/lib/api-football/cache';
import { CACHE_TTL } from '@/config/api';
import { TeamPlayer, TeamPlayerGroup } from '../types/types';

/**
 * チームの選手一覧を取得する
 *
 * @param teamId チームID
 * @param forceRefresh キャッシュを強制更新するかどうか
 * @returns 選手一覧
 */
export async function getTeamPlayers(
  teamId: string | number,
  forceRefresh: boolean = false
): Promise<TeamPlayer[]> {
  if (!teamId) {
    throw new Error('チームIDが指定されていません');
  }

  // キャッシュキーを作成
  const cacheParams = { id: teamId };
  const cacheKey = createCacheKey('team-squad', cacheParams);
  const cacheTTL = CACHE_TTL.LONG; // 24時間

  return withCache(
    cacheKey,
    async () => {
      // 選手スクワッドAPIエンドポイントを使用
      const url = createUrl('/players/squads', { team: teamId });
      const data = await fetchFromAPI(url);

      if (!data.response || data.response.length === 0) {
        return [];
      }

      // APIレスポンスからプレイヤーデータを抽出
      const squadData = data.response[0];

      if (!squadData.players || squadData.players.length === 0) {
        return [];
      }

      // 現在のスクワッドデータをアプリケーションの形式に変換
      return squadData.players.map((player: any) => ({
        id: player.id,
        name: player.name,
        age: player.age || 25,
        number: player.number,
        position: player.position || 'Unknown',
        photo: player.photo,
        nationality: player.nationality,
        height: player.height,
        weight: player.weight,
        injured: false,
        rating: null,
        marketValue: null,
      }));
    },
    cacheTTL,
    forceRefresh
  );
}

/**
 * 選手をポジション別にグループ化する
 *
 * @param players 選手一覧
 * @returns ポジション別にグループ化された選手一覧
 */
export function groupPlayersByPosition(players: TeamPlayer[]): TeamPlayerGroup[] {
  // ポジションの表示順序とその表示名
  const positionOrder: Record<string, { order: number; displayName: string }> = {
    Goalkeeper: { order: 1, displayName: 'ゴールキーパー' },
    Defender: { order: 2, displayName: 'ディフェンダー' },
    Midfielder: { order: 3, displayName: 'ミッドフィールダー' },
    Attacker: { order: 4, displayName: 'アタッカー' },
    Unknown: { order: 999, displayName: 'その他' },
  };

  // ポジション名を標準化する関数
  const normalizePosition = (pos: string): string => {
    if (!pos) return 'Unknown';

    const positionMap: Record<string, string> = {
      G: 'Goalkeeper',
      GK: 'Goalkeeper',
      Goalkeeper: 'Goalkeeper',
      D: 'Defender',
      DF: 'Defender',
      Defender: 'Defender',
      M: 'Midfielder',
      MF: 'Midfielder',
      Midfielder: 'Midfielder',
      F: 'Attacker',
      FW: 'Attacker',
      Attacker: 'Attacker',
    };

    return positionMap[pos] || 'Unknown';
  };

  // 選手をポジション別に分類
  const groupedPlayers: Record<string, TeamPlayer[]> = {};

  players.forEach((player) => {
    const normalizedPosition = normalizePosition(player.position || 'Unknown');

    if (!groupedPlayers[normalizedPosition]) {
      groupedPlayers[normalizedPosition] = [];
    }

    groupedPlayers[normalizedPosition].push(player);
  });

  // グループ化されたデータを配列に変換して表示順にソート
  return Object.entries(groupedPlayers)
    .map(([position, players]) => ({
      position,
      displayName: positionOrder[position]?.displayName || position,
      players: players.sort((a, b) => (a.number || 99) - (b.number || 99)),
    }))
    .sort(
      (a, b) =>
        (positionOrder[a.position]?.order || 999) - (positionOrder[b.position]?.order || 999)
    );
}
