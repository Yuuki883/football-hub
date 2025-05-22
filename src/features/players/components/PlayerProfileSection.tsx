/**
 * 選手プロフィールセクションコンポーネント
 *
 * 選手の基本情報（写真、名前、所属チーム、身体データなど）を表示
 */
import Image from 'next/image';
import { PlayerDetail } from '../types/types';
import { formatDate } from '@/utils/date-formatter';

interface PlayerProfileSectionProps {
  player: PlayerDetail;
}

export default function PlayerProfileSection({ player }: PlayerProfileSectionProps) {
  // フルネームを生成
  const getFullName = () => {
    // 姓名が両方ある場合は姓名を表示
    if (player.firstName && player.lastName) {
      return `${player.firstName} ${player.lastName}`;
    }
    // 通常の表示名を使用
    return player.name;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-24">
      {/* 選手写真 */}
      <div className="relative h-80 w-full bg-slate-100">
        {player.photo ? (
          <Image
            src={player.photo}
            alt={player.name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 320px"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-slate-400 text-lg">写真なし</span>
          </div>
        )}
      </div>

      {/* 基本情報 */}
      <div className="p-6">
        {/* 選手名とチーム */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">{getFullName()}</h1>

          {player.team && (
            <div className="flex items-center mt-2">
              <div className="flex-shrink-0 w-6 h-6 mr-2 flex items-center justify-center">
                <Image
                  src={player.team.logo}
                  alt={player.team.name}
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
              <span className="text-slate-600 truncate">{player.team.name}</span>
            </div>
          )}
        </div>

        {/* 詳細情報テーブル */}
        <div className="divide-y divide-slate-100">
          {/* 国籍 */}
          <div className="py-3 grid grid-cols-2">
            <span className="text-slate-500">国籍</span>
            <span className="font-medium text-slate-800 flex items-center">
              {player.nationality ? <>{player.nationality}</> : '–'}
            </span>
          </div>

          {/* 背番号 - 新しく追加 */}
          {player.number && (
            <div className="py-3 grid grid-cols-2">
              <span className="text-slate-500">背番号</span>
              <span className="font-medium text-slate-800">{player.number}</span>
            </div>
          )}

          {/* ポジション */}
          <div className="py-3 grid grid-cols-2">
            <span className="text-slate-500">ポジション</span>
            <span className="font-medium text-slate-800">{player.position || '–'}</span>
          </div>

          {/* 年齢・生年月日 */}
          <div className="py-3 grid grid-cols-2">
            <span className="text-slate-500">年齢</span>
            <span className="font-medium text-slate-800">
              {player.age ? `${player.age}歳` : '–'}
              {player.birthDate && ` (${formatDate(player.birthDate)})`}
            </span>
          </div>

          {/* 身長 */}
          <div className="py-3 grid grid-cols-2">
            <span className="text-slate-500">身長</span>
            <span className="font-medium text-slate-800">{player.height || '–'}</span>
          </div>

          {/* 体重 */}
          <div className="py-3 grid grid-cols-2">
            <span className="text-slate-500">体重</span>
            <span className="font-medium text-slate-800">{player.weight || '–'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
