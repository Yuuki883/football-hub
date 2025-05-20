/**
 * 選手の移籍情報処理モジュール
 *
 * 移籍履歴の処理と整形を行う機能
 */
import { TransferHistoryEntry } from '../types/types';

/**
 * 移籍データから移籍履歴を抽出
 *
 * @param transfersData - APIから取得した移籍データ
 * @returns 移籍履歴エントリの配列
 */
export function extractTransferHistory(transfersData: any): TransferHistoryEntry[] {
  // 移籍履歴データの作成
  let clubTransferHistory: TransferHistoryEntry[] = [];

  if (transfersData.response?.length > 0 && transfersData.response[0].transfers?.length > 0) {
    // 移籍データが存在する場合
    const transfers = transfersData.response[0].transfers;

    // 最新の移籍から順に表示するため逆順にする
    clubTransferHistory = transfers.map((transfer: any) => {
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

  return clubTransferHistory;
}

/**
 * 移籍情報の表示名を生成
 *
 * @param transferType - 移籍タイプ（"Free", "Loan", "€8.5M"など）
 * @returns 日本語を含む表示用移籍タイプ
 */
export function formatTransferType(transferType?: string): string {
  if (!transferType) return '不明';

  // 一般的な移籍タイプの日本語表示
  if (transferType.toLowerCase() === 'free') return '無料移籍';
  if (transferType.toLowerCase() === 'loan') return 'レンタル移籍';
  if (transferType.toLowerCase() === 'end of loan') return 'レンタル終了';

  // 金額を含む移籍タイプはそのまま表示
  return transferType;
}
