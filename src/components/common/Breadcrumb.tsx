'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { PATH_DISPLAY_MAP } from '@/features/navigation/breadcrumbs';

export default function Breadcrumb() {
  const pathname = usePathname();

  // パスがない場合、または空（ホームページ）の場合は何も表示しない
  if (!pathname || pathname === '/') return null;

  // パスセグメントを取得し、ホームを先頭に追加
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { name: PATH_DISPLAY_MAP[''], href: '/' },
    ...segments.map((segment, index) => ({
      name: PATH_DISPLAY_MAP[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: `/${segments.slice(0, index + 1).join('/')}`,
    })),
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
