import * as React from 'react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  pushToast: (toast: Omit<ToastItem, 'id'>) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

const TOAST_ICONS: Record<ToastVariant, string> = {
  success: '✓',
  error: '!',
  info: 'i',
};

const TOAST_STYLES: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
  info: 'border-slate-200 bg-white text-slate-900',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const timeouts = React.useRef<Record<string, number>>({});

  const removeToast = React.useCallback((id: string) => {
    setToasts((items) => items.filter((item) => item.id !== id));
    const timeout = timeouts.current[id];
    if (timeout) {
      window.clearTimeout(timeout);
      delete timeouts.current[id];
    }
  }, []);

  const pushToast = React.useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = crypto.randomUUID();
      const item: ToastItem = { ...toast, id };
      setToasts((items) => [item, ...items].slice(0, 4));
      timeouts.current[id] = window.setTimeout(() => removeToast(id), 4200);
    },
    [removeToast],
  );

  React.useEffect(() => {
    return () => {
      Object.values(timeouts.current).forEach((timeout) =>
        window.clearTimeout(timeout),
      );
      timeouts.current = {};
    };
  }, []);

  return (
    <ToastContext.Provider value={{ pushToast }}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-3"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-lg border px-4 py-3 shadow-lg',
              'animate-slide-up',
              TOAST_STYLES[toast.variant],
            )}
          >
            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current text-xs font-semibold">
              {TOAST_ICONS[toast.variant]}
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-current/70">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-xs text-current/70 transition hover:text-current"
              aria-label="Dismiss"
            >
              Close
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
