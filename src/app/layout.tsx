import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'FootballHub - サッカー情報ポータル',
  description: '欧州5大リーグ、欧州大会の最新情報をリアルタイムで提供',
  icons: {
    icon: [
      {
        url: '/webicon.png',
        sizes: '32x32',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} antialiased min-h-screen flex flex-col`}
      >
        <QueryProvider>
          <Header />
          <div className="flex-grow">{children}</div>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
