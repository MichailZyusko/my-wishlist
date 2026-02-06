'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Index() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      router.replace('/dashboard');
    }
  }, [router, session?.user]);

  const handleGuest = () => {
    router.push('/share/demo');
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900 animate-fade-in">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <div>
          <h1 className="text-4xl font-semibold">My Wishlist</h1>
          <p className="mt-3 text-lg text-slate-600">
            Create wishlists, share them with friends, and earn referral
            rewards.
          </p>
        </div>

        <Card className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Sign in to get started</h2>
            <p className="text-sm text-slate-600">
              Use Google to manage your wishlists and track reservations.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              type="button"
              onClick={() => signIn('google')}
              disabled={!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
            >
              Sign in with Google
            </Button>

            <Button type="button" variant="outline" onClick={handleGuest}>
              View a shared wishlist
            </Button>
          </div>

          {session?.user && (
            <p className="text-sm text-slate-500">
              Signed in as {session.user.email}
            </p>
          )}
        </Card>
      </div>
    </main>
  );
}
