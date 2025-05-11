'use client';

import { clsx } from 'clsx';
import { HTMLAttributes } from 'react';

/**
 * プログレスバーのベーススタイル定義
 */
const styles = {
  base: 'rounded-full overflow-hidden',
  container: 'w-full bg-gray-200',
  indicator: 'h-full',
  sizes: {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  },
};

/**
 * プログレスバー共通の基本プロパティ
 */
interface BaseProgressProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * 単一値を表示するプログレスバーのプロパティ
 */
export interface ProgressBarProps extends BaseProgressProps {
  value: number;
  max: number;
  showLabel?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * 単一の値を表現するプログレスバー
 */
export function ProgressBar({
  value,
  max,
  size = 'md',
  className,
  showLabel = false,
  color = '#3b82f6',
  ...props
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div
      className={clsx(styles.base, styles.container, styles.sizes[size], className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${percentage}%`}
      {...props}
    >
      <div
        className={clsx(styles.indicator)}
        style={{
          width: `${percentage}%`,
          backgroundColor: color,
        }}
      >
        {showLabel && <span className="text-xs text-white px-1">{value}</span>}
      </div>
    </div>
  );
}

/**
 * 2つの値を比較表示するプログレスバーのプロパティ
 */
export interface ComparisonBarProps extends BaseProgressProps {
  value1: number;
  value2: number;
  color1?: string;
  color2?: string;
  minLabelPercent?: number;
  minLabelPct?: number;
}

/**
 * 比較用のプログレスバー（ホーム vs アウェイなど）
 * インジケーターの色は直接backgroundColor指定で制御
 */
export function ComparisonBar({
  value1,
  value2,
  color1 = '#3b82f6',
  color2 = '#9ca3af',
  className,
  minLabelPercent = 15,
  minLabelPct,
  ...props
}: ComparisonBarProps) {
  const total = value1 + value2;
  const percent1 = total > 0 ? Math.round((value1 / total) * 100) : 50;
  const percent2 = 100 - percent1;

  // minLabelPctが指定されていればそちらを優先
  const effectiveMinPercent = minLabelPct ?? minLabelPercent;

  return (
    <div
      className={clsx('h-4', styles.base, styles.container, 'flex', className)}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value1}
      aria-valuetext={`値1: ${value1}, 値2: ${value2}`}
      {...props}
    >
      <div
        className={clsx(styles.indicator, 'text-xs flex items-center justify-center text-white')}
        style={{
          width: `${percent1}%`,
          backgroundColor: color1,
        }}
      >
        {value1 > 0 && percent1 > effectiveMinPercent ? `${value1}` : ''}
      </div>
      <div
        className={clsx(styles.indicator, 'text-xs flex items-center justify-center text-white')}
        style={{
          width: `${percent2}%`,
          backgroundColor: color2,
        }}
      >
        {value2 > 0 && percent2 > effectiveMinPercent ? `${value2}` : ''}
      </div>
    </div>
  );
}
