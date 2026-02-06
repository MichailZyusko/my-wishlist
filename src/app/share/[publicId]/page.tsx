import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ShareClient from '@/components/share/share-client';
import type { Wishlist } from '@/lib/api';

type Params = { params: Promise<{ publicId: string }> };

export default async function SharePage({ params }: Params) {
  const { publicId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    const callbackUrl = `/share/${publicId}`;
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { publicId },
    include: {
      items: {
        include: { reservation: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!wishlist) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900 animate-fade-in">
        <div className="mx-auto max-w-4xl text-sm text-red-600">
          Wishlist not found.
        </div>
      </main>
    );
  }

  const serializedWishlist: Wishlist = {
    id: wishlist.id,
    title: wishlist.title,
    description: wishlist.description,
    publicId: wishlist.publicId,
    items: wishlist.items.map((item) => ({
      id: item.id,
      name: item.name,
      url: item.url,
      referralUrl: item.referralUrl,
      reservation: item.reservation
        ? {
            id: item.reservation.id,
            reservedByName: item.reservation.reservedByName ?? undefined,
            reservedByEmail: item.reservation.reservedByEmail ?? undefined,
            reservedAt: item.reservation.reservedAt.toISOString(),
          }
        : null,
    })),
  };

  return <ShareClient wishlist={serializedWishlist} />;
}
