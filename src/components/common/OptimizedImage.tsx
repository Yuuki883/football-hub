// src/components/common/OptimizedImage.tsx
import Image, { ImageProps } from 'next/image';
import { ReactNode, useState, useEffect } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'unoptimized' | 'loading'> {
  fallbackSrc?: string;
  disableOptimization?: boolean;
  fallbackComponent?: ReactNode;
  lazyLoad?: boolean; // 遅延読み込みフラグ
  lazyDelay?: number; // 遅延時間（ミリ秒）
  loading?: 'lazy' | 'eager'; // 明示的にloadingプロパティ追加
  retryLoad?: boolean; // 画像再読み込み試行フラグ
  retryDelay?: number; // 再試行までの遅延時間
  maxRetries?: number; // 最大再試行回数
}

/**
 * 最適化制御付き画像コンポーネント
 * 画像の最適化制御とエラーハンドリングを行う
 */
export default function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  disableOptimization,
  fallbackComponent,
  lazyLoad = false,
  lazyDelay = 1000,
  loading = 'lazy', // デフォルトでlazyに設定
  retryLoad = true, // デフォルトで再読み込み試行を有効化
  retryDelay = 3000, // デフォルトで3秒後に再試行
  maxRetries = 2, // デフォルトで最大2回再試行
  ...props
}: OptimizedImageProps) {
  // 画像の読み込み状態を管理
  const [imageSrc, setImageSrc] = useState<any>(lazyLoad ? '' : src || '');
  const [isLoading, setIsLoading] = useState(lazyLoad || (!src && retryLoad));
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 遅延読み込み
  useEffect(() => {
    if (lazyLoad && src) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setImageSrc(src);
        setIsLoading(false);
      }, lazyDelay);

      return () => clearTimeout(timer);
    }
  }, [lazyLoad, lazyDelay, src]);

  // 画像再読み込み試行
  useEffect(() => {
    // 画像読み込みに失敗し、再試行が有効で、最大試行回数未満の場合
    if (loadFailed && retryLoad && retryCount < maxRetries) {
      setIsLoading(true);

      const timer = setTimeout(() => {
        // 画像URLにタイムスタンプを追加してキャッシュバスティング
        if (typeof src === 'string') {
          const bustCache = `${src}${src.includes('?') ? '&' : '?'}t=${Date.now()}`;
          setImageSrc(bustCache);
        } else {
          setImageSrc(src);
        }

        setRetryCount(retryCount + 1);
        setLoadFailed(false);
        setIsLoading(false);
      }, retryDelay);

      return () => clearTimeout(timer);
    }
  }, [loadFailed, retryLoad, retryCount, maxRetries, retryDelay, src]);

  // 画像が存在しない、または読み込み中の場合
  if (!imageSrc || isLoading) {
    return fallbackComponent ? (
      <>{fallbackComponent}</>
    ) : (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full">
        <span className="text-gray-500 text-xs">読み込み中...</span>
      </div>
    );
  }

  // 画像読み込みに失敗し、再試行も最大回数に達した場合
  if (loadFailed && retryCount >= maxRetries) {
    return fallbackComponent ? (
      <>{fallbackComponent}</>
    ) : (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full">
        <span className="text-gray-500 text-xs">No Image</span>
      </div>
    );
  }

  // srcが文字列でない場合は最適化を適用
  if (typeof imageSrc !== 'string') {
    return <Image src={imageSrc} alt={alt} loading={loading} {...props} />;
  }

  // 外部画像の判定
  const isExternalImage = (imageSrc: string): boolean => {
    if (!imageSrc || imageSrc === '') return false;

    return (
      // API-Football関連の画像
      imageSrc.includes('api-sports.io') ||
      imageSrc.includes('media-api') ||
      // SVGファイル
      imageSrc.endsWith('.svg') ||
      // 外部画像（内部画像は '/' から始まる）
      (!imageSrc.startsWith('/') && !imageSrc.startsWith('data:')) ||
      // 自社ドメイン以外
      !imageSrc.includes('.football-hub.')
    );
  };

  // 最適化の判定
  const unoptimized =
    disableOptimization !== undefined ? disableOptimization : isExternalImage(imageSrc);

  // エラーハンドラー
  const onError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 読み込み失敗状態をセット
    setLoadFailed(true);

    const target = e.currentTarget;
    const parent = target.parentElement;

    if (fallbackSrc) {
      target.src = fallbackSrc;
    } else if (props.onError) {
      props.onError(e);
    } else if (parent) {
      // 画像要素を非表示
      target.style.display = 'none';

      // 再試行中のプレースホルダーを表示
      if (retryLoad && retryCount < maxRetries) {
        if (!parent.querySelector('.image-placeholder')) {
          const placeholder = document.createElement('div');
          placeholder.className =
            'image-placeholder absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full';

          const text = document.createElement('span');
          text.className = 'text-gray-500 text-xs';
          text.textContent = '読み込み中...';

          placeholder.appendChild(text);
          parent.appendChild(placeholder);
        }
      } else {
        // 最大再試行回数に達した場合のプレースホルダー
        if (!parent.querySelector('.image-placeholder')) {
          const placeholder = document.createElement('div');
          placeholder.className =
            'image-placeholder absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full';

          const text = document.createElement('span');
          text.className = 'text-gray-500 text-xs';
          text.textContent = 'No Image';

          placeholder.appendChild(text);
          parent.appendChild(placeholder);
        } else {
          // 既存のプレースホルダーがあれば、テキストを更新
          const existingText = parent.querySelector('.image-placeholder span');
          if (existingText) {
            existingText.textContent = 'No Image';
          }
        }
      }
    }
  };

  return (
    <Image
      src={imageSrc}
      alt={alt}
      loading={loading}
      unoptimized={unoptimized}
      onError={onError}
      {...props}
    />
  );
}
