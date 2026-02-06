'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { api, type Item, type Wishlist } from '@/lib/api';
import {
  useWishlistEvents,
  type WishlistEvent,
} from '@/hooks/use-wishlist-events';

type ShareClientProps = {
  wishlist: Wishlist;
};

type LinkPreview = {
  title?: string;
  image?: string;
};

export default function ShareClient({ wishlist }: ShareClientProps) {
  const { pushToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [previews, setPreviews] = useState<Record<string, LinkPreview>>({});
  const previewsRef = useRef(previews);

  // Local items state so SSE events can update reservations in real-time
  const [items, setItems] = useState<Item[]>(wishlist.items);

  const handleWishlistEvent = useCallback((event: WishlistEvent) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== event.itemId) return item;
        if (event.type === 'reservation_created') {
          return { ...item, reservation: event.reservation };
        }
        return { ...item, reservation: null };
      }),
    );
  }, []);

  useWishlistEvents(wishlist.id, handleWishlistEvent);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    let cancelled = false;
    const loadPreview = async (item: Item) => {
      if (!item.url || previewsRef.current[item.id]) {
        return;
      }
      try {
        const response = await fetch(
          `/api/link-preview?url=${encodeURIComponent(item.url)}`,
        );
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as LinkPreview;
        if (!cancelled) {
          setPreviews((prev) => ({ ...prev, [item.id]: data }));
        }
      } catch {
        // Ignore preview failures.
      }
    };

    items.forEach(loadPreview);

    return () => {
      cancelled = true;
    };
  }, [items]);

  const reserveItem = useMutation({
    mutationFn: (payload: {
      itemId: string;
      url: string;
      reservedByName?: string;
      reservedByEmail?: string;
    }) =>
      api.reserveItem(payload.itemId, {
        reservedByName: payload.reservedByName,
        reservedByEmail: payload.reservedByEmail,
      }),
    onSuccess: (_, payload) => {
      pushToast({
        title: 'Reservation confirmed',
        description: 'Redirecting you to the store.',
        variant: 'success',
      });
      window.location.href = payload.url;
    },
    onError: (err) => {
      pushToast({
        title: 'Unable to reserve item',
        description: (err as Error).message,
        variant: 'error',
      });
    },
  });

  const handleCardClick = (item: Item) => {
    if (reserveItem.isPending) {
      return;
    }
    if (!item.url) {
      return;
    }
    if (item.reservation) {
      window.location.href = item.url;
      return;
    }
    reserveItem.mutate({
      itemId: item.id,
      url: item.url,
      reservedByName: name || undefined,
      reservedByEmail: email || undefined,
    });
  };

  const handleCardKeyDown = (event: KeyboardEvent, item: Item) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCardClick(item);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 animate-fade-in">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold">{wishlist.title}</h1>
          {wishlist.description && (
            <p className="text-sm text-slate-600">{wishlist.description}</p>
          )}
        </div>

        <Card>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Your name
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Your email
              </label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            This info is optional and helps the owner know who reserved an item.
          </p>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => {
            const isReserved = Boolean(item.reservation);
            const preview = previews[item.id];
            return (
              <Card
                key={item.id}
                className="grid cursor-pointer gap-4 transition hover:border-slate-300 hover:bg-slate-50 sm:grid-cols-[180px_1fr]"
                role="link"
                tabIndex={0}
                onClick={() => handleCardClick(item)}
                onKeyDown={(event) => handleCardKeyDown(event, item)}
              >
                <div className={`relative overflow-hidden rounded-md sm:h-full sm:min-h-[120px] ${preview?.image ? '' : 'bg-slate-100'}`}>
                  {preview?.image ? (
                    <Image
                      src={preview.image}
                      alt={preview.title || item.name}
                      fill
                      className="object-contain"
                      unoptimized
                      sizes="(min-width: 640px) 180px, 100vw"
                    />
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center text-xs text-slate-400 sm:h-full">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 pb-1">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    {preview?.title && (
                      <p className="text-sm text-slate-700">{preview.title}</p>
                    )}
                    <p className="text-sm text-slate-600 break-all">{item.url}</p>
                  </div>
                  {isReserved ? (
                    <div className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
                      Reserved by {item.reservation?.reservedByName || 'a friend'}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Click to reserve and open the store.
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
