/**
 * パンくずリストコンポーネント
 * 自動でエンティティ名を解決し、キャッシュを活用
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { PATH_DISPLAY_MAP, dynamicSegment } from '@/features/navigation/breadcrumbs';
import { useBreadcrumbData } from '@/features/navigation/hooks/useBreadcrumbData';

/**
 * 動的パンくずリスト設定の型定義
 */
export interface BreadcrumbOverride {
  /** 対象のパスセグメント（IDなど） */
  segment: string;
  /** 表示する名前 */
  displayName: string;
}

interface SmartBreadcrumbProps {
  /** 手動オーバーライド設定（優先される） */
  manualOverrides?: BreadcrumbOverride[];
  /** ローディング中の表示制御 */
  showLoadingState?: boolean;
}

/**
 * パンくずリストコンポーネント
 * URLから自動でエンティティ名を解決し、効率的にパンくずリストを表示
 *
 * @param manualOverrides - 手動で指定するオーバーライド設定
 * @param showLoadingState - ローディング状態を表示するか
 * @returns パンくずリストUI
 */
export default function SmartBreadcrumb({
  manualOverrides = [],
  showLoadingState = false,
}: SmartBreadcrumbProps) {
  const pathname = usePathname();
  const { overrides: autoOverrides, isLoading } = useBreadcrumbData(pathname);

  // パスがない場合、または空（ホームページ）の場合は何も表示しない
  if (!pathname || pathname === '/') return null;

  // 手動オーバーライドを優先し、自動解決を補完
  const mergedOverrides = [...manualOverrides];

  // 手動オーバーライドで指定されていないセグメントを自動解決で補完
  autoOverrides.forEach((autoOverride) => {
    const existsInManual = manualOverrides.some(
      (manual) => manual.segment === autoOverride.segment
    );
    if (!existsInManual) {
      mergedOverrides.push(autoOverride);
    }
  });

  // ローディング中の場合
  if (isLoading && showLoadingState) {
    return (
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="flex items-center text-sm text-gray-500">
          <li className="flex items-center">
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded"></div>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" aria-hidden="true" />
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-16 rounded"></div>
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" aria-hidden="true" />
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-20 rounded"></div>
          </li>
        </ol>
      </nav>
    );
  }

  // パスセグメントを取得し、ホームを先頭に追加
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: PATH_DISPLAY_MAP[''], href: '/' },
    ...segments.map((segment, index) => {
      // オーバーライド設定をチェック
      const override = mergedOverrides.find((o) => o.segment === segment);
      const displayName = override
        ? override.displayName
        : dynamicSegment(segment, segments, index);

      return {
        name: displayName,
        href: `/${segments.slice(0, index + 1).join('/')}`,
      };
    }),
  ];

  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex items-center text-sm text-gray-500">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-gray-400" aria-hidden="true" />
            )}

            {index === breadcrumbs.length - 1 ? (
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {breadcrumb.name}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="hover:text-blue-600 hover:underline transition-colors"
              >
                {breadcrumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
