import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { emitWishlistEvent } from '@/lib/wishlist-events';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { item: true },
  });
  if (!reservation) {
    return NextResponse.json(
      { error: 'Reservation not found' },
      { status: 404 },
    );
  }
  const deleted = await prisma.reservation.delete({
    where: { id },
  });

  // Notify every connected client watching this wishlist in real-time
  emitWishlistEvent(reservation.item.wishlistId, {
    type: 'reservation_cancelled',
    itemId: reservation.itemId,
  });

  return NextResponse.json(deleted);
}
