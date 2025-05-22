/**
 * お気に入りチーム一覧コンポーネント
 * ユーザーがお気に入り登録したチームのリストを表示
 */
import Image from 'next/image';
import Link from 'next/link';
import { FavoriteTeam, Team } from '@prisma/client';

type FavoriteTeamWithTeam = FavoriteTeam & {
  team: Team;
};

type FavoriteTeamsProps = {
  favoriteTeams: FavoriteTeamWithTeam[];
};

export default function FavoriteTeams({ favoriteTeams }: FavoriteTeamsProps) {
  if (favoriteTeams.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">お気に入りチームはまだありません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {favoriteTeams.map(({ team }) => (
        <Link
          key={team.id}
          href={`/teams/${team.apiId}`}
          className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition"
        >
          <div className="relative w-12 h-12 mr-4 flex-shrink-0">
            {team.logo ? (
              <Image src={team.logo} alt={team.name} fill className="object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-full">
                <span className="text-xs font-bold">
                  {team.shortName || team.name.substring(0, 2)}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{team.name}</h3>
            <p className="text-sm text-gray-500">{team.country}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
