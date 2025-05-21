import { useSession } from 'next-auth/react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

interface FavoriteButtonProps {
  isFavorite: boolean;
  isLoading: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({
  isFavorite,
  isLoading,
  onClick,
  size = 'md',
}: FavoriteButtonProps) {
  const { data: session } = useSession();

  // 未ログインの場合は何も表示しない
  if (!session?.user) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={clsx(
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'rounded-full p-1',
        isLoading && 'animate-pulse'
      )}
      aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
    >
      <Star
        className={clsx(
          sizeClasses[size],
          isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500 hover:text-yellow-500'
        )}
      />
    </button>
  );
}
