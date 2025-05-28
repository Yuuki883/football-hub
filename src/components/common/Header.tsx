'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import AuthButtons from '@/features/auth/components/AuthButtons';
import Navigation from './Navigation';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // メニュー外クリック時に閉じる
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    // 次のイベントループで追加（現在のクリックイベントの処理後）
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  // メニューの開閉
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // メニューアイテムクリック時の処理
  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg sticky top-0 z-[100]"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="flex items-center space-x-2 cursor-pointer">
            <div className="relative w-8 h-8">
              <Image
                src="/webicon.png"
                alt="Football Hub"
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            <span className="font-bold text-xl tracking-tight">FootBallHub</span>
          </Link>

          {/* PCナビゲーション */}
          <div className="hidden md:flex items-center">
            <Navigation />

            {/* 認証ボタン (PC) */}
            <div className="hidden md:block">
              <AuthButtons />
            </div>
          </div>

          {/* モバイルメニューボタン */}
          <button
            className="md:hidden flex items-center p-1 rounded-md hover:bg-blue-800 transition-colors cursor-pointer"
            onClick={toggleMenu}
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
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <Navigation isMobile={true} onItemClick={handleMenuItemClick} />

        {/* 認証ボタン (モバイル) */}
        <div className="py-3 px-2 border-t border-blue-700 mt-2 pt-4">
          <AuthButtons />
        </div>
      </div>
    </header>
  );
}
