import Parser from 'rss-parser';

const parser = new Parser();

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  image?: string;
}

export async function fetchNews(): Promise<NewsItem[]> {
  try {
    // 複数のRSSフィードを取得
    const feeds = [
      'https://www.goal.com/ja/feed',
      'https://www.soccer-king.jp/feed',
      'https://www.football-zone.net/feed',
    ];

    const allNews: NewsItem[] = [];

    for (const feed of feeds) {
      try {
        console.log(`Fetching feed: ${feed}`);
        const feedData = await parser.parseURL(feed);
        console.log(
          `Successfully fetched feed: ${feed}, items: ${feedData.items.length}`
        );

        const newsItems = feedData.items.map((item) => ({
          title: item.title || '',
          link: item.link || '',
          pubDate: item.pubDate || '',
          content: item.contentSnippet || '',
          image: item.enclosure?.url || undefined,
        }));
        allNews.push(...newsItems);
      } catch (feedError) {
        console.error(`Error fetching feed ${feed}:`, feedError);
      }
    }

    console.log(`Total news items fetched: ${allNews.length}`);

    // 日付でソートして最新6件を返す
    const sortedNews = allNews
      .sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      )
      .slice(0, 6);

    console.log('Latest 6 news items:', sortedNews);
    return sortedNews;
  } catch (error) {
    console.error('RSSフィードの取得に失敗しました:', error);
    return [];
  }
}
