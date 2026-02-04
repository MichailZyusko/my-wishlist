'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/modal';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { api, type Item, type Wishlist } from '@/lib/api';

type ItemForm = {
  name: string;
  url: string;
};

export default function WishlistDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const [itemToRemove, setItemToRemove] = useState<Item | null>(null);
  const { register, handleSubmit, reset, formState } = useForm<ItemForm>();

  const {
    data: wishlist,
    isLoading,
    isFetching,
    error,
  } = useQuery<Wishlist>({
    queryKey: ['wishlist', params?.id],
    queryFn: () => api.getWishlist(params?.id ?? ''),
    enabled: Boolean(params?.id),
  });

  const addItem = useMutation({
    mutationFn: (payload: ItemForm) => api.addItem(params?.id ?? '', payload),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['wishlist', params?.id] });
      pushToast({
        title: 'Item added',
        description: 'Your item is now on the list.',
        variant: 'success',
      });
    },
    onError: (err) => {
      pushToast({
        title: 'Unable to add item',
        description: (err as Error).message,
        variant: 'error',
      });
    },
  });

  const deleteItem = useMutation({
    mutationFn: (itemId: string) => api.deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist', params?.id] });
      pushToast({
        title: 'Item removed',
        description: 'The item has been removed from the wishlist.',
        variant: 'info',
      });
    },
    onError: (err) => {
      pushToast({
        title: 'Unable to remove item',
        description: (err as Error).message,
        variant: 'error',
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    if (!params?.id) {
      return;
    }
    addItem.mutate(data);
  });

  const confirmRemove = () => {
    if (!itemToRemove) {
      return;
    }
    deleteItem.mutate(itemToRemove.id, {
      onSettled: () => setItemToRemove(null),
    });
  };

  const handleShare = async () => {
    if (!wishlist) {
      return;
    }
    const shareUrl = `${window.location.origin}/share/${wishlist.publicId}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      pushToast({
        title: 'Link copied',
        description: 'Share the wishlist with your friends.',
        variant: 'success',
      });
    } catch (err) {
      pushToast({
        title: 'Copy failed',
        description: (err as Error).message,
        variant: 'error',
      });
    }
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{wishlist.title}</h1>
            {wishlist.description && (
              <p className="text-sm text-slate-600">{wishlist.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className={buttonVariants({ variant: 'outline' })}
            >
              Back
            </Link>
            <Button type="button" onClick={handleShare}>
              Share
            </Button>
          </div>
        </div>

        <Card>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Item name
                </label>
                <Input
                  {...register('name', { required: true })}
                  placeholder="New headphones"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Store URL
                </label>
                <Input
                  {...register('url', { required: true })}
                  placeholder="https://store.com/item"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={formState.isSubmitting || addItem.isPending}
            >
              {addItem.isPending ? 'Adding...' : 'Add item'}
            </Button>
          </form>
          {addItem.isError && (
            <p className="mt-3 text-sm text-red-600">
              {(addItem.error as Error).message}
            </p>
          )}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setItemToRemove(item)}
                >
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
        {isFetching && (
          <p className="text-xs text-slate-500">Refreshing wishlist...</p>
        )}
      </div>
      <ConfirmDialog
        isOpen={Boolean(itemToRemove)}
        title="Remove this item?"
        description="This action cannot be undone."
        confirmLabel="Remove item"
        onCancel={() => setItemToRemove(null)}
        onConfirm={confirmRemove}
        isConfirming={deleteItem.isPending}
      />
    </main>
  );
}
