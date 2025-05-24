/**
 * ニュースAPI
 *
 * RSSフィードからサッカーニュースを取得する機能
 */

import Parser from 'rss-parser';
import { RssItem } from '../types/type';
import { NewsItem } from '@/types/type';

// RSSパーサーの設定（HTMLコンテンツも取得）
const parser = new Parser({
  customFields: {
    item: [['content:encoded', 'fullContent']],
  },
});

// RSSフィードのURL一覧
const FEED_URLS = ['https://www.soccer-king.jp/feed', 'https://www.football-zone.net/feed'];

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
    // 全フィードを並列で取得・処理
    const newsPromises = FEED_URLS.map(fetchFromFeed);
    const newsArrays = await Promise.all(newsPromises);

    // 全記事を結合し、日付順に並べ替えて指定件数を返す
    return newsArrays
      .flat()
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('ニュース取得エラー:', error);
    return [];
  }
}

/**
 * 単一のRSSフィードから記事を取得
 */
async function fetchFromFeed(feedUrl: string): Promise<NewsItem[]> {
  try {
    // フィードを解析
    const feedData = await parser.parseURL(feedUrl);

    // 負荷軽減のため先頭の記事のみ処理
    const items = feedData.items.slice(0, 8);

    // 各記事を並列処理
    return await Promise.all(items.map(processNewsItem));
  } catch (error) {
    console.error(`フィード取得エラー: ${feedUrl}`);
    return [];
  }
}

/**
 * RSSの記事アイテムをNewsItemに変換
 */
async function processNewsItem(item: RssItem): Promise<NewsItem> {
  // 基本情報
  const newsItem: NewsItem = {
    title: item.title || '',
    link: item.link || '',
    pubDate: item.pubDate || '',
    content: item.contentSnippet || '',
    image: undefined,
  };

  try {
    // 1. HTML内容から画像を抽出
    if (item.fullContent) {
      const imageUrl = extractImageFromHTML(item.fullContent);
      if (imageUrl) {
        newsItem.image = imageUrl;
        return newsItem;
      }
    }

    // 2. 記事ページからOGP画像を取得
    if (item.link) {
      newsItem.image = await fetchOgImage(item.link);
    }
  } catch (error) {
    // エラーは無視（画像なしで記事を返す）
  }

  return newsItem;
}

/**
 * HTMLから画像URLを抽出
 */
function extractImageFromHTML(html: string): string | undefined {
  try {
    // imgタグからsrc属性を抽出
    const imgMatch = html.match(/<img[^>]+src="([^">]+)"[^>]*>/i);
    if (imgMatch?.[1]?.startsWith('http')) {
      return imgMatch[1];
    }

    // 背景画像を抽出
    const bgMatch = html.match(/background-image:\s*url\(['"]?([^'")]+)['"]?\)/i);
    if (bgMatch?.[1]?.startsWith('http')) {
      return bgMatch[1];
    }
  } catch {
    // エラーは無視
  }

  return undefined;
}

/**
 * URLからOGP画像を取得
 */
async function fetchOgImage(url: string): Promise<string | undefined> {
  try {
    // タイムアウト設定
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // 記事ページを取得
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 FootBallHub/1.0' },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return undefined;

    // OGP画像URLを抽出
    const html = await response.text();
    const ogMatch =
      html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i) ||
      html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"[^>]*>/i);

    return ogMatch?.[1];
  } catch {
    // エラーは無視
    return undefined;
  }
}
