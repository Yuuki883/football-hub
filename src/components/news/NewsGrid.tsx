'use client';

import NewsCard from './NewsCard';
import { NewsItem } from '@/lib/services/news-service';

interface NewsGridProps {
  initialNews: NewsItem[];
}

export default function NewsGrid({ initialNews }: NewsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {initialNews.map((item, index) => (
        <NewsCard key={item.link || index} news={item} priority={index < 3} />
      ))}
    </div>
  );
}
