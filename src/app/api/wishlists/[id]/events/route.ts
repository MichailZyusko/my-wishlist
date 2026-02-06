import {
  wishlistEmitter,
  type WishlistEvent,
} from '@/lib/wishlist-events';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const channel = `wishlist:${id}`;
  const encoder = new TextEncoder();

  // Hoist so `cancel()` can access them for cleanup.
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let onEvent: ((event: WishlistEvent) => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (text: string) => controller.enqueue(encoder.encode(text));

      // Heartbeat every 30 s so proxies / browsers don't drop the connection.
      heartbeat = setInterval(() => {
        try {
          send(': heartbeat\n\n');
        } catch {
          // stream already closed – cancel() will tidy up.
        }
      }, 30_000);

      onEvent = (event: WishlistEvent) => {
        try {
          send(`data: ${JSON.stringify(event)}\n\n`);
        } catch {
          // stream already closed
        }
      };

      wishlistEmitter.on(channel, onEvent);
    },

    cancel() {
      // Called when the client disconnects or the response is aborted.
      if (heartbeat) clearInterval(heartbeat);
      if (onEvent) wishlistEmitter.off(channel, onEvent);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
