import React from 'react';

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  // 모바일 중심 다크 테마 강제
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="h-14 border-b border-[#262626] flex items-center justify-center px-4 sticky top-0 bg-[#0a0a0a] z-10">
        <h1 className="text-lg font-bold text-[#3b82f6]">Driver-Go</h1>
      </header>
      <main className="p-4 pb-20 overflow-y-auto">
        {children}
      </main>
      <nav className="fixed bottom-0 w-full h-16 border-t border-[#262626] bg-[#141414] flex justify-around items-center px-2">
        <button className="flex-1 h-full flex flex-col items-center justify-center text-[#3b82f6]">
          <span className="text-sm font-medium">Active</span>
        </button>
        <button className="flex-1 h-full flex flex-col items-center justify-center text-[#737373] hover:text-[#d4d4d4]">
          <span className="text-sm font-medium">Map</span>
        </button>
      </nav>
    </div>
  );
}
