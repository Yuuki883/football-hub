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
