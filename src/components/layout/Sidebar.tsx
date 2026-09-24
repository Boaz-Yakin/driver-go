'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/dashboard' },
    { name: 'Deliveries', href: '/dashboard/deliveries' },
    { name: 'Drivers', href: '/dashboard/drivers' },
    { name: 'Live Map 🗺️', href: '/dashboard/map' },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-subtle h-screen hidden md:block">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary tracking-tight">Driver-Go</h2>
      </div>
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'text-primary bg-bg-elevated font-medium'
                      : 'text-secondary hover:text-primary hover:bg-bg-elevated'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
