import { createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

const DialogContext = createContext({
  open: false,
  onOpenChange: () => {},
});

function useDialogContext() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
}

export function Dialog({ open, onOpenChange, children }) {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogContent({ className = '', children, ...props }) {
  const { open, onOpenChange } = useDialogContext();

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={() => onOpenChange(false)}
    >
      <div
        className={cn(
          'w-full max-w-lg rounded-lg border bg-card text-card-foreground shadow-lg',
          'transition-all duration-150',
          className
        )}
        onClick={(event) => event.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ className = '', children, ...props }) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 border-b px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogTitle({ className = '', children, ...props }) {
  return (
    <h2
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function DialogDescription({ className = '', children, ...props }) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  );
}