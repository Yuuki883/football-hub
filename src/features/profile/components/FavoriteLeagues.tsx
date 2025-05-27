/**
 * お気に入りリーグ一覧コンポーネント
 * ユーザーがお気に入り登録したリーグのリストを表示
 */
import OptimizedImage from '@/components/common/OptimizedImage';
import Link from 'next/link';
import { FavoriteLeague, League } from '@prisma/client';

type FavoriteLeagueWithLeague = FavoriteLeague & {
  league: League;
};

type FavoriteLeaguesProps = {
  favoriteLeagues: FavoriteLeagueWithLeague[];
};

export default function FavoriteLeagues({ favoriteLeagues }: FavoriteLeaguesProps) {
  if (favoriteLeagues.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">お気に入りリーグはまだありません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {favoriteLeagues.map(({ league }) => (
        <Link
          key={league.id}
          href={`/leagues/${league.slug}`}
          className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition"
        >
          <div className="relative w-12 h-12 mr-4 flex-shrink-0">
            {league.logo ? (
              <OptimizedImage src={league.logo} alt={league.name} fill className="object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-full">
                <span className="text-xs font-bold">{league.name.substring(0, 2)}</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{league.name}</h3>
            <p className="text-sm text-gray-500">{league.country}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
