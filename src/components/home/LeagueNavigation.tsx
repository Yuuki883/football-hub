import Link from 'next/link';
import Image from 'next/image';

// サッカーリーグのデータ
const LEAGUE_PAGES = [
  {
    id: 'PL',
    code: 'PL',
    name: 'プレミアリーグ',
    emblem: 'https://media.api-sports.io/football/leagues/39.png',
    slug: 'premier-league',
  },
  {
    id: 'PD',
    code: 'PD',
    name: 'ラ・リーガ',
    emblem: 'https://media.api-sports.io/football/leagues/140.png',
    slug: 'la-liga',
  },
  {
    id: 'BL1',
    code: 'BL1',
    name: 'ブンデスリーガ',
    emblem: 'https://media.api-sports.io/football/leagues/78.png',
    slug: 'bundesliga',
  },
  {
    id: 'SA',
    code: 'SA',
    name: 'セリエA',
    emblem: 'https://media.api-sports.io/football/leagues/135.png',
    slug: 'serie-a',
  },
  {
    id: 'FL1',
    code: 'FL1',
    name: 'リーグ・アン',
    emblem: 'https://media.api-sports.io/football/leagues/61.png',
    slug: 'ligue-1',
  },
  {
    id: 'CL',
    code: 'CL',
    name: 'チャンピオンズリーグ',
    emblem: 'https://media.api-sports.io/football/leagues/2.png',
    slug: 'champions-league',
  },
  {
    id: 'EL',
    code: 'EL',
    name: 'ヨーロッパリーグ',
    emblem: 'https://media.api-sports.io/football/leagues/3.png',
    slug: 'europa-league',
  },
  {
    id: 'ECL',
    code: 'ECL',
    name: 'カンファレンスリーグ',
    emblem: 'https://media.api-sports.io/football/leagues/848.png',
    slug: 'conference-league',
  },
];

export default function LeagueNavigation() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {LEAGUE_PAGES.map((league) => (
          <Link
            key={league.id}
            href={`/leagues/${league.slug}`}
            className="flex flex-col items-center bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            <div className="w-14 h-14 mb-3 flex items-center justify-center">
              <Image
                src={league.emblem || '/league-placeholder.png'}
                alt={league.name}
                width={56}
                height={56}
                style={{
                  width: 'auto',
                  height: 'auto',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
                className="object-contain"
              />
            </div>
            <span className="text-sm font-medium text-center w-full truncate px-1">
              {league.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// リーグデータを外部から使用できるようにエクスポート
export { LEAGUE_PAGES };
