/**
 * ログインページ
 */
import type { Metadata } from 'next';
import LoginForm from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'ログイン | FootBallHub',
  description: 'FootBallHubにログインして、すべての機能をご利用ください。',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-6 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          FootBallHub
        </h1>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
