'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NewsItem } from '../types/type';

interface NewsCardProps {
  news: NewsItem;
  priority?: boolean;
}

/**
 * ニュース記事カード
 *
 * 記事タイトル、内容、画像を表示する
 */
export default function NewsCard({ news, priority = false }: NewsCardProps) {
  const [imageError, setImageError] = useState(false);
  const [formattedDate, setFormattedDate] = useState('');
  const [imageUrl, setImageUrl] = useState(news.image);

  // 日付を「2025年5月22日」形式にフォーマット
  const formatPublishDate = useCallback(() => {
    try {
      const date = new Date(news.pubDate);
      setFormattedDate(
        date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      );
    } catch {
      setFormattedDate('');
    }
  }, [news.pubDate]);

  // 画像URLを処理（相対パスを絶対URLに変換）
  const processImageUrl = useCallback(() => {
    if (!news.image) return;

    // 絶対URLの場合はそのまま使用
    if (news.image.startsWith('http')) {
      setImageUrl(news.image);
      return;
    }

    // 相対URLを絶対URLに変換
    try {
      const baseUrl = new URL(news.link || '').origin;
      setImageUrl(new URL(news.image, baseUrl).href);
    } catch {
      setImageUrl(news.image); // 変換失敗時は元のURLを使用
    }
  }, [news.image, news.link]);

  useEffect(() => {
    // 日付のフォーマット
    formatPublishDate();

    // 画像URLの処理
    processImageUrl();
  }, [formatPublishDate, processImageUrl]);

  // 記事リンク先のURL
  const articleUrl = news.link || '#';

  return (
    <Link
      href={articleUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow block h-full"
    >
      {/* 画像エリア */}
      {imageUrl && !imageError ? (
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={news.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={priority}
            unoptimized={!imageUrl.includes('.football-hub.')}
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">No Image</span>
        </div>
      )}

      {/* 記事情報エリア */}
      <div className="p-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          {formattedDate || '読み込み中...'}
        </div>
        <h3 className="font-semibold text-lg mb-2">{news.title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">{news.content}</p>
      </div>
    </Link>
  );
}
