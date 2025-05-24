'use client';

import { ReactNode } from 'react';
import SmartBreadcrumb from '@/components/common/Breadcrumb';

type PageLayoutProps = {
  children: ReactNode;
  showBreadcrumb?: boolean;
  className?: string;
};

export default function PageLayout({
  children,
  showBreadcrumb = true,
  className = '',
}: PageLayoutProps) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {showBreadcrumb && <SmartBreadcrumb showLoadingState />}
      {children}
    </div>
  );
}
