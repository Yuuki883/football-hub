'use client';

import { FormattedStandingGroup } from '@/lib/api-football/types/standing';
import StandingsTable from '@/features/leagues/components/tables/StandingsTable';

interface TeamStandingsProps {
  standings: FormattedStandingGroup[] | null;
  teamId: string;
  season: number;
  leagueName?: string;
}

export default function TeamStandings({
  standings,
  teamId,
  season,
  leagueName = '',
}: TeamStandingsProps) {
  if (!standings) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">順位表データが見つかりません</div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-blue50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-blue-800">{leagueName}</h3>
      </div>

      <div className="p-4">
        <StandingsTable
          standings={standings}
          season={season}
          isOverview={true}
          highlightTeamId={teamId}
        />
      </div>
    </div>
  );
}
