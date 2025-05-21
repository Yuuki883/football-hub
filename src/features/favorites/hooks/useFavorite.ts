import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// APIのベースURLは相対パスを使用（同一オリジン内での呼び出し）
const API_BASE_URL = '';

// リーグのお気に入り管理フック
export function useLeagueFavorite(leagueId: string, initialIsFavorite: boolean = false) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  // initialIsFavoriteが変更されたらisFavoriteを更新
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const toggleFavorite = async () => {
    if (!session?.user) {
      console.error('お気に入り登録にはログインが必要です');
      return;
    }

    setIsLoading(true);

    try {
      const method = isFavorite ? 'DELETE' : 'POST';

      const response = await fetch(`${API_BASE_URL}/api/favorites/league`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leagueId }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API エラーレスポンス:', result);

        // 404エラー（リーグが存在しない）の特別処理
        if (response.status === 404) {
          console.error(`指定されたリーグ(ID: ${leagueId})は登録されていません`);
          return;
        }

        throw new Error(result.details || result.error || 'お気に入り処理に失敗しました');
      }

      // 既に登録済みの場合も成功扱い
      if (result.exists) {
        console.log('既にお気に入りに登録されています');
        setIsFavorite(true);
        return;
      }

      setIsFavorite(!isFavorite);
      console.log(isFavorite ? 'お気に入りから削除しました' : 'お気に入りに追加しました');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました';
      console.error('お気に入り処理エラー:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { isFavorite, isLoading, toggleFavorite };
}

// チームのお気に入り管理フック
export function useTeamFavorite(teamId: string, initialIsFavorite: boolean = false) {
  const { data: session } = useSession();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  // initialIsFavoriteが変更されたらisFavoriteを更新
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const toggleFavorite = async () => {
    if (!session?.user) {
      console.error('お気に入り登録にはログインが必要です');
      return;
    }

    setIsLoading(true);

    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      console.log(`${method} リクエスト送信: /api/favorites/league`, { teamId });

      // リーグと同じAPIエンドポイント形式を使用
      const response = await fetch(`${API_BASE_URL}/api/favorites/team`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamId }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('API エラーレスポンス:', result);

        // 404エラー（チームが存在しない）の特別処理
        if (response.status === 404) {
          console.error(`指定されたチーム(ID: ${teamId})は登録されていません`);
          return;
        }

        throw new Error(result.details || result.error || 'お気に入り処理に失敗しました');
      }

      // 既に登録済みの場合も成功扱い
      if (result.exists) {
        console.log('既にお気に入りに登録されています');
        setIsFavorite(true);
        return;
      }

      setIsFavorite(!isFavorite);
      console.log(isFavorite ? 'お気に入りから削除しました' : 'お気に入りに追加しました');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました';
      console.error('お気に入り処理エラー:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { isFavorite, isLoading, toggleFavorite };
}
