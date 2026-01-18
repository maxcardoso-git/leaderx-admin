'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="ml-[280px] min-h-screen flex flex-col w-[calc(100vw-280px)]">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-x-hidden overflow-y-auto">
          <div className="animate-fade-in max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
