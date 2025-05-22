/**
 * ユーザープロフィールのヘッダーコンポーネント
 * ユーザー名、メールアドレス、プロフィール画像を表示
 * 画像クリックでアップロード機能を提供
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { User } from '@prisma/client';

type ProfileHeaderProps = {
  user: User;
};

export default function ProfileHeader({ user: initialUser }: ProfileHeaderProps) {
  // ユーザー状態を管理（画像更新時に再レンダリングするため）
  const [user, setUser] = useState(initialUser);
  // ローディング状態の管理
  const [isUploading, setIsUploading] = useState(false);
  // エラーメッセージの管理
  const [error, setError] = useState<string | null>(null);
  // 実際の画像URL状態
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // ファイル入力用のref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // デフォルトのプロフィール画像
  const defaultImage = 'https://via.placeholder.com/150';

  // 初期ロード時とユーザー変更時に完全な画像を取得
  useEffect(() => {
    // ユーザーのセッション画像がBase64の断片（省略されている）場合、完全な画像を取得
    if (user.image && user.image.includes('...')) {
      fetchFullProfileImage();
    } else {
      setImageUrl(user.image || defaultImage);
    }
  }, [user.id, user.image]);

  // 完全なプロフィール画像を取得
  const fetchFullProfileImage = async () => {
    try {
      const response = await fetch('/api/user/profile-image');
      if (response.ok) {
        const data = await response.json();
        if (data.image) {
          setImageUrl(data.image);
        } else {
          setImageUrl(defaultImage);
        }
      } else {
        setImageUrl(defaultImage);
      }
    } catch (err) {
      console.error('プロフィール画像取得エラー:', err);
      setImageUrl(defaultImage);
    }
  };

  // 画像クリック時の処理
  const handleImageClick = () => {
    // ファイル入力をクリックする
    fileInputRef.current?.click();
  };

  // 画像選択時の処理
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      // ファイルをBase64に変換
      const base64Image = await convertFileToBase64(file);

      // APIに画像データを送信
      const response = await fetch('/api/user/upload-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: base64Image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'アップロードに失敗しました');
      }

      // 成功したら状態を更新（画像はAPIから返ってきたものを使用）
      setUser({
        ...user,
        image: data.image,
      });

      // 完全な画像をセット
      setImageUrl(base64Image);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました');
      console.error('画像アップロードエラー:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // ファイルをBase64に変換する関数
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div
          className={`relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg cursor-pointer ${isUploading ? 'opacity-70' : ''}`}
          onClick={handleImageClick}
          title="クリックして画像をアップロード"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          <Image
            src={imageUrl || defaultImage}
            alt={user.name || 'ユーザー'}
            fill
            className="object-cover"
            priority
          />
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <span className="text-white text-sm">アップロード中...</span>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{user.name || 'ユーザー'}</h1>
          <p className="text-blue-100">{user.email}</p>
          {error && <p className="text-red-300 text-sm mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
