'use client';

import Image, { ImageProps } from 'next/image';
import { ReactNode, useState, useEffect } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'unoptimized' | 'loading'> {
  fallbackSrc?: string;
  disableOptimization?: boolean;
  fallbackComponent?: ReactNode;
  lazyLoad?: boolean;
  lazyDelay?: number;
  loading?: 'lazy' | 'eager';
  retryLoad?: boolean;
  retryDelay?: number;
  maxRetries?: number;
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
  loading = 'lazy',
  priority = false,
  retryLoad = true,
  retryDelay = 3000,
  maxRetries = 2,
  ...props
}: OptimizedImageProps) {
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
    if (loadFailed && retryLoad && retryCount < maxRetries) {
      setIsLoading(true);

      const timer = setTimeout(() => {
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
      imageSrc.includes('api-sports.io') ||
      imageSrc.includes('media-api') ||
      imageSrc.endsWith('.svg') ||
      (!imageSrc.startsWith('/') && !imageSrc.startsWith('data:')) ||
      !imageSrc.includes('.football-hub.')
    );
  };

  // 最適化の判定
  const unoptimized =
    disableOptimization !== undefined ? disableOptimization : isExternalImage(imageSrc);

  // 画像読み込み成功ハンドラー
  const onLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    const parent = target.parentElement;

    if (parent) {
      // プレースホルダーが存在する場合は削除
      const placeholder = parent.querySelector('.image-placeholder');
      if (placeholder) {
        parent.removeChild(placeholder);
      }

      // 画像を表示状態に戻す
      target.style.display = '';
    }

    // 元のonLoadが指定されていれば実行
    if (props.onLoad) {
      props.onLoad(e);
    }
  };

  // エラーハンドラー
  const onError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setLoadFailed(true);

    const target = e.currentTarget;
    const parent = target.parentElement;

    if (fallbackSrc) {
      target.src = fallbackSrc;
    } else if (props.onError) {
      props.onError(e);
    } else if (parent) {
      target.style.display = 'none';

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
          const existingText = parent.querySelector('.image-placeholder span');
          if (existingText) {
            existingText.textContent = 'No Image';
          }
        }
      }
    }
  };

  const imgLoading = priority ? undefined : loading;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      loading={imgLoading}
      unoptimized={unoptimized}
      onError={onError}
      onLoad={onLoad}
      {...props}
    />
  );
}
