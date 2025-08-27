import * as React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      {children}
    </div>
  );
}
