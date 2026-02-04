"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api, type Wishlist } from '@/lib/api';

type ItemForm = {
  name: string;
  url: string;
};

export default function WishlistDetailPage() {
  const params = useParams<{ id: string }>();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState } = useForm<ItemForm>();

  const loadWishlist = async () => {
    if (!params?.id) {
      return;
    }
    try {
      const data = await api.getWishlist(params.id);
      setWishlist(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, [params?.id]);

  const onSubmit = handleSubmit(async (data) => {
    if (!wishlist) {
      return;
    }
    setError(null);
    try {
      await api.addItem(wishlist.id, data);
      reset();
      await loadWishlist();
    } catch (err) {
      setError((err as Error).message);
    }
  });

  const removeItem = async (itemId: string) => {
    setError(null);
    try {
      await api.deleteItem(itemId);
      await loadWishlist();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!wishlist) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
        <div className="mx-auto max-w-4xl">Loading wishlist...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{wishlist.title}</h1>
            {wishlist.description && (
              <p className="text-sm text-slate-600">{wishlist.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard" className={buttonVariants({ variant: 'outline' })}>
              Back
            </Link>
            <Link href={`/share/${wishlist.publicId}`} className={buttonVariants({})}>
              Share
            </Link>
          </div>
        </div>

        <Card>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Item name</label>
                <Input {...register('name', { required: true })} placeholder="New headphones" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Store URL</label>
                <Input {...register('url', { required: true })} placeholder="https://store.com/item" />
              </div>
            </div>
            <Button type="submit" disabled={formState.isSubmitting}>
              Add item
            </Button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </Card>

        <div className="space-y-4">
          {wishlist.items.map((item) => (
            <Card key={item.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm text-slate-600 break-all">{item.url}</p>
                  <p className="text-xs text-slate-500 break-all">
                    Referral: {item.referralUrl}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => removeItem(item.id)}>
                  Remove
                </Button>
              </div>
              {item.reservation && (
                <div className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  Reserved by {item.reservation.reservedByName || 'a friend'}
                </div>
              )}
            </Card>
          ))}
          {wishlist.items.length === 0 && (
            <p className="text-sm text-slate-500">No items yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
