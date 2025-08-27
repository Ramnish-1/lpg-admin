import * as React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h1>
      {children}
    </div>
  );
}
