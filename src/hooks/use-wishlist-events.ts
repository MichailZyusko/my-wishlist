'use client';

import { useEffect, useRef } from 'react';
import type { WishlistEvent } from '@/lib/wishlist-events';

export type { WishlistEvent };

/**
 * Subscribe to real-time wishlist events via SSE.
 *
 * @param wishlistId  The wishlist to watch (must be the internal `id`, not `publicId`).
 * @param onEvent     Callback fired for every incoming event.
 */
export function useWishlistEvents(
  wishlistId: string | undefined,
  onEvent: (event: WishlistEvent) => void,
): void {
  // Keep callback ref stable so we don't re-create the EventSource when the
  // caller passes a new inline function on every render.
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    if (!wishlistId) return;

    const es = new EventSource(`/api/wishlists/${wishlistId}/events`);

    es.onmessage = (msg) => {
      try {
        const event: WishlistEvent = JSON.parse(msg.data);
        callbackRef.current(event);
      } catch {
        // ignore malformed messages
      }
    };

    es.onerror = () => {
      // EventSource will automatically reconnect; nothing extra needed.
    };

    return () => {
      es.close();
    };
  }, [wishlistId]);
}
