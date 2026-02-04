'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { api, type Item, type Wishlist } from '@/lib/api';

export default function SharePage() {
  const params = useParams<{ publicId: string }>();
  const { pushToast } = useToast();
  const [pendingItem, setPendingItem] = useState<Item | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const {
    data: wishlist,
    isLoading,
    error,
  } = useQuery<Wishlist>({
    queryKey: ['public-wishlist', params?.publicId],
    queryFn: () => api.getPublicWishlist(params?.publicId ?? ''),
    enabled: Boolean(params?.publicId),
  });

  const reserveItem = useMutation({
    mutationFn: (payload: {
      itemId: string;
      referralUrl: string;
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
      window.location.href = payload.referralUrl;
    },
    onError: (err) => {
      pushToast({
        title: 'Unable to reserve item',
        description: (err as Error).message,
        variant: 'error',
      });
    },
  });

  const confirmReserve = () => {
    if (!pendingItem) {
      return;
    }
    reserveItem.mutate({
      itemId: pendingItem.id,
      referralUrl: pendingItem.referralUrl,
      reservedByName: name || undefined,
      reservedByEmail: email || undefined,
    });
    setPendingItem(null);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 animate-fade-in">
        <div className="mx-auto max-w-4xl">
          <Spinner label="Loading wishlist..." />
        </div>
      </main>
    );
  }

  if (!wishlist) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 animate-fade-in">
        <div className="mx-auto max-w-4xl text-sm text-red-600">
          {(error as Error)?.message || 'Wishlist not found.'}
        </div>
      </main>
    );
  }

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

        <div className="space-y-4">
          {wishlist.items.map((item) => {
            const isReserved = Boolean(item.reservation);
            return (
              <Card key={item.id} className="flex flex-col gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm text-slate-600 break-all">{item.url}</p>
                </div>
                {isReserved ? (
                  <div className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
                    Reserved by {item.reservation?.reservedByName || 'a friend'}
                  </div>
                ) : (
                  <Button
                    type="button"
                    onClick={() => setPendingItem(item)}
                    disabled={reserveItem.isPending}
                  >
                    {reserveItem.isPending ? 'Reserving...' : 'Reserve & shop'}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>
      <ConfirmDialog
        isOpen={Boolean(pendingItem)}
        title="Reserve this item?"
        description="We'll save your reservation and take you to the store."
        confirmLabel="Reserve & shop"
        onCancel={() => setPendingItem(null)}
        onConfirm={confirmReserve}
        isConfirming={reserveItem.isPending}
      />
    </main>
  );
}
