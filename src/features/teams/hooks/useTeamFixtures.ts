import { useState, useEffect } from 'react';
import { Match } from '@/lib/types/football';
import { getTeamFixtures } from '../services/team-fixtures-service';

interface UseTeamFixturesOptions {
  teamId: number | string;
  season?: number | string;
  past?: boolean;
  future?: boolean;
  limit?: number;
}

interface UseTeamFixturesResult {
  fixtures: Match[];
  pastFixtures: Match[];
  futureFixtures: Match[];
  isLoading: boolean;
  error: Error | null;
}

export function useTeamFixtures({
  teamId,
  season = 2024,
  past = true,
  future = true,
  limit = 5,
}: UseTeamFixturesOptions): UseTeamFixturesResult {
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [pastFixtures, setPastFixtures] = useState<Match[]>([]);
  const [futureFixtures, setFutureFixtures] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchFixtures = async () => {
      if (!teamId) return;

      setIsLoading(true);
      setError(null);

      try {
        // すべての試合を取得
        const allFixtures = await getTeamFixtures(teamId, {
          season,
          past,
          future,
          limit,
        });

        // 現在の日付
        const today = new Date();

        // 過去と将来の試合に分ける
        const pastGames: Match[] = [];
        const futureGames: Match[] = [];

        allFixtures.forEach((match) => {
          const matchDate = new Date(match.fixture.date);
          if (matchDate < today) {
            pastGames.push(match);
          } else {
            futureGames.push(match);
          }
        });

        setFixtures(allFixtures);
        setPastFixtures(pastGames);
        setFutureFixtures(futureGames);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error('Error fetching team fixtures:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFixtures();
  }, [teamId, season, past, future, limit]);

  return {
    fixtures,
    pastFixtures,
    futureFixtures,
    isLoading,
    error,
  };
}
