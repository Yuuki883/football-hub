/**
 * ローディングスピナーコンポーネント
 *
 * データ取得中などの待機状態を表示するスピナー
 */
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = 'medium',
  message = 'データを読み込んでいます...',
  className = '',
}: LoadingSpinnerProps) {
  // サイズに応じたスタイル
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-10 w-10 border-2',
    large: 'h-16 w-16 border-3',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-t-blue-500 border-b-blue-500 border-r-transparent border-l-transparent mb-3 ${sizeClasses[size]}`}
        aria-hidden="true"
      ></div>
      {message && <p className="text-slate-600 text-sm">{message}</p>}
    </div>
  );
}
