import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const wishlist = await prisma.wishlist.create({
    data: {
      title: body?.title ?? 'My Wishlist',
      description: body?.description ?? null,
      publicId: crypto.randomUUID(),
      userId: user.id,
    },
  });
  return NextResponse.json(wishlist);
}

export async function GET() {
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const wishlists = await prisma.wishlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: { reservation: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  return NextResponse.json(wishlists);
}
