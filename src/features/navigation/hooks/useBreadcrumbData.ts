/**
 * パンくずリスト用のカスタムフック
 * 動的セグメントのエンティティ名を効率的に取得
 */

import { useState, useEffect } from 'react';
import { BreadcrumbOverride } from '@/components/common/Breadcrumb';

interface EntityNameCache {
  [key: string]: string;
}

// メモリキャッシュ（セッション中のみ）
const entityNameCache: EntityNameCache = {};

/**
 * エンティティ名を取得するユーティリティ関数
 * @param type - エンティティタイプ ('team' | 'player')
 * @param id - エンティティID
 * @returns エンティティ名
 */
async function fetchEntityName(type: string, id: string): Promise<string | null> {
  const cacheKey = `${type}:${id}`;

  // キャッシュチェック
  if (entityNameCache[cacheKey]) {
    return entityNameCache[cacheKey];
  }

  try {
    const response = await fetch(`/api/breadcrumbs?type=${type}&id=${id}`);

    if (!response.ok) {
      console.warn(`エンティティ名取得失敗: ${type}:${id}`);
      return null;
    }

    const data = await response.json();
    const name = data.name;

    // キャッシュに保存
    if (name) {
      entityNameCache[cacheKey] = name;
    }

    return name;
  } catch (error) {
    console.error(`エンティティ名取得エラー: ${type}:${id}`, error);
    return null;
  }
}

/**
 * パンくずリストデータを動的に解決するフック
 * @param pathname - 現在のパス
 * @returns パンくずリストのオーバーライド設定
 */
export function useBreadcrumbData(pathname: string): {
  overrides: BreadcrumbOverride[];
  isLoading: boolean;
} {
  const [overrides, setOverrides] = useState<BreadcrumbOverride[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const resolveBreadcrumbData = async () => {
      if (!pathname || pathname === '/') {
        setOverrides([]);
        return;
      }

      const segments = pathname.split('/').filter(Boolean);
      const newOverrides: BreadcrumbOverride[] = [];
      let hasAsyncOperations = false;

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const prevSegment = i > 0 ? segments[i - 1] : null;

        // 数値IDの判定
        const isNumericId = /^\d+$/.test(segment);

        if (isNumericId && prevSegment) {
          let entityType: string | null = null;

          // エンティティタイプを判定
          if (prevSegment === 'teams') {
            entityType = 'team';
          } else if (prevSegment === 'players') {
            entityType = 'player';
          }

          if (entityType) {
            hasAsyncOperations = true;
            setIsLoading(true);

            const name = await fetchEntityName(entityType, segment);
            if (name) {
              newOverrides.push({
                segment,
                displayName: name,
              });
            }
          }
        }
      }

      setOverrides(newOverrides);
      if (hasAsyncOperations) {
        setIsLoading(false);
      }
    };

    resolveBreadcrumbData();
  }, [pathname]);

  return { overrides, isLoading };
}

/**
 * キャッシュをクリアする関数（開発時やメモリ管理用）
 */
export function clearBreadcrumbCache(): void {
  Object.keys(entityNameCache).forEach((key) => {
    delete entityNameCache[key];
  });
}
