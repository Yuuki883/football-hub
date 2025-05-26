'use client';

import Image from 'next/image';
import { ReactNode } from 'react';

export interface EntityHeaderProps {
  /**
   * エンティティの名前（チーム名またはリーグ名）
   */
  name: string;

  /**
   * エンティティのロゴURL
   */
  logo: string;

  /**
   * 国名（オプション）
   */
  country?: string;

  /**
   * 国旗のURL（オプション）
   */
  flag?: string;

  /**
   * 国旗を表示するかどうか
   * デフォルトはtrue（表示する）
   */
  showFlag?: boolean;

  /**
   * 表示する追加のメタデータ
   * {label: 値} の形式
   */
  metadata?: Record<string, string | number>;

  /**
   * ナビゲーションコンポーネント（タブなど）
   */
  navigation?: ReactNode;

  /**
   * その他の子要素
   */
  children?: ReactNode;

  /**
   * 追加のクラス名
   */
  className?: string;
}

export default function EntityHeader({
  name,
  logo,
  country,
  flag,
  showFlag = true,
  metadata = {},
  navigation,
  children,
  className = '',
}: EntityHeaderProps) {
  // ロゴをフォールバックとして使用
  const defaultFlagUrl = logo;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
          <Image
            src={logo}
            alt={name}
            fill
            sizes="(max-width: 640px) 64px, 80px"
            className="object-contain"
            priority
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
            {name}
          </h1>
          <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-3 mt-1 text-sm text-gray-600 dark:text-gray-300">
            {country && (
              <div className="flex items-center">
                {showFlag && (flag || defaultFlagUrl) && (
                  <div className="relative w-5 h-4 mr-1 border border-gray-100 dark:border-gray-700 rounded-sm overflow-hidden">
                    <Image
                      src={flag || defaultFlagUrl}
                      alt={country}
                      fill
                      sizes="20px"
                      className="object-cover"
                      onError={(e) => {
                        console.warn(`国旗の読み込みに失敗: ${flag}`);
                        // @ts-ignore
                        e.currentTarget.src = defaultFlagUrl;
                      }}
                    />
                  </div>
                )}
                <span>{country}</span>
              </div>
            )}

            {/* メタデータを表示 */}
            {Object.entries(metadata).map(([key, value], index) => (
              <span key={key} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">•</span>}
                {key}: {value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      {navigation && (
        <div className="w-full overflow-x-auto border-t border-gray-200 dark:border-gray-700">
          <div className="min-w-max px-2">{navigation}</div>
        </div>
      )}

      {/* その他の子要素 */}
      {children && <div className="px-4 sm:px-6 pb-4">{children}</div>}
    </div>
  );
}
