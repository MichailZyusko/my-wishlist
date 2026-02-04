import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSessionUser } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const wishlist = await prisma.wishlist.findFirst({
    where: { id, userId: user.id },
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
