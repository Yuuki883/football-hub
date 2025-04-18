import Link from 'next/link';

// サッカーリーグのデータ
const leagues = [
  { id: 'PL', name: 'プレミアリーグ', slug: 'premier-league' },
  { id: 'PD', name: 'ラ・リーガ', slug: 'la-liga' },
  { id: 'BL1', name: 'ブンデスリーガ', slug: 'bundesliga' },
  { id: 'SA', name: 'セリエA', slug: 'serie-a' },
  { id: 'FL1', name: 'リーグ・アン', slug: 'ligue-1' },
  { id: 'CL', name: 'チャンピオンズリーグ', slug: 'champions-league' },
];

export default function LeagueNavigation() {
  return (
    <div className="mb-8">
      <h2 className="sr-only">リーグナビゲーション</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        {leagues.map((league) => (
          <Link
            key={league.id}
            href={`/leagues/${league.slug}`}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center hover:shadow-md transition-shadow flex flex-col items-center justify-center"
          >
            <div className="text-sm font-semibold text-gray-800 dark:text-white">
              {league.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
