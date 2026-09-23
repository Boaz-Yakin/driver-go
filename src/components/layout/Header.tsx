'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { AuthService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';

export function Header({ title }: { title: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      router.push('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 border-b border-subtle bg-surface px-6 flex items-center justify-between sticky top-0 z-10">
      <h1 className="text-xl font-medium text-primary">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted">Admin User</span>
        <Button variant="ghost" onClick={handleLogout} className="text-sm">
          Logout
        </Button>
      </div>
    </header>
  );
}
