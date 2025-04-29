'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // パス変更時にメニューを閉じる
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // スクロール時にメニューを閉じる
  useEffect(() => {
    const handleScroll = () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMenuOpen]);

  const navItems = [
    { name: 'ホーム', path: '/' },
    { name: 'リーグ', path: '/leagues' },
    { name: '試合', path: '/matches' },
    { name: 'ニュース', path: '/news' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Image
                src="/webicon.png"
                alt="Football Hub"
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            <span className="font-bold text-xl tracking-tight">
              FootballHub
            </span>
          </Link>

          {/* PCナビゲーション */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`font-medium text-sm uppercase tracking-wide transition-colors hover:text-blue-200 flex items-center py-5 ${
                  isActive(item.path)
                    ? 'text-white border-b-2 border-white'
                    : 'text-blue-100'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* モバイルメニューボタン */}
          <button
            className="md:hidden flex items-center p-1 rounded-md hover:bg-blue-800 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="メニューを開く/閉じる"
            aria-expanded={isMenuOpen}
          >
            <div className="relative w-6 h-6">
              <span
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  isMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
                }`}
              >
                <Menu strokeWidth={2} size={24} />
              </span>
              <span
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  isMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
                }`}
              >
                <X strokeWidth={2} size={24} />
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div
        className={`md:hidden bg-blue-800 overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`py-3 px-2 font-medium text-sm transition-colors rounded-md ${
                isActive(item.path)
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-700 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
