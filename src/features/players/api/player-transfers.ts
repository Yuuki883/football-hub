/**
 * 選手の移籍情報処理モジュール
 *
 * 移籍履歴の処理と整形を行う機能
 */
import { TransferHistoryEntry } from '../types/type';
import { ApiResponse } from '@/types/type';
import { ApiTransferEntry } from '@/lib/api-football/types/type-exports';
import { formatTransferType } from '@/lib/api-football/utils/data-formatters';

// 以下の関数はエクスポートを維持
export { formatTransferType };

/**
 * 選手の移籍履歴を変換
 *
 * @param transfersData - 移籍データ
 * @returns 整形された移籍履歴
 */
export function transformTransferHistory(
  transfersData: ApiResponse<{ transfers: ApiTransferEntry[] }[]>
): TransferHistoryEntry[] {
  // 移籍履歴データの作成
  let clubTransferHistory: TransferHistoryEntry[] = [];

  if (transfersData.response?.length > 0 && transfersData.response[0].transfers?.length > 0) {
    // 移籍データが存在する場合
    const transfers = transfersData.response[0].transfers;

    // 移籍情報を変換
    clubTransferHistory = transfers.map((transfer: ApiTransferEntry) => {
      return {
        team: {
          id: transfer.teams.in.id,
          name: transfer.teams.in.name,
          logo: transfer.teams.in.logo,
        },
        transferDate: transfer.date,
        transferType: transfer.type,
        fromTeam: {
          id: transfer.teams.out.id,
          name: transfer.teams.out.name,
          logo: transfer.teams.out.logo,
        },
        isNationalTeam: false,
      };
    });
  }

  // 移籍履歴のみを返す
  return clubTransferHistory;
}
