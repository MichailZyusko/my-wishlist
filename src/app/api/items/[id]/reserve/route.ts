import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const item = await prisma.item.findUnique({
    where: { id },
    include: { reservation: true },
  });
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
  if (item.reservation) {
    return NextResponse.json(
      { error: 'Item already reserved' },
      { status: 409 },
    );
  }
  const reservation = await prisma.reservation.create({
    data: {
      itemId: id,
      reservedByName: body?.reservedByName ?? null,
      reservedByEmail: body?.reservedByEmail ?? null,
    },
  });
  return NextResponse.json(reservation);
}
