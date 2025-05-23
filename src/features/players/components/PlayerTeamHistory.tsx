/**
 * 選手の所属チーム遍歴セクションコンポーネント
 *
 * 選手の所属チーム遍歴をタイムライン形式で表示
 * クラブチーム、ユースチーム、代表チームを分けて表示
 */
import Image from 'next/image';
import { TransferHistoryEntry } from '../types/types';

interface PlayerTeamHistoryProps {
  transfers: TransferHistoryEntry[];
}

export default function PlayerTeamHistory({ transfers }: PlayerTeamHistoryProps) {
  // 移籍履歴がない場合
  if (!transfers || transfers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">所属チーム遍歴</h2>
        <p className="text-slate-500 italic">移籍履歴データがありません</p>
      </div>
    );
  }

  // クラブチームと代表チームを分離
  const clubTeams = transfers.filter((transfer) => !transfer.isNationalTeam);
  const nationalTeams = transfers.filter((transfer) => transfer.isNationalTeam);

  // ユースチームに関連する単語パターン
  const youthTeamPattern = /\b(U\d+|U-\d+|Youth|Junior|Juvenil|Primavera|Jong)\b/i;

  // チームの重複を排除して統合する関数
  const consolidateTeams = (teamEntries: TransferHistoryEntry[]) => {
    // チームIDでグルーピング
    const teamGroups: Record<string | number, TransferHistoryEntry[]> = {};

    teamEntries.forEach((entry) => {
      const teamId = entry.team.id;
      if (!teamGroups[teamId]) {
        teamGroups[teamId] = [];
      }
      teamGroups[teamId].push(entry);
    });

    // 各グループの中から最適なエントリを選択
    return Object.values(teamGroups).map((group) => {
      if (group.length === 1) {
        // グループに1つしかエントリがない場合はそのまま返す
        return group[0];
      }

      // 複数のエントリがある場合は、日付を統合する
      // transferDateがある場合はその日付が最も新しいエントリを優先
      const entriesWithDates = group
        .filter((e) => e.transferDate)
        .sort((a, b) => new Date(b.transferDate!).getTime() - new Date(a.transferDate!).getTime());

      const primaryEntry = entriesWithDates.length > 0 ? entriesWithDates[0] : group[0];

      // シーズン情報を統合（最初と最後を取得）
      const allSeasons = group
        .map((e) => [e.startSeason, e.endSeason])
        .flat()
        .filter(Boolean) as string[];

      if (allSeasons.length > 0) {
        // 数値としてソート
        const sortedSeasons = [...allSeasons].sort((a, b) => Number(a) - Number(b));
        primaryEntry.startSeason = sortedSeasons[0];
        primaryEntry.endSeason = sortedSeasons[sortedSeasons.length - 1];
      }

      return primaryEntry;
    });
  };

  // クラブチームをユースチームとトップチームに分類（重複排除後）
  const consolidatedClubTeams = consolidateTeams(clubTeams);
  const youthClubTeams = consolidatedClubTeams.filter((team) =>
    youthTeamPattern.test(team.team.name)
  );
  const topClubTeams = consolidatedClubTeams.filter(
    (team) => !youthTeamPattern.test(team.team.name)
  );

  // 代表チームも重複排除
  const consolidatedNationalTeams = consolidateTeams(nationalTeams);

  // チーム履歴をソート（新しい順）
  const sortTeamsByDate = (transfersList: TransferHistoryEntry[]) => {
    return [...transfersList].sort((a, b) => {
      // 移籍日があればそれを優先
      if (a.transferDate && b.transferDate) {
        return new Date(b.transferDate).getTime() - new Date(a.transferDate).getTime();
      }

      // 次に終了シーズンを比較（数値として比較）
      const endA = a.endSeason || a.startSeason || '';
      const endB = b.endSeason || b.startSeason || '';
      return Number(endB) - Number(endA);
    });
  };

  // 各カテゴリーをソート
  const sortedTopClubTeams = sortTeamsByDate(topClubTeams);
  const sortedYouthClubTeams = sortTeamsByDate(youthClubTeams);
  const sortedNationalTeams = sortTeamsByDate(consolidatedNationalTeams);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-6">所属チーム遍歴</h2>

      {/* シニアクラブチーム */}
      {sortedTopClubTeams.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">シニアクラブ</h3>
          <div className="space-y-4">
            {sortedTopClubTeams.map((transfer, index) => (
              <TeamCard
                key={`top-club-${index}`}
                team={transfer.team}
                startSeason={transfer.startSeason}
                endSeason={transfer.endSeason}
                transferDate={transfer.transferDate}
                isLatest={index === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* ユースチーム */}
      {sortedYouthClubTeams.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">ユースクラブ</h3>
          <div className="space-y-4">
            {sortedYouthClubTeams.map((transfer, index) => (
              <TeamCard
                key={`youth-club-${index}`}
                team={transfer.team}
                startSeason={transfer.startSeason}
                endSeason={transfer.endSeason}
                transferDate={transfer.transferDate}
                isLatest={false} // ユースチームには「現在」バッジを表示しない
              />
            ))}
          </div>
        </div>
      )}

      {/* 代表チーム */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">代表チーム</h3>
        {sortedNationalTeams.length > 0 ? (
          <div className="space-y-4">
            {sortedNationalTeams.map((transfer, index) => (
              <NationalTeamCard
                key={`national-${index}`}
                team={transfer.team}
                startSeason={transfer.startSeason}
                endSeason={transfer.endSeason}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic">代表チームの経歴はありません</p>
        )}
      </div>
    </div>
  );
}

// チームカードコンポーネント（クラブチーム用）
interface TeamCardProps {
  team: {
    name: string;
    logo: string;
  };
  startSeason?: string;
  endSeason?: string;
  transferDate?: string;
  isLatest?: boolean;
}

function TeamCard({ team, startSeason, endSeason, transferDate, isLatest }: TeamCardProps) {
  // 日付をフォーマット
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 在籍期間を計算
  const calculateTenure = (start?: string, end?: string): string => {
    if (!start) {
      // 開始年がなく移籍日付がある場合は移籍日付を表示
      if (transferDate) {
        return formatDate(transferDate);
      }
      return '';
    }

    // 1年だけの場合
    if (!end || start === end) {
      return `${start}年`;
    }

    // 複数年の場合（現在のチームなら「〜たった今」表示）
    if (isLatest) {
      return `${start}年 - たった今`;
    }

    return `${start}年 - ${end}年`;
  };

  // 在籍期間表示
  const tenureDisplay = calculateTenure(startSeason, endSeason);

  return (
    <div className="flex items-center p-4 border rounded-lg border-slate-200">
      {/* チームロゴ */}
      <div className="flex-shrink-0 w-16 h-16 mr-4 flex items-center justify-center">
        <div className="relative w-12 h-12">
          <Image
            src={team.logo}
            alt={team.name}
            fill
            sizes="48px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* チーム名と在籍期間 */}
      <div className="flex-grow min-w-0">
        <h3 className="font-medium text-slate-800 truncate">{team.name}</h3>
        <div className="text-sm text-slate-500 mt-1">
          {tenureDisplay && <span className="block">{tenureDisplay}</span>}
        </div>
      </div>

      {/* 現在のチーム表示 */}
      {isLatest && (
        <div className="ml-2 flex-shrink-0">
          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full whitespace-nowrap">
            現在
          </span>
        </div>
      )}
    </div>
  );
}

// 代表チーム用カードコンポーネント
interface NationalTeamCardProps {
  team: {
    name: string;
    logo: string;
  };
  startSeason?: string;
  endSeason?: string;
}

function NationalTeamCard({ team, startSeason, endSeason }: NationalTeamCardProps) {
  // 在籍期間を計算
  const calculateTenure = (start?: string, end?: string): string => {
    if (!start) return '';

    // 1年だけの場合
    if (!end || start === end) {
      return `${start}年`;
    }

    // 複数年の場合
    return `${start}年〜${end}年`;
  };

  // 在籍期間表示
  const tenureDisplay = calculateTenure(startSeason, endSeason);

  return (
    <div className="flex items-center p-4 border rounded-lg border-slate-200">
      {/* チームロゴ*/}
      <div className="flex-shrink-0 w-16 h-16 mr-4 flex items-center justify-center">
        <div className="relative w-12 h-12">
          <Image
            src={team.logo}
            alt={team.name}
            fill
            sizes="48px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* チーム名と在籍期間 */}
      <div className="flex-grow min-w-0">
        <h3 className="font-medium text-slate-800 truncate">{team.name}</h3>
        <span className="text-sm text-slate-500 block mt-1">{tenureDisplay}</span>
      </div>
    </div>
  );
}
