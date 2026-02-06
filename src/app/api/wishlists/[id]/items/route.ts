import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSessionUser } from '@/lib/auth';
import { buildReferralUrl } from '@/lib/referral';

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const user = await requireSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await request.json();
  const wishlist = await prisma.wishlist.findFirst({
    where: { id, userId: user.id },
  });
  if (!wishlist) {
    return NextResponse.json({ error: 'Wishlist not found' }, { status: 404 });
  }
  try {
    const referralUrl = buildReferralUrl(
      body?.url ?? '',
      process.env.REF_CODE ?? '',
    );
    const item = await prisma.item.create({
      data: {
        wishlistId: id,
        name: body?.name ?? 'Wishlist item',
        url: body?.url ?? '',
        referralUrl,
      },
    });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Invalid item URL' }, { status: 400 });
  }
}
