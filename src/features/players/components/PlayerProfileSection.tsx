/**
 * 選手プロフィールセクションコンポーネント
 *
 * 選手の基本情報（写真、名前、所属チーム、身体データなど）を表示
 */
import Image from 'next/image';
import { PlayerDetail } from '../types/types';
import clsx from 'clsx';
import { formatDate } from '@/utils/date-formatter';

interface PlayerProfileSectionProps {
  player: PlayerDetail;
}

export default function PlayerProfileSection({ player }: PlayerProfileSectionProps) {
  // 国籍表示用のクラス名（国旗emoji表示のため）
  const countryClass = player.nationality ? `fi fi-${getNationalityCode(player.nationality)}` : '';

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
          <h1 className="text-2xl font-bold text-slate-800">{player.name}</h1>

          {player.team && (
            <div className="flex items-center mt-2">
              <div className="relative h-6 w-6 mr-2 overflow-hidden">
                <Image
                  src={player.team.logo}
                  alt={player.team.name}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className="text-slate-600">{player.team.name}</span>
            </div>
          )}
        </div>

        {/* 詳細情報テーブル */}
        <div className="divide-y divide-slate-100">
          {/* 国籍 */}
          <div className="py-3 grid grid-cols-2">
            <span className="text-slate-500">国籍</span>
            <span className="font-medium text-slate-800 flex items-center">
              {player.nationality ? (
                <>
                  <span className={clsx('mr-2', countryClass)}></span>
                  {player.nationality}
                </>
              ) : (
                '–'
              )}
            </span>
          </div>

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

/**
 * 国籍からflag-iconsで使用する国コードを取得
 *
 * @param nationality - 国籍
 * @returns 国コード（小文字2文字）
 */
function getNationalityCode(nationality: string): string {
  // 主要国のマッピング
  const countryCodeMap: Record<string, string> = {
    Argentina: 'ar',
    Belgium: 'be',
    Brazil: 'br',
    England: 'gb-eng',
    France: 'fr',
    Germany: 'de',
    Italy: 'it',
    Japan: 'jp',
    Netherlands: 'nl',
    Portugal: 'pt',
    Scotland: 'gb-sct',
    Spain: 'es',
    'United Kingdom': 'gb',
    // 必要に応じて追加
  };

  return countryCodeMap[nationality] || '';
}
