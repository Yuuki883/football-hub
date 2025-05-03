'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NewsItem } from '../types/type';

interface NewsCardProps {
  news: NewsItem;
  priority?: boolean;
}

export default function NewsCard({ news, priority = false }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string>('');

  // クライアントサイドでのみ日付をフォーマット
  useEffect(() => {
    // クライアントサイドでのみ日付をフォーマット
    const date = new Date(news.pubDate);
    setFormattedDate(
      date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    );
  }, [news.pubDate]);

  return (
    <Link
      href={news.link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block h-full"
    >
      {news.image && !imageError && (
        <div className="relative h-48 w-full">
          <Image
            src={news.image}
            alt={news.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={priority}
            onError={() => {
              console.error(`画像の読み込みに失敗しました: ${news.image}`);
              setImageError(true);
            }}
          />
        </div>
      )}

      {(!news.image || imageError) && (
        <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">No Image</span>
        </div>
      )}

      <div className="p-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {formattedDate || '読み込み中...'}
        </div>
        <h3 className="font-semibold text-lg mb-2">{news.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
          {news.content}
        </p>
      </div>
    </Link>
  );
}
