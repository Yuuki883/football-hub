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
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}
    >
      <div className="p-6 flex items-center">
        <div className="relative w-20 h-20 flex-shrink-0 mr-6">
          <Image
            src={logo}
            alt={name}
            fill
            sizes="80px"
            className="object-contain"
            priority
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {name}
          </h1>
          <div className="flex flex-wrap items-center mt-1 text-sm text-gray-600 dark:text-gray-300">
            {country && (
              <div className="flex items-center mr-3">
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
              <span key={key} className={index > 0 || country ? 'ml-3' : ''}>
                {key}: {value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      {navigation}

      {/* その他の子要素 */}
      {children && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
