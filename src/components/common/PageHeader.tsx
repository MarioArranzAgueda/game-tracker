'use client';

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}>
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          {icon && <span className="text-slate-400">{icon}</span>}
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        {description && (
          <p className="text-slate-400">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          {actions}
        </div>
      )}
    </header>
  );
}
