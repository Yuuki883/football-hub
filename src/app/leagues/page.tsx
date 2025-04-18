import { getMatchesByLeague } from '@/lib/services/match-data-service';
import Image from 'next/image';
import { formatDate, formatTime } from '@/lib/utils/date-formatter';
import Link from 'next/link';

interface LeaguePageProps {
  params: {
    code: string;
  };
}

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { code } = params;
  const matches = await getMatchesByLeague(code);

  // リーグコードからリーグ名を取得
  const leagueName = getLeagueName(code);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {leagueName}の試合一覧
      </h1>

      {matches.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">
            予定されている試合はありません
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match: any) => (
            <div
              key={match.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="bg-gray-100 px-4 py-2">
                <p className="text-sm text-gray-600">
                  {formatDate(match.utcDate)} {formatTime(match.utcDate)}
                </p>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 relative mr-2">
                      <Image
                        src={match.homeTeam.crest || '/placeholder-team.png'}
                        alt={match.homeTeam.name}
                        fill
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-team.png';
                        }}
                      />
                    </div>
                    <span className="font-medium">{match.homeTeam.name}</span>
                  </div>
                  <span className="text-lg font-bold mx-2">vs</span>
                  <div className="flex items-center">
                    <span className="font-medium">{match.awayTeam.name}</span>
                    <div className="w-8 h-8 relative ml-2">
                      <Image
                        src={match.awayTeam.crest || '/placeholder-team.png'}
                        alt={match.awayTeam.name}
                        fill
                        className="object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-team.png';
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-sm text-gray-500">
                    {match.venue || 'スタジアム未定'}
                  </span>
                </div>

                <div className="mt-4 text-center">
                  <Link
                    href={`/match/${match.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    詳細を見る
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}

// リーグコードからリーグ名を取得する関数
function getLeagueName(code: string): string {
  const leagues: { [key: string]: string } = {
    PL: 'プレミアリーグ',
    PD: 'ラ・リーガ',
    BL1: 'ブンデスリーガ',
    SA: 'セリエA',
    FL1: 'リーグ・アン',
    CL: 'UEFAチャンピオンズリーグ',
  };

  return leagues[code] || 'リーグ情報';
}
