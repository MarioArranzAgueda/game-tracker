'use client';

import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  linkHref?: string;
  linkText?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  linkHref,
  linkText,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 ${className}`}>
      <Icon className="w-12 h-12 text-slate-700 mx-auto" />
      <p className="text-slate-400">{title}</p>
      {description && (
        <p className="text-slate-500 text-sm">
          {description}
          {linkHref && linkText && (
            <>
              {' '}
              <Link href={linkHref} className="text-blue-400 hover:underline">
                {linkText}
              </Link>
            </>
          )}
        </p>
      )}
    </div>
  );
}
