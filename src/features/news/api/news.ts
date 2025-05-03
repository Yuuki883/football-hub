/**
 * ニュースAPI
 *
 * RSSフィードからサッカーニュースを取得する機能を提供
 */

import Parser from 'rss-parser';
import { NewsItem } from '../types/type';
const parser = new Parser();

/**
 * サッカーニュースを取得する
 *
 * 複数のRSSフィードからニュースを取得し、日付順にソート
 *
 * @param limit 取得する記事数 (デフォルト: 6)
 * @returns ニュース記事の配列
 */
export async function fetchNews(limit: number = 6): Promise<NewsItem[]> {
  try {
    // 複数のRSSフィードを取得
    const feeds = [
      'https://web.gekisaka.jp/feed?category=foreign',
      'https://www.soccer-king.jp/feed',
      'https://www.football-zone.net/feed',
    ];

    const allNews: NewsItem[] = [];

    for (const feed of feeds) {
      try {
        const feedData = await parser.parseURL(feed);

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

    // 日付でソートして指定された件数を返す
    const sortedNews = allNews
      .sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      )
      .slice(0, limit);

    return sortedNews;
  } catch (error) {
    console.error('RSSフィードの取得に失敗しました:', error);
    return [];
  }
}
