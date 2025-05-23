/**
 * 試合詳細機能のAPIラッパー
 * API-FOOTBALL v3からデータを取得し、キャッシュする
 */

import {
  ApiResponse,
  Event,
  Fixture,
  Lineup,
  MatchPlayerEntry,
  Statistics,
  TeamPlayers,
} from '../types/match.types';
import { CACHE_TTL } from '@/config/api';
import { withCache, createCacheKey } from '@/lib/api-football/cache';
import { fetchFromAPI, createUrl } from '@/lib/api-football/index';

/**
 * 試合基本情報を取得する
 * @param id - 試合ID
 * @returns 試合基本情報
 */
export async function getFixture(id: string): Promise<Fixture> {
  // キャッシュキーを作成
  const cacheKey = createCacheKey('fixture', { id });
  const cacheTTL = CACHE_TTL.MEDIUM; // 中程度の期間キャッシュ

  return withCache(
    cacheKey,
    async () => {
      try {
        const url = createUrl('/fixtures', { id });
        const response = await fetchFromAPI(url);

        // デバッグ：APIレスポンスの構造を確認
        if (process.env.NODE_ENV === 'development') {
          console.log(
            'API Response Structure:',
            JSON.stringify(
              {
                results: response.results,
                hasResponse: !!response.response,
                responseLength: response.response?.length,
              },
              null,
              2
            )
          );
        }

        if (!response.response?.[0]) {
          throw new Error(`Fixture not found for ID: ${id}`);
        }

        const fixtureData = response.response[0];

        // レスポンスデータを型定義に合わせて正しくマッピング
        const fixture: Fixture = {
          id: fixtureData.fixture.id,
          date: fixtureData.fixture.date,
          status: {
            long: fixtureData.fixture.status.long,
            short: fixtureData.fixture.status.short,
            elapsed: fixtureData.fixture.status.elapsed,
          },
          league: {
            name: fixtureData.league.name || '',
            round: fixtureData.league.round || '',
            logo: fixtureData.league.logo || '',
          },
          teams: {
            home: {
              id: fixtureData.teams.home.id,
              name: fixtureData.teams.home.name,
              logo: fixtureData.teams.home.logo,
            },
            away: {
              id: fixtureData.teams.away.id,
              name: fixtureData.teams.away.name,
              logo: fixtureData.teams.away.logo,
            },
          },
          goals: {
            home: fixtureData.goals.home,
            away: fixtureData.goals.away,
          },
          venue: {
            name: fixtureData.fixture.venue?.name || '',
            city: fixtureData.fixture.venue?.city || '',
          },
        };

        // デバッグ：マッピング後のデータ構造を確認
        if (process.env.NODE_ENV === 'development') {
          console.log(
            'Mapped Fixture Object:',
            JSON.stringify(
              {
                id: fixture.id,
                league: fixture.league,
                teams: {
                  home: fixture.teams.home.id,
                  away: fixture.teams.away.id,
                },
              },
              null,
              2
            )
          );
        }

        return fixture;
      } catch (error) {
        console.error(`試合情報取得エラー (ID: ${id}):`, error);
        throw error;
      }
    },
    cacheTTL
  );
}

/**
 * 試合統計情報を取得する
 * @param id - 試合ID
 * @returns 試合統計情報
 */
export async function getStatistics(id: string): Promise<Statistics[]> {
  // キャッシュキーを作成
  const cacheKey = createCacheKey('fixture-stats', { id });
  const cacheTTL = CACHE_TTL.MEDIUM;

  return withCache(
    cacheKey,
    async () => {
      try {
        const url = createUrl('/fixtures/statistics', { fixture: id });
        const response = await fetchFromAPI(url);
        return response.response || [];
      } catch (error) {
        console.error(`統計データ取得エラー (ID: ${id}):`, error);
        return []; // エラー時は空配列を返す
      }
    },
    cacheTTL
  );
}

/**
 * チーム編成情報を取得する
 * @param id - 試合ID
 * @returns チーム編成情報
 */
export async function getLineups(id: string): Promise<Lineup[]> {
  // キャッシュキーを作成
  const cacheKey = createCacheKey('fixture-lineups', { id });
  const cacheTTL = CACHE_TTL.MEDIUM;

  return withCache(
    cacheKey,
    async () => {
      try {
        const url = createUrl('/fixtures/lineups', { fixture: id });
        const response = await fetchFromAPI(url);

        // レスポンスが配列であることを確認
        if (!Array.isArray(response.response)) {
          console.warn(`ラインナップデータが配列でありません (ID: ${id})`, response);
          return [];
        }

        // gridプロパティの検証
        const validatedLineups = response.response.map((lineup: any) => {
          // startXIの各プレイヤーエントリーを検証
          if (lineup.startXI && Array.isArray(lineup.startXI)) {
            lineup.startXI.forEach((entry: MatchPlayerEntry) => {
              if (!entry.player || !entry.player.grid || entry.player.grid === 'null') {
                console.warn(`先発選手のgridプロパティが無効: ${entry.player?.name || '不明'}`);
              }
            });
          }
          return lineup;
        });

        return validatedLineups;
      } catch (error) {
        console.error(`ラインナップ取得エラー (ID: ${id}):`, error);
        return []; // エラー時は空配列を返す
      }
    },
    cacheTTL
  );
}

/**
 * 試合イベント情報を取得する
 * @param id - 試合ID
 * @returns 試合イベント情報
 */
export async function getEvents(id: string): Promise<Event[]> {
  // キャッシュキーを作成
  const cacheKey = createCacheKey('fixture-events', { id });
  const cacheTTL = CACHE_TTL.MEDIUM;

  return withCache(
    cacheKey,
    async () => {
      try {
        const url = createUrl('/fixtures/events', { fixture: id });
        const response = await fetchFromAPI(url);
        return response.response || [];
      } catch (error) {
        console.error(`イベントデータ取得エラー (ID: ${id}):`, error);
        return []; // エラー時は空配列を返す
      }
    },
    cacheTTL
  );
}

/**
 * 試合プレイヤーデータを取得する
 * @param id - 試合ID
 * @returns チームごとの選手パフォーマンスデータ
 */
export async function getFixturesPlayers(id: string): Promise<TeamPlayers[]> {
  // キャッシュキーを作成
  const cacheKey = createCacheKey('fixture-players', { id });
  const cacheTTL = CACHE_TTL.MEDIUM;

  return withCache(
    cacheKey,
    async () => {
      try {
        const url = createUrl('/fixtures/players', { fixture: id });
        const response = await fetchFromAPI(url);

        // デバッグログ（開発時のみ）
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `選手データレスポンス: チーム数=${response.response?.length}、データ構造=`,
            JSON.stringify({
              hasTeams: !!response.response,
              firstTeamId: response.response?.[0]?.team?.id,
              playerCount: response.response?.[0]?.players?.length,
            })
          );
        }

        return response.response || [];
      } catch (error) {
        console.error(`プレイヤーデータ取得エラー (ID: ${id}):`, error);
        return []; // エラー時は空配列を返す
      }
    },
    cacheTTL
  );
}
