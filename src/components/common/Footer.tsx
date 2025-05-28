'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'ホーム', path: '/' },
    // { name: 'リーグ', path: '/leagues' },
    // { name: '試合', path: '/matches' },
    { name: 'ニュース', path: '/news' },
  ];

  // const legalLinks = [
  //   { name: '利用規約', path: '/terms' },
  //   { name: 'プライバシーポリシー', path: '/privacy' },
  //   { name: 'お問い合わせ', path: '/contact' },
  // ];

  return (
    <footer className="bg-gray-800 text-gray-300 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* サイト情報 */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">FootballHub</h3>
            <p className="mb-3 text-sm">
              欧州5大リーグ、欧州大会の最新情報をリアルタイムで提供。
              サッカーファンのための総合ポータルサイト。
            </p>
          </div>

          {/* メインリンク */}
          <div>
            <h3 className="text-lg font-medium mb-4 text-white">サイトマップ</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link href={link.path} className="text-sm hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 法的情報とソーシャル
          <div>
            <h3 className="text-lg font-medium mb-4 text-white">法的情報</h3>
            <ul className="space-y-2 mb-6">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-center">
          <p>© {currentYear} FootballHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
