"use client";

import { GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGuest = () => {
    router.push('/share/demo');
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <div>
          <h1 className="text-4xl font-semibold">My Wishlist</h1>
          <p className="mt-3 text-lg text-slate-600">
            Create wishlists, share them with friends, and earn referral rewards.
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
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (!credentialResponse.credential) {
                  setError('Google login failed.');
                  return;
                }
                setLoading(true);
                setError(null);
                try {
                  const result = await api.authGoogle(credentialResponse.credential);
                  setToken(result.token);
                  router.push('/dashboard');
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  setLoading(false);
                }
              }}
              onError={() => setError('Google login failed.')}
            />

            <Button type="button" variant="outline" onClick={handleGuest}>
              View a shared wishlist
            </Button>
          </div>

          {loading && <p className="text-sm text-slate-500">Signing in...</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </Card>
      </div>
    </main>
  );
}
