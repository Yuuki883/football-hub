import { fetchNews } from '@/lib/services/news-service';
import NewsGrid from '@/components/news/NewsGrid';
import Link from 'next/link';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  image?: string;
}

export default async function NewsHighlightsSection() {
  // サーバー側でデータを直接取得（APIを経由せず）
  const news = await fetchNews();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {/* <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          最新ニュース
        </h2> */}
        <Link
          href="/news"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          すべてのニュースを見る
        </Link>
      </div>

      {/* クライアントコンポーネントにニュースデータを渡す */}
      <NewsGrid initialNews={news} />
    </div>
  );
}
