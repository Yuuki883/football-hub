/**
 * ユーザー登録ページ
 */
import type { Metadata } from 'next';
import RegisterForm from '@/features/auth/components/RegisterForm';

export const metadata: Metadata = {
  title: 'アカウント登録 | FootballHub',
  description: 'FootballHubの新規アカウント登録ページです。',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">FootballHub</h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          アカウントを作成して、お気に入りのチームやリーグを登録しよう
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
