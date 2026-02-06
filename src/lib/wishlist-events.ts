import { EventEmitter } from 'node:events';
import type { Reservation } from '@/lib/api';

export type WishlistEvent =
  | {
    type: 'reservation_created';
    itemId: string;
    reservation: Reservation;
  }
  | {
    type: 'reservation_cancelled';
    itemId: string;
  };

// Singleton emitter reused across all API routes in the same process.
// In development Next.js can re-evaluate modules, so attach to `globalThis`.
const globalForEmitter = globalThis as unknown as {
  __wishlistEmitter?: EventEmitter;
};

if (!globalForEmitter.__wishlistEmitter) {
  globalForEmitter.__wishlistEmitter = new EventEmitter();
}

export const wishlistEmitter: EventEmitter =
  globalForEmitter.__wishlistEmitter;

// Allow many concurrent SSE listeners (one per open tab/client)
wishlistEmitter.setMaxListeners(200);

/** Broadcast an event to every client watching a specific wishlist. */
export function emitWishlistEvent(
  wishlistId: string,
  event: WishlistEvent,
): void {
  wishlistEmitter.emit(`wishlist:${wishlistId}`, event);
}
