import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSessionUser } from '@/lib/auth';
import { buildReferralUrl } from '@/lib/referral';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const item = await prisma.item.findFirst({
    where: { id, wishlist: { userId: user.id } },
  });
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
  try {
    const nextUrl = body?.url ?? item.url;
    const referralUrl = buildReferralUrl(nextUrl, process.env.REF_CODE ?? '');
    const updated = await prisma.item.update({
      where: { id },
      data: {
        name: body?.name ?? item.name,
        url: nextUrl,
        referralUrl,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid item URL' }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const item = await prisma.item.findFirst({
    where: { id, wishlist: { userId: user.id } },
  });
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }
  const deleted = await prisma.item.delete({ where: { id } });
  return NextResponse.json(deleted);
}
