'use client';

/**
 * 試合詳細ページレイアウト
 */

import React, { useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Fixture } from '../types';
import { MatchHeader } from './MatchHeader';
import SmartBreadcrumb from '@/components/common/Breadcrumb';
import StatsPanel from './StatsPanel';
import LineupPanel from './lineup';
import EventsPanel from './EventsPanel';
import { TABS } from '../constants/matches';

type TabType = 'stats' | 'lineups' | 'events';

interface MatchLayoutProps {
  fixture: Fixture;
  initialTab: string;
}

/**
 * 試合詳細ページレイアウト
 * @param fixture - 試合情報
 * @param initialTab - 初期選択タブ
 * @returns ページレイアウトUI
 */
export function MatchLayout({ fixture, initialTab }: MatchLayoutProps) {
  // 有効なタブIDかチェック
  const validTabIds = TABS.map((tab) => tab.id);
  const defaultTab = validTabIds.includes(initialTab as TabType)
    ? (initialTab as TabType)
    : 'stats';

  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const router = useRouter();
  const pathname = usePathname();

  /**
   * タブ切り替え処理
   * @param tabId - 切り替え先タブID
   */
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    router.push(`${pathname}?tab=${tabId}`, { scroll: false });
  };

  /**
   * タブコンテンツの表示
   * @returns タブコンテンツ
   */
  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return <StatsPanel fixture={fixture} />;
      case 'lineups':
        return <LineupPanel fixture={fixture} />;
      case 'events':
        return <EventsPanel fixture={fixture} />;
      default:
        return <StatsPanel fixture={fixture} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      <SmartBreadcrumb showLoadingState />
      <div className="container mx-auto my-3 sm:my-6">
        <MatchHeader fixture={fixture} />

        {/* タブナビゲーション */}
        <div className="flex justify-between sm:justify-start border-b border-gray-200 mt-4 sm:mt-8 mb-4 sm:mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`py-2 sm:py-3 px-2 sm:px-4 text-sm sm:text-base font-medium border-b-2 transition-colors whitespace-nowrap flex-1 sm:flex-initial
              ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange(tab.id as TabType)}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        <div className="pb-6">{renderTabContent()}</div>
      </div>
    </div>
  );
}
