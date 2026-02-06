import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ publicId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { publicId } = await params;
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
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }
  return NextResponse.json(wishlist);
}
