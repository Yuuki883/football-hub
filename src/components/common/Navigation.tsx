/**
 * ナビゲーションコンポーネント
 * usePathnameを使用するため、クライアントコンポーネントとして分離
 */
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface NavigationProps {
  isMobile?: boolean;
  onItemClick?: () => void;
}

export default function Navigation({ isMobile = false, onItemClick }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'ホーム', path: '/' },
    { name: 'ニュース', path: '/news' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  if (isMobile) {
    return (
      <nav className="flex flex-col px-4 py-2 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onClick={onItemClick}
            className={`py-3 px-2 font-medium text-sm transition-colors rounded-md cursor-pointer ${
              isActive(item.path)
                ? 'bg-blue-700 text-white'
                : 'text-blue-100 hover:bg-blue-700 hover:text-white'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="flex space-x-8 mr-8">
      {navItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`font-medium text-sm uppercase tracking-wide transition-colors hover:text-blue-200 flex items-center py-5 cursor-pointer ${
            isActive(item.path) ? 'text-white border-b-2 border-white' : 'text-blue-100'
          }`}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
