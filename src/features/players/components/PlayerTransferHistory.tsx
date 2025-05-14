/**
 * 選手の移籍履歴セクションコンポーネント
 *
 * 選手の所属チーム遍歴をタイムライン形式で表示
 */
import Image from 'next/image';
import { TransferHistoryEntry } from '../types/types';

interface PlayerTransferHistoryProps {
  transfers: TransferHistoryEntry[];
}

export default function PlayerTransferHistory({ transfers }: PlayerTransferHistoryProps) {
  // 移籍履歴がない場合
  if (!transfers || transfers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">所属チーム遍歴</h2>
        <p className="text-slate-500 italic">移籍履歴データがありません</p>
      </div>
    );
  }

  // 移籍履歴を降順にソート（最新のチームが先頭に）
  const sortedTransfers = [...transfers].sort((a, b) => {
    const endA = a.endSeason || a.startSeason;
    const endB = b.endSeason || b.startSeason;
    return Number(endB) - Number(endA);
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-6">所属チーム遍歴</h2>

      <div className="space-y-4">
        {sortedTransfers.map((transfer, index) => (
          <TransferCard
            key={`transfer-${index}`}
            team={transfer.team}
            startSeason={transfer.startSeason}
            endSeason={transfer.endSeason}
            isLatest={index === 0}
          />
        ))}
      </div>
    </div>
  );
}

// 移籍カードコンポーネント
interface TransferCardProps {
  team: {
    name: string;
    logo: string;
  };
  startSeason: string;
  endSeason?: string;
  isLatest?: boolean;
}

function TransferCard({ team, startSeason, endSeason, isLatest }: TransferCardProps) {
  // シーズン表示文字列の作成
  const seasonDisplay =
    endSeason && endSeason !== startSeason ? `${startSeason}–${endSeason}` : startSeason;

  return (
    <div
      className={`flex items-center p-4 border rounded-lg ${isLatest ? 'border-blue-200 bg-blue-50' : 'border-slate-200'}`}
    >
      {/* チームロゴ */}
      <div className="flex-shrink-0 w-16 h-16 mr-4 relative">
        <Image src={team.logo} alt={team.name} width={64} height={64} className="object-contain" />
      </div>

      {/* チーム名とシーズン */}
      <div>
        <h3 className="font-medium text-slate-800">{team.name}</h3>
        <p className="text-sm text-slate-500">
          {seasonDisplay}
          {isLatest && (
            <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
              現在
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
