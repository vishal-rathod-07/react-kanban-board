import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

export const ScrollArea = forwardRef(function ScrollArea(
  { className = '', children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn('relative overflow-y-auto', className)}
      {...props}
    >
      {children}
    </div>
  );
});