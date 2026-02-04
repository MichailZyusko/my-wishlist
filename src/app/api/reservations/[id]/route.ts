import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const reservation = await prisma.reservation.findUnique({
    where: { id },
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
  return NextResponse.json(deleted);
}
