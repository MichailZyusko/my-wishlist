"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api, type Wishlist } from '@/lib/api';

type WishlistForm = {
  title: string;
  description?: string;
};

export default function DashboardPage() {
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState } = useForm<WishlistForm>();

  const loadWishlists = async () => {
    try {
      const data = await api.listWishlists();
      setWishlists(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadWishlists();
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    try {
      await api.createWishlist({
        title: data.title,
        description: data.description,
      });
      reset();
      await loadWishlists();
    } catch (err) {
      setError((err as Error).message);
    }
  });

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div>
          <h1 className="text-3xl font-semibold">Your wishlists</h1>
          <p className="text-sm text-slate-600">
            Create a list, add items, and share it with friends.
          </p>
        </div>

        <Card>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">Title</label>
                <Input
                  {...register('title', { required: true })}
                  placeholder="Birthday wishlist"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <Input {...register('description')} placeholder="Optional notes" />
              </div>
            </div>
            <Button type="submit" disabled={formState.isSubmitting}>
              Create wishlist
            </Button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {wishlists.map((wishlist) => (
            <Card key={wishlist.id} className="space-y-3">
              <div>
                <h2 className="text-lg font-semibold">{wishlist.title}</h2>
                {wishlist.description && (
                  <p className="text-sm text-slate-600">{wishlist.description}</p>
                )}
              </div>
              <div className="text-sm text-slate-500">
                {wishlist.items.length} items
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/wishlists/${wishlist.id}`}
                  className={buttonVariants({ size: 'sm' })}
                >
                  Manage
                </Link>
                <Link
                  href={`/share/${wishlist.publicId}`}
                  className={buttonVariants({ size: 'sm', variant: 'outline' })}
                >
                  Share
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
