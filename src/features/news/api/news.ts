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
 * 複数のRSSフィードからニュースを一括取得し、日付順にソート
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

    // 3つのフィードを並列で処理
    const feedPromises = feeds.map(async (feed) => {
      try {
        const feedData = await parser.parseURL(feed);
        return feedData.items.map((item) => ({
          title: item.title || '',
          link: item.link || '',
          pubDate: item.pubDate || '',
          content: item.contentSnippet || '',
          image: item.enclosure?.url || undefined,
        }));
      } catch (feedError) {
        console.error(`Error fetching feed ${feed}:`, feedError);
        return []; // エラー時は空配列を返す
      }
    });

    // すべてのフィード処理を待機して結果を一つの配列にまとめる
    const allNewsArrays = await Promise.all(feedPromises);
    const allNews = allNewsArrays.flat();

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
