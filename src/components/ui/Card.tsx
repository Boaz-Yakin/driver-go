import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  return (
    <div className={`bg-surface border border-subtle rounded-lg p-4 sm:p-6 hover:border-default transition-colors ${className}`}>
      {children}
    </div>
  );
};
