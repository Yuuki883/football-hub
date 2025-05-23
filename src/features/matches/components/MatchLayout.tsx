'use client';

/**
 * 試合詳細ページレイアウト
 */

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Fixture } from '../types';
import { MatchHeader } from './MatchHeader';
import PageLayout from '@/components/layout/PageLayout';
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
    <PageLayout>
      <div className="container mx-auto my-8 px-4">
        <MatchHeader fixture={fixture} />

        {/* タブナビゲーション */}
        <div className="flex border-b border-gray-200 mt-8 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`py-3 px-4 font-medium border-b-2 transition-colors
              ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange(tab.id as TabType)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        <div>{renderTabContent()}</div>
      </div>
    </PageLayout>
  );
}
