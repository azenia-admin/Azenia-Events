let pending: Promise<unknown> | null = null;

export function trackPendingWrite(promise: Promise<unknown>): Promise<unknown> {
  pending = promise.finally(() => {
    if (pending === promise) pending = null;
  });
  return pending;
}

export async function awaitPendingWrites(): Promise<void> {
  while (pending) {
    const current = pending;
    try { await current; } catch { /* ignore */ }
    if (pending === current) break;
  }
}
