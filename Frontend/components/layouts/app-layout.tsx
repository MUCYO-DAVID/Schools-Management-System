'use client';

import React, { useState } from 'react';
import Sidebar from './sidebar';
import Topbar from './topbar';

interface SidebarLink {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  sidebarLinks: SidebarLink[];
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AppLayout({ children, sidebarLinks, breadcrumbs }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        links={sidebarLinks} 
        onLinkClick={handleSidebarClose}
        isOpen={sidebarOpen}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          breadcrumbs={breadcrumbs}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="min-h-full">{children}</div>
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleSidebarClose}
        />
      )}
    </div>
  );
}

export default AppLayout;
