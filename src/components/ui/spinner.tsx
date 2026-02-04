import { cn } from '@/lib/utils';

type SpinnerProps = {
  className?: string;
  label?: string;
};

export function Spinner({ className, label = 'Loading' }: SpinnerProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
      <span className="text-sm text-slate-500">{label}</span>
    </span>
  );
}
