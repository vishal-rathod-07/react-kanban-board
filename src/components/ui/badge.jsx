import { cn } from '../../lib/utils';

const variantStyles = {
  default:
    'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
  secondary:
    'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'text-foreground',
  destructive:
    'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
};

export function Badge({ className = '', variant = 'default', ...props }) {
  const variantClass = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantClass,
        className
      )}
      {...props}
    />
  );
}