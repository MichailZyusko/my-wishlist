'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/toast';
import { api } from '@/lib/api';

type WishlistForm = {
  title: string;
  description?: string;
};

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const { pushToast } = useToast();
  const { register, handleSubmit, reset, formState } = useForm<WishlistForm>();

  const {
    data: wishlists = [],
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['wishlists'],
    queryFn: api.listWishlists,
  });

  const createWishlist = useMutation({
    mutationFn: api.createWishlist,
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ['wishlists'] });
      pushToast({
        title: 'Wishlist created',
        description: 'Your new list is ready to add items.',
        variant: 'success',
      });
    },
    onError: (err) => {
      pushToast({
        title: 'Could not create wishlist',
        description: (err as Error).message,
        variant: 'error',
      });
    },
  });

  const onSubmit = handleSubmit((data) => {
    createWishlist.mutate({
      title: data.title,
      description: data.description,
    });
  });

  const errorMessage =
    (createWishlist.error as Error)?.message || (error as Error)?.message;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 animate-fade-in">
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
                <label className="text-sm font-medium text-slate-700">
                  Title
                </label>
                <Input
                  {...register('title', { required: true })}
                  placeholder="Birthday wishlist"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <Input
                  {...register('description')}
                  placeholder="Optional notes"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={formState.isSubmitting || createWishlist.isPending}
            >
              {createWishlist.isPending ? 'Creating...' : 'Create wishlist'}
            </Button>
          </form>
          {errorMessage && (
            <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
          )}
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {isLoading && (
            <Card className="flex items-center gap-3 text-sm text-slate-500">
              <Spinner label="Loading wishlists..." />
            </Card>
          )}
          {!isLoading &&
            wishlists.map((wishlist) => (
              <Card key={wishlist.id} className="space-y-3">
                <div>
                  <h2 className="text-lg font-semibold">{wishlist.title}</h2>
                  {wishlist.description && (
                    <p className="text-sm text-slate-600">
                      {wishlist.description}
                    </p>
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
        {isFetching && !isLoading && (
          <p className="text-xs text-slate-500">Refreshing wishlists...</p>
        )}
      </div>
    </main>
  );
}
