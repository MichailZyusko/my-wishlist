import { useIsFetching, useIsMutating } from '@tanstack/react-query';

export function GlobalLoader() {
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const isBusy = fetching + mutating > 0;

  if (!isBusy) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed left-0 top-0 z-[55] w-full">
      <div className="h-1 w-full bg-slate-200">
        <div className="h-full w-1/3 animate-progress bg-slate-900" />
      </div>
    </div>
  );
}
