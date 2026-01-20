'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { SidebarProvider } from './SidebarContext';
import { ThemeInjector } from './ThemeInjector';
import { ToastProvider } from '@/components/ui/Toast';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Custom Theme CSS */}
      <ThemeInjector />

      {/* Sidebar - part of the flex layout, pushes content */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen flex flex-col">
        {/* Top Bar */}
        <TopBar />

        {/* Page Content with proper spacing */}
        <main
          className="flex-1 overflow-y-auto"
          style={{ padding: '40px 64px' }}
        >
          <div className="max-w-[1400px]" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ToastProvider>
      <SidebarProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SidebarProvider>
    </ToastProvider>
  );
}
