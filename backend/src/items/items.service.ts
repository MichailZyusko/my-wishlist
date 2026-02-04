import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { buildReferralUrl } from './referral.util';

type CreateItemInput = {
  name: string;
  url: string;
};

type UpdateItemInput = {
  name?: string;
  url?: string;
};

@Injectable()
export class ItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  private getReferralUrl(url: string) {
    const refCode = this.config.get<string>('REF_CODE') ?? '';
    try {
      return buildReferralUrl(url, refCode);
    } catch (error) {
      throw new BadRequestException('Invalid item URL');
    }
  }

  async create(userId: string, wishlistId: string, data: CreateItemInput) {
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { id: wishlistId, userId },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    return this.prisma.item.create({
      data: {
        wishlistId,
        name: data.name,
        url: data.url,
        referralUrl: this.getReferralUrl(data.url),
      },
    });
  }

  async update(userId: string, itemId: string, data: UpdateItemInput) {
    const item = await this.prisma.item.findFirst({
      where: {
        id: itemId,
        wishlist: { userId },
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    const nextUrl = data.url ?? item.url;

    return this.prisma.item.update({
      where: { id: itemId },
      data: {
        name: data.name ?? item.name,
        url: nextUrl,
        referralUrl: this.getReferralUrl(nextUrl),
      },
    });
  }

  async remove(userId: string, itemId: string) {
    const item = await this.prisma.item.findFirst({
      where: { id: itemId, wishlist: { userId } },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return this.prisma.item.delete({ where: { id: itemId } });
  }
}
