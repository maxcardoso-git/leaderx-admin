'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SidebarProvider } from './SidebarContext';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - part of the flex layout, pushes content */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content with proper spacing */}
        <main className="flex-1 p-10 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
