'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/utils/cn';

/**
 * リーグナビゲーションコンポーネント
 *
 * URLに含まれるシーズンパラメータを保持してタブ間を移動
 */
interface LeagueNavigationProps {
  slug: string;
  children?: React.ReactNode;
}

const LeagueNavigation: React.FC<LeagueNavigationProps> = ({ slug, children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URLパラメータからシーズンを取得（存在しない場合は空文字列）
  const season = searchParams.get('season') || '';

  const navItems = [
    { name: '概要', path: `/leagues/${slug}` },
    { name: '順位表', path: `/leagues/${slug}/standings` },
    { name: '試合', path: `/leagues/${slug}/matches` },
    { name: 'スタッツ', path: `/leagues/${slug}/stats` },
    { name: 'チーム', path: `/leagues/${slug}/teams` },
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-gray-200 px-0 sm:px-4 bg-white">
      <nav className="w-full overflow-x-auto pb-0.5">
        <ul className="flex min-w-max space-x-4 sm:space-x-8 px-4">
          {navItems.map((item) => {
            const isActive =
              item.path === pathname ||
              (item.path !== `/leagues/${slug}` && pathname.startsWith(item.path));

            // シーズンパラメータが存在する場合のみURLに追加
            // パラメータがない場合は各ページで現在のシーズンがデフォルトとして使用される
            const href = season ? `${item.path}?season=${season}` : item.path;

            return (
              <li key={item.path}>
                <Link
                  href={href}
                  className={cn(
                    'inline-block py-3 sm:py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                    isActive
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-gray-700 hover:text-blue-600 hover:border-blue-300'
                  )}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="w-full sm:w-auto">{children}</div>
    </div>
  );
};

export default LeagueNavigation;
