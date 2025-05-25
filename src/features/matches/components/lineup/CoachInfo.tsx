'use client';

import React from 'react';
import Image from 'next/image';
import { memo } from 'react';
import { Lineup } from '../../types';

/**
 * コーチ情報表示コンポーネント
 * チームのコーチ情報を表示する
 * @param side - 'home'なら画像の右、'away'なら画像の左にコーチ名
 */
const CoachInfo = memo(({ lineup, side = 'home' }: { lineup: Lineup; side?: 'home' | 'away' }) => {
  const coachName = lineup.coach?.name || '情報なし';
  const coachPhoto = lineup.coach?.photo || '';

  return (
    <div className={`flex items-center ${side === 'away' ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* コーチの写真 */}
      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
        {coachPhoto ? (
          <Image src={coachPhoto} alt={coachName} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
        )}
      </div>
      {/* コーチ名と役職 */}
      <div className={`ml-3 mr-3 ${side === 'away' ? 'text-right' : 'text-left'}`}>
        <p className="font-medium text-base leading-tight">{coachName}</p>
      </div>
    </div>
  );
});

CoachInfo.displayName = 'CoachInfo';

export default CoachInfo;
