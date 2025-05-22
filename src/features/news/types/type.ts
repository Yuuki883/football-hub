/**
 * ニュース記事の型定義
 */
export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  image?: string;
}

/**
 * RSSフィードアイテムの型定義
 * rss-parserが返すItemを拡張
 */
export interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  guid?: string;
  creator?: string;
  summary?: string;
  content?: string;
  contentSnippet?: string;
  isoDate?: string;
  categories?: string[];
  // カスタムフィールド
  fullContent?: string;
  enclosure?: {
    url: string;
    length?: number;
    type?: string;
  };
}
