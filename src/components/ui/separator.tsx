import * as React from 'react';
import { cn } from '@/lib/utils';

export function Separator({ className, orientation = 'horizontal', ...props }: React.HTMLAttributes<HTMLHRElement> & { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <hr
      className={cn(
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        'shrink-0 bg-border border-0',
        className
      )}
      {...props}
    />
  );
}
