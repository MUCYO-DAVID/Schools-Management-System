'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarLink {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface SidebarProps {
  links: SidebarLink[];
  onLinkClick?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ links, onLinkClick, isOpen = true }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 dark:bg-slate-900 border-r border-border transition-transform duration-300 ease-in-out lg:static lg:z-auto ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <nav className="h-full flex flex-col">
        {/* Sidebar header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-primary dark:text-blue-400">RSBS</h1>
        </div>

        {/* Navigation links */}
        <ul className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onLinkClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(link.href)
                    ? 'bg-primary text-white dark:bg-blue-600'
                    : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex-shrink-0 w-5 h-5">{link.icon}</span>
                <span className="text-sm font-medium">{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-border bg-slate-100 dark:bg-slate-800">
          <p className="text-xs text-muted-foreground text-center">© 2026 RSBS</p>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
