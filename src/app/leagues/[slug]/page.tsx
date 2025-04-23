import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  getMatchesByLeague,
  getLeagueStandings,
} from '@/lib/services/match-data-service';
import { formatMatchDate, formatMatchTime } from '@/lib/utils/date-formatter';

// リーグ情報
const LEAGUES_INFO = {
  'premier-league': { code: 'PL', name: 'プレミアリーグ' },
  'la-liga': { code: 'PD', name: 'ラ・リーガ' },
  bundesliga: { code: 'BL1', name: 'ブンデスリーガ' },
  'serie-a': { code: 'SA', name: 'セリエA' },
  'ligue-1': { code: 'FL1', name: 'リーグ・アン' },
  'champions-league': { code: 'CL', name: 'チャンピオンズリーグ' },
  'europa-league': { code: 'EL', name: 'ヨーロッパリーグ' },
  'conference-league': { code: 'ECL', name: 'カンファレンスリーグ' },
};

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const leagueInfo = LEAGUES_INFO[slug as keyof typeof LEAGUES_INFO];

  return {
    title: `${leagueInfo?.name || 'リーグ'} | FootballHub`,
    description: `${
      leagueInfo?.name || 'リーグ'
    }の最新順位表、試合結果、今後の試合日程`,
  };
}

export default async function LeagueDetailPage({ params }: Props) {
  const { slug } = params;
  const leagueInfo = LEAGUES_INFO[slug as keyof typeof LEAGUES_INFO];

  if (!leagueInfo) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-6">リーグが見つかりません</h1>
        <p className="mb-8">指定されたリーグ情報が見つかりませんでした。</p>
        <Link href="/" className="text-blue-600 hover:underline">
          ホームに戻る
        </Link>
      </div>
    );
  }

  // リーグコードから試合データと順位表を取得
  const [matches, standings] = await Promise.all([
    getMatchesByLeague(leagueInfo.code),
    getLeagueStandings(leagueInfo.code),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">{leagueInfo.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 順位表 */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                順位表
              </h2>
            </div>

            {standings.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                順位表データがありません
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-300 uppercase">
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-left">チーム</th>
                      <th className="px-4 py-2 text-center">試合</th>
                      <th className="px-4 py-2 text-center">勝</th>
                      <th className="px-4 py-2 text-center">分</th>
                      <th className="px-4 py-2 text-center">敗</th>
                      <th className="px-4 py-2 text-center">得点</th>
                      <th className="px-4 py-2 text-center">失点</th>
                      <th className="px-4 py-2 text-center">差</th>
                      <th className="px-4 py-2 text-center">勝点</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team: any) => (
                      <tr
                        key={team.team.id}
                        className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                      >
                        <td className="px-4 py-3 text-sm font-medium">
                          {team.position}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-6 h-6 relative mr-2">
                              <Image
                                src={team.team.crest || '/team-placeholder.png'}
                                alt={team.team.name}
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            </div>
                            <Link
                              href={`/teams/${team.team.id}`}
                              className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              {team.team.shortName || team.team.name}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {team.playedGames}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {team.won}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {team.draw}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {team.lost}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {team.goalsFor}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {team.goalsAgainst}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {team.goalDifference}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-center">
                          {team.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* 最近の試合と今後の試合 - 現在コメントアウト中（改修予定） */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                試合日程
              </h2>
            </div>
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              試合日程の表示は現在改修中です。しばらくお待ちください。
            </div>

            {/* 試合日程表示部分（改修予定のためコメントアウト）
            {matches.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                予定されている試合はありません
              </div>
            ) : (
              <div>
                {matches.map((match: any) => (
                  <Link
                    key={match.id}
                    href={`/matches/${match.id}`}
                    className="block border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <div className="p-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {formatMatchDate(match.utcDate)}{' '}
                        {formatMatchTime(match.utcDate)}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center w-5/12">
                          <div className="w-8 h-8 relative mr-2">
                            <Image
                              src={
                                match.homeTeam.crest || '/team-placeholder.png'
                              }
                              alt={match.homeTeam.name}
                              width={32}
                              height={32}
                              className="object-contain"
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {match.homeTeam.name}
                          </span>
                        </div>

                        <div className="text-center w-2/12">
                          {match.status === 'FINISHED' ? (
                            <div className="text-base font-bold">
                              {match.score.home}-{match.score.away}
                            </div>
                          ) : (
                            <div className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                              VS
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end w-5/12">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate text-right">
                            {match.awayTeam.name}
                          </span>
                          <div className="w-8 h-8 relative ml-2">
                            <Image
                              src={
                                match.awayTeam.crest || '/team-placeholder.png'
                              }
                              alt={match.awayTeam.name}
                              width={32}
                              height={32}
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </div>

                      {match.venue && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                          {match.venue}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
            */}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-blue-600 hover:underline">
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
