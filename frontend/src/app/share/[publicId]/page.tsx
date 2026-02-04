"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api, type Wishlist } from '@/lib/api';

export default function SharePage() {
  const params = useParams<{ publicId: string }>();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const loadWishlist = async () => {
    if (!params?.publicId) {
      return;
    }
    try {
      const data = await api.getPublicWishlist(params.publicId);
      setWishlist(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [params?.publicId]);

  const reserveAndShop = async (itemId: string, referralUrl: string) => {
    setError(null);
    try {
      await api.reserveItem(itemId, {
        reservedByName: name || undefined,
        reservedByEmail: email || undefined,
      });
      window.location.href = referralUrl;
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!wishlist) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <div className="mx-auto max-w-4xl">
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <p className="text-sm text-slate-500">Loading wishlist...</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
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
              <label className="text-sm font-medium text-slate-700">Your name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Your email</label>
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
                    onClick={() => reserveAndShop(item.id, item.referralUrl)}
                  >
                    Reserve & shop
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
