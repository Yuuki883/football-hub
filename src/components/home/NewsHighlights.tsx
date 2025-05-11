import { fetchNews } from '@/features/news/api/news';
import { NewsItem } from '@/features/news/types/type';
import NewsGrid from '@/features/news/components/NewsGrid';
import Link from 'next/link';

export default async function NewsHighlightsSection() {
  // サーバー側でデータを直接取得（RSS）- 6件表示
  const news = await fetchNews(6);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Link href="/news" className="text-blue-600 dark:text-blue-400 hover:underline">
          すべてのニュースを見る
        </Link>
      </div>

      {/* クライアントコンポーネントにニュースデータを渡す */}
      <NewsGrid initialNews={news} />
    </div>
  );
}
