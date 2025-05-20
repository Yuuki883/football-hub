/**
 * 試合詳細ローディングスケルトン
 * データ読み込み中に表示されるプレースホルダーUI
 */

import PageLayout from '@/components/layout/PageLayout';

/**
 * 試合詳細ローディングスケルトン
 * @returns ローディングスケルトンUI
 */
export function MatchSkeleton() {
  return (
    <PageLayout>
      <div className="animate-pulse">
        {/* ヘッダースケルトン */}
        <div className="bg-gray-200 p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-300 rounded-full mb-2"></div>
              <div className="h-6 w-32 bg-gray-300 rounded mb-1"></div>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-4 mb-2">
                <div className="h-10 w-10 bg-gray-300 rounded"></div>
                <div className="h-10 w-10 bg-gray-300 rounded"></div>
              </div>
              <div className="h-6 w-40 bg-gray-300 rounded"></div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-300 rounded-full mb-2"></div>
              <div className="h-6 w-32 bg-gray-300 rounded mb-1"></div>
            </div>
          </div>
        </div>

        {/* タブスケルトン */}
        <div className="flex border-b border-gray-200 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded-t-lg mr-2"></div>
          ))}
        </div>

        {/* コンテンツスケルトン */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-md"></div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
