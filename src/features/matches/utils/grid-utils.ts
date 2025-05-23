import type { CSSProperties } from 'react';
import { MatchPlayerEntry } from '../types/lineup';

/**
 * gridデータから選手の位置スタイルを計算する関数
 * @param grid - APIから提供されるgridデータ（"X:Y"形式）
 * @param side - 'home'または'away'
 * @param entries - そのチームの全選手エントリー
 * @returns CSSPropertiesオブジェクト
 */
export const posStyle = (
  grid: string,
  side: 'home' | 'away',
  entries: MatchPlayerEntry[]
): CSSProperties => {
  // APIから提供されるgridのフォーマット: "X:Y"
  // X: ゴールラインからのライン（1=GK, 2=DF, 3=MF, 4=AMF, 5=FW）
  // Y: 各ラインでの左から右への位置（両チームとも左からカウント）
  const [rowStr, colStr] = grid.split(':');
  const row = parseInt(rowStr, 10);
  const col = parseInt(colStr, 10);

  // entriesから同じrowの選手を抽出
  const sameRowEntries = entries.filter((e) => {
    if (!e.player?.grid) return false;
    const [r] = e.player.grid.split(':');
    return parseInt(r, 10) === row;
  });
  const playerCount = sameRowEntries.length;

  // col値の昇順/降順でソート
  const sortedRowEntries = sameRowEntries.slice().sort((a, b) => {
    if (!a.player?.grid) return 1;
    if (!b.player?.grid) return -1;
    const ca = parseInt(a.player.grid.split(':')[1], 10);
    const cb = parseInt(b.player.grid.split(':')[1], 10);
    // ホームは昇順、アウェイは降順
    return side === 'away' ? cb - ca : ca - cb;
  });
  // この選手がrow内で何番目か（0始まり）
  const idx = sortedRowEntries.findIndex((e) => e.player?.grid === grid);

  // フォーメーションのライン間のスペーシングを制御（0〜100%の仮想ピッチ幅）
  const spacingFactor = {
    1: 0.12, // GK
    2: 0.38, // DF
    3: 0.58, // MF
    4: 0.77, // AMF
    5: 0.92, // FW
  };

  // 垂直位置（上下）
  let top: string;
  if (playerCount === 1) {
    top = '50%';
  } else if (playerCount === 2) {
    top = idx === 0 ? '35%' : '65%';
  } else if (playerCount === 3) {
    if (idx === 0) top = '25%';
    else if (idx === 1) top = '50%';
    else top = '75%';
  } else {
    const spacing = 60 / (playerCount - 1);
    const position = 20 + idx * spacing;
    top = `${position}%`;
  }

  // 水平位置（左右）
  let left: string;
  const base = spacingFactor[row as keyof typeof spacingFactor] || 0.5;
  if (side === 'home') {
    // ホームは0〜50%の範囲にマッピング（左からGK→DF→MF→FW）
    left = `${base * 50}%`;
  } else {
    // アウェイは右からGK→DF→MF→FWの順で50〜100%の範囲にマッピング（左右反転）
    left = `${50 + (1 - base) * 50}%`;
  }

  return {
    top,
    left,
    transform: 'translate(-50%, -50%)',
  };
};

/**
 * grid値に基づいて選手をソートする関数
 * @param a - 選手エントリーA
 * @param b - 選手エントリーB
 * @param side - 'home'または'away'
 * @returns ソート順（数値）
 */
export const sortByGrid = (
  a: MatchPlayerEntry,
  b: MatchPlayerEntry,
  side: 'home' | 'away' = 'home'
) => {
  if (!a.player?.grid) return 1;
  if (!b.player?.grid) return -1;
  const [rA, cA] = a.player.grid.split(':').map(Number);
  const [rB, cB] = b.player.grid.split(':').map(Number);
  if (rA === rB) {
    return side === 'away' ? cB - cA : cA - cB;
  }
  return rA - rB;
};
