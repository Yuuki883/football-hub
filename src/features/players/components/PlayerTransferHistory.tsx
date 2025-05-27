/**
 * 選手の移籍履歴セクションコンポーネント
 *
 * 選手の移籍情報をタイムライン形式で表示
 * 移籍日付、移籍金、移籍元/移籍先チームを表示
 */
import Image from 'next/image';
import { TransferHistoryEntry } from '../types/type';

interface PlayerTransferHistoryProps {
  transfers: TransferHistoryEntry[];
}

export default function PlayerTransferHistory({ transfers }: PlayerTransferHistoryProps) {
  // 移籍情報がある移籍履歴のみをフィルタリング
  const transfersWithDetails = transfers.filter(
    (transfer) => transfer.transferDate && transfer.fromTeam && !transfer.isNationalTeam
  );

  // 移籍履歴がない場合
  if (!transfersWithDetails || transfersWithDetails.length === 0) {
    return null; // 移籍情報がない場合は何も表示しない
  }

  // 移籍日付でソート（最新順）
  const sortedTransfers = [...transfersWithDetails].sort((a, b) => {
    if (a.transferDate && b.transferDate) {
      return new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime();
    }
    return 0;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold text-slate-800 mb-6">移籍履歴</h2>

      <div className="relative">
        {/* タイムラインの縦線 */}
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200"></div>

        {/* 移籍情報リスト */}
        <div className="space-y-6 relative">
          {sortedTransfers.map((transfer, index) => (
            <TransferCard
              key={`transfer-${index}`}
              toTeam={transfer.team}
              fromTeam={transfer.fromTeam}
              transferDate={transfer.transferDate}
              transferType={transfer.transferType}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 移籍カードコンポーネント
interface TransferCardProps {
  toTeam: {
    name: string;
    logo: string;
  };
  fromTeam?: {
    name: string;
    logo: string;
  };
  transferDate?: string;
  transferType?: string;
}

function TransferCard({ toTeam, fromTeam, transferDate, transferType }: TransferCardProps) {
  // 日付をフォーマット
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 移籍金の表示形式を整える
  const formatTransferType = (type?: string): string => {
    if (!type) return '不明';
    if (type.toLowerCase() === 'free') return '移籍金なし（フリー）';
    if (type.toLowerCase() === 'loan') return 'ローン（期限付き移籍）';
    return type; // それ以外はそのまま表示（€10M など）
  };

  return (
    <div className="flex items-start ml-8 relative">
      {/* タイムライン上の丸ポイント */}
      <div className="absolute -left-10 mt-1.5 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>

      {/* 移籍カード */}
      <div className="bg-slate-50 rounded-lg p-4 w-full shadow-sm border border-slate-200">
        {/* 移籍日時 */}
        {transferDate && (
          <div className="text-sm text-slate-500 mb-3 font-medium">{formatDate(transferDate)}</div>
        )}

        {/* 移籍内容 */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* 移籍元チーム */}
          {fromTeam && (
            <div className="flex items-center">
              <div className="relative w-10 h-10 mr-3 flex-shrink-0">
                <Image
                  src={fromTeam.logo}
                  alt={fromTeam.name}
                  fill
                  sizes="40px"
                  className="object-contain"
                  unoptimized // 外部API画像のため最適化を無効化
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500">移籍元</span>
                <span className="font-medium text-slate-800">{fromTeam.name}</span>
              </div>
            </div>
          )}

          {/* 移籍方向の矢印 */}
          <div className="text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>

          {/* 移籍先チーム */}
          <div className="flex items-center">
            <div className="relative w-10 h-10 mr-3 flex-shrink-0">
              <Image
                src={toTeam.logo}
                alt={toTeam.name}
                fill
                sizes="40px"
                className="object-contain"
                unoptimized // 外部API画像のため最適化を無効化
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500">移籍先</span>
              <span className="font-medium text-slate-800">{toTeam.name}</span>
            </div>
          </div>
        </div>

        {/* 移籍金情報 */}
        {transferType && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-400 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-slate-700">
                {formatTransferType(transferType)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
