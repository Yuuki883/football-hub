'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/utils/cn';

interface NavigationTab {
  name: string;
  path: string;
}

interface TabNavigationProps {
  tabs: NavigationTab[];
  basePath: string;
  children?: React.ReactNode;
}

/**
 * タブ付きナビゲーションコンポーネント
 * リーグページやチームページなど、様々な場所で再利用可能なタブナビゲーション
 */
const TabNavigation: React.FC<TabNavigationProps> = ({ tabs, basePath, children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 現在のクエリパラメータを維持するための関数
  const getHrefWithParams = (path: string) => {
    const currentParams = new URLSearchParams(searchParams);
    const queryString = currentParams.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  return (
    <div className="flex justify-between items-center border-t border-gray-200 px-4 bg-white">
      <nav>
        <ul className="flex space-x-8">
          {tabs.map((tab) => {
            const tabPath = tab.path.startsWith('/') ? tab.path : `${basePath}${tab.path}`;

            const isActive =
              tabPath === pathname || (tabPath !== basePath && pathname.startsWith(tabPath));

            return (
              <li key={tabPath}>
                <Link
                  href={getHrefWithParams(tabPath)}
                  className={cn(
                    'inline-block py-4 border-b-2 font-medium text-sm transition-colors',
                    isActive
                      ? 'border-blue-600 text-blue-700'
                      : 'border-transparent text-gray-700 hover:text-blue-600 hover:border-blue-300'
                  )}
                >
                  {tab.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {children}
    </div>
  );
};

export default TabNavigation;
