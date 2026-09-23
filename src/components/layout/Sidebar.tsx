import React from 'react';
import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="w-64 bg-surface border-r border-subtle h-screen hidden md:block">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary tracking-tight">Driver-Go</h2>
      </div>
      <nav className="mt-6">
        <ul className="space-y-2 px-4">
          <li>
            <Link href="/dashboard" className="block px-4 py-2 text-sm text-primary bg-bg-elevated rounded-md font-medium">
              Overview
            </Link>
          </li>
          <li>
            <Link href="/dashboard/deliveries" className="block px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-bg-elevated rounded-md transition-colors">
              Deliveries
            </Link>
          </li>
          <li>
            <Link href="/dashboard/drivers" className="block px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-bg-elevated rounded-md transition-colors">
              Drivers
            </Link>
          </li>
          <li>
            <Link href="/dashboard/map" className="block px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-bg-elevated rounded-md transition-colors">
              Live Map 🗺️
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
