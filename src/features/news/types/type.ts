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
